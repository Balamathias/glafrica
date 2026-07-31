import re
from collections.abc import Iterator
from typing import Any

from django.conf import settings
from django.db.models import Max, Min, Q
from openai import OpenAI

from ..models import Category, Egg, EggCategory, Livestock

# Type alias for conversation messages
ConversationMessage = dict[str, str]  # {"role": "user" | "assistant", "content": str}


# Words that signal a species. Grouped by species so a query can be constrained
# to the categories that actually hold that species — category names in the DB
# are singular and inconsistent ("Goat", "Chicken", "Fowl", "Fishes"), so these
# are resolved against real Category rows at query time rather than matched by
# name. Purpose words ("dairy", "meat") are deliberately NOT here: a dairy goat
# is not a cow, and treating "dairy" as a cattle signal cross-contaminates
# every small-ruminant query.
SPECIES_SYNONYMS: dict[str, set[str]] = {
    "goat": {"goat", "buck", "doe", "kid", "caprine", "boer", "kalahari", "sahel"},
    "cattle": {"cattle", "cow", "bull", "calf", "calves", "beef", "heifer", "bovine", "steer"},
    "sheep": {"sheep", "ram", "ewe", "lamb", "mutton", "ovine"},
    "poultry": {
        "poultry",
        "chicken",
        "hen",
        "rooster",
        "cockerel",
        "broiler",
        "layer",
        "fowl",
        "chick",
        "noiler",
        "kuroiler",
        "pullet",
    },
    "fish": {"fish", "tilapia", "catfish", "fingerling", "aquaculture"},
    "pig": {"pig", "swine", "hog", "sow", "boar", "piglet", "porcine"},
}

# Purpose / use-case words. These rank results but never restrict species.
PURPOSE_KEYWORDS = {"dairy", "milk", "milking", "meat", "breeding", "stud", "pet", "show"}

# Generic words that must never drive a match on their own. Without this,
# "high-yield dairy goats" matches any listing whose description contains
# "high" — which is how a tilapia ended up under a dairy goat search.
SEARCH_STOPWORDS = {
    "high",
    "low",
    "good",
    "best",
    "great",
    "nice",
    "big",
    "small",
    "large",
    "yield",
    "yielding",
    "quality",
    "want",
    "need",
    "looking",
    "find",
    "show",
    "get",
    "buy",
    "sale",
    "sell",
    "available",
    "any",
    "some",
    "very",
    "more",
    "most",
    "new",
    "old",
    "and",
    "the",
    "for",
    "with",
    "from",
    "that",
    "this",
    "you",
    "your",
    "are",
    "how",
    "much",
    "many",
    "what",
    "which",
    "where",
}


def _normalise_token(word: str) -> str:
    """
    Reduce a word to a comparable stem so query words line up with DB category
    names: goats -> goat, fishes -> fish, chickens -> chicken.
    """
    w = re.sub(r"[^a-z]", "", word.lower())
    if len(w) > 4 and w.endswith("es"):
        return w[:-2]
    if len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
        return w[:-1]
    return w


def _tokenise(text: str) -> list[str]:
    """
    Word-boundary tokens. Substring matching is not safe here — "hen" occurs
    inside "when", "ram" inside "program", "doe" inside "does" — and previously
    caused phantom gender and species matches.
    """
    return re.findall(r"[a-z]+", text.lower())


class AIService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        self.model = "gemini-2.5-flash"
        self.embedding_model = "gemini-embedding-001"

    def get_embedding(self, text: str) -> list[float]:
        """
        Generate embedding for a given text.
        TODO: Use when pgvector is ready
        """
        try:
            response = self.client.embeddings.create(input=text, model=self.embedding_model)
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    def _detect_query_intent(self, query: str) -> dict[str, bool]:
        """
        Detect whether the query is about livestock, eggs, or both.
        Returns a dict indicating which product types to search.
        """
        query_lower = query.lower()

        # Egg-specific keywords
        egg_keywords = [
            "egg",
            "eggs",
            "crate",
            "tray",
            "dozen",
            "hatching",
            "fertilized",
            "fresh eggs",
            "organic eggs",
            "free range",
            "table eggs",
            "laying",
            "yolk",
            "shell",
            "incubation",
        ]

        # Livestock-specific keywords (excluding birds that could mean eggs)
        livestock_only_keywords = [
            "cattle",
            "cow",
            "cows",
            "bull",
            "bulls",
            "calf",
            "calves",
            "beef",
            "goat",
            "goats",
            "buck",
            "doe",
            "kid",
            "boer",
            "kalahari",
            "sheep",
            "ram",
            "ewe",
            "lamb",
            "lambs",
            "wool",
            "pig",
            "pigs",
            "swine",
            "hog",
            "sow",
            "piglet",
            "pork",
            "livestock",
            "animal",
            "animals",
            "breeding stock",
            "herd",
        ]

        # Poultry keywords that could mean either live birds OR eggs
        poultry_keywords = [
            "chicken",
            "chickens",
            "poultry",
            "hen",
            "rooster",
            "cockerel",
            "turkey",
            "turkeys",
            "duck",
            "ducks",
            "quail",
            "guinea fowl",
            "broiler",
            "layer",
            "noiler",
        ]

        has_egg_keywords = any(kw in query_lower for kw in egg_keywords)
        has_livestock_keywords = any(kw in query_lower for kw in livestock_only_keywords)
        has_poultry_keywords = any(kw in query_lower for kw in poultry_keywords)

        # Determine intent
        if has_egg_keywords:
            # Explicit egg search
            return {"livestock": False, "eggs": True}
        elif has_livestock_keywords:
            # Explicit livestock search
            return {"livestock": True, "eggs": False}
        elif has_poultry_keywords:
            # Poultry could mean either - search both
            return {"livestock": True, "eggs": True}
        else:
            # General query - search both
            return {"livestock": True, "eggs": True}

    def _extract_search_terms(self, query: str) -> dict[str, Any]:
        """
        Extract meaningful search terms from a natural language query.
        Returns a dict with extracted criteria.
        """
        query_lower = query.lower()
        tokens = _tokenise(query_lower)
        stems = {_normalise_token(t) for t in tokens}

        # Breed keywords (common breeds)
        breed_keywords = [
            "boer",
            "kalahari",
            "red",
            "sokoto",
            "west african dwarf",
            "wad",
            "brahman",
            "white fulani",
            "ndama",
            "muturu",
            "bunaji",
            "dorper",
            "balami",
            "yankasa",
            "uda",
            "noiler",
            "broiler",
            "layer",
            "cockerel",
            "large white",
            "landrace",
            "duroc",
        ]

        # Gender keywords
        gender_map = {
            "male": ["male", "buck", "bull", "ram", "boar", "rooster", "cock", "he"],
            "female": ["female", "doe", "cow", "ewe", "sow", "hen", "she"],
        }

        # Quality/health keywords
        quality_keywords = [
            "healthy",
            "vaccinated",
            "premium",
            "quality",
            "investment",
            "breeding",
            "purebred",
            "pure",
            "registered",
            "certified",
            "organic",
        ]

        extracted = {
            "species": [],
            "category_ids": [],
            "breeds": [],
            "gender": None,
            "quality_terms": [],
            "purpose_terms": [],
            "price_range": None,
            "location_terms": [],
            "general_terms": [],
        }

        # Detect species from whole words, then resolve to the Category rows
        # that actually exist. Matching keyword text against category names
        # directly does not work: "goats" never icontains-matches "Goat".
        for species, synonyms in SPECIES_SYNONYMS.items():
            synonym_stems = {_normalise_token(s) for s in synonyms}
            if stems & synonym_stems:
                extracted["species"].append(species)

        if extracted["species"]:
            extracted["category_ids"] = self._categories_for_species(extracted["species"])

        # Extract breeds (multi-word breeds still need a substring test)
        for breed in breed_keywords:
            if " " in breed:
                if breed in query_lower:
                    extracted["breeds"].append(breed)
            elif _normalise_token(breed) in stems:
                extracted["breeds"].append(breed)

        # Extract gender
        for gender, keywords in gender_map.items():
            if stems & {_normalise_token(k) for k in keywords}:
                extracted["gender"] = "M" if gender == "male" else "F"
                break

        # Extract quality terms
        for term in quality_keywords:
            if _normalise_token(term) in stems:
                extracted["quality_terms"].append(term)

        # Extract purpose terms — these rank, they never restrict
        for term in PURPOSE_KEYWORDS:
            if _normalise_token(term) in stems:
                extracted["purpose_terms"].append(term)

        # Extract price range hints
        price_match = re.search(r"under\s*(\d+[k,]?\d*)", query_lower)
        if price_match:
            price_str = price_match.group(1).replace("k", "000").replace(",", "")
            try:
                extracted["price_range"] = ("max", int(price_str))
            except ValueError:
                pass

        price_match = re.search(r"above\s*(\d+[k,]?\d*)", query_lower)
        if price_match:
            price_str = price_match.group(1).replace("k", "000").replace(",", "")
            try:
                extracted["price_range"] = ("min", int(price_str))
            except ValueError:
                pass

        # Extract location terms (Nigerian states/cities)
        nigerian_locations = [
            "lagos",
            "abuja",
            "kano",
            "ibadan",
            "kaduna",
            "port harcourt",
            "benin",
            "maiduguri",
            "zaria",
            "aba",
            "jos",
            "ilorin",
            "oyo",
            "enugu",
            "abeokuta",
            "sokoto",
            "onitsha",
            "warri",
            "calabar",
            "uyo",
            "asaba",
            "owerri",
        ]
        for loc in nigerian_locations:
            if loc in query_lower:
                extracted["location_terms"].append(loc)

        # Keep remaining significant words as general terms
        stopwords = {
            "a",
            "an",
            "the",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "must",
            "shall",
            "can",
            "need",
            "dare",
            "ought",
            "used",
            "to",
            "of",
            "in",
            "for",
            "on",
            "with",
            "at",
            "by",
            "from",
            "as",
            "into",
            "through",
            "during",
            "before",
            "after",
            "above",
            "below",
            "between",
            "under",
            "again",
            "further",
            "then",
            "once",
            "here",
            "there",
            "when",
            "where",
            "why",
            "how",
            "all",
            "each",
            "few",
            "more",
            "most",
            "other",
            "some",
            "such",
            "no",
            "nor",
            "not",
            "only",
            "own",
            "same",
            "so",
            "than",
            "too",
            "very",
            "just",
            "and",
            "but",
            "if",
            "or",
            "because",
            "until",
            "while",
            "although",
            "find",
            "me",
            "show",
            "get",
            "looking",
            "want",
            "search",
            "give",
            "tell",
            "about",
            "what",
            "which",
            "any",
            "good",
            "best",
            "i",
            "my",
            "your",
            "like",
            "please",
        }
        # Anything already understood as species, breed, quality or purpose is
        # not a leftover term. Generic filler ("high", "yield", "best") is
        # dropped too — on its own it matches half the catalogue.
        consumed = set()
        for synonyms in SPECIES_SYNONYMS.values():
            consumed |= {_normalise_token(s) for s in synonyms}
        consumed |= {_normalise_token(b) for b in extracted["breeds"]}
        consumed |= {_normalise_token(q) for q in extracted["quality_terms"]}
        consumed |= {_normalise_token(p) for p in extracted["purpose_terms"]}
        consumed |= {_normalise_token(loc) for loc in extracted["location_terms"]}
        consumed |= {_normalise_token(s) for s in SEARCH_STOPWORDS}

        for word in tokens:
            if len(word) <= 2 or word in stopwords:
                continue
            stem = _normalise_token(word)
            if stem in consumed or stem in extracted["general_terms"]:
                continue
            extracted["general_terms"].append(stem)

        return extracted

    def _categories_for_species(self, species_keys: list[str]) -> list[Any]:
        """
        Map species keys onto the Category rows that actually exist. Category
        names are singular and irregular ("Goat", "Fowl", "Fishes"), so match on
        normalised stems against both the species key and its synonyms.
        """
        matched = []
        for category in Category.objects.all():
            name_stem = _normalise_token(category.name)
            for species in species_keys:
                synonym_stems = {_normalise_token(s) for s in SPECIES_SYNONYMS.get(species, set())}
                synonym_stems.add(_normalise_token(species))
                if name_stem in synonym_stems:
                    matched.append(category.pk)
                    break
        return matched

    # Field weights for relevance scoring. A hit on the breed or name says far
    # more about relevance than a stray word in a description paragraph.
    FIELD_WEIGHTS = {
        "name": 6,
        "breed": 6,
        "tags": 4,
        "category": 3,
        "location": 3,
        "description": 1,
        "health_status": 1,
    }
    # Below this, a row is noise rather than a match.
    MIN_RELEVANCE = 3

    def semantic_search(self, query: str, limit: int = 10) -> list[Livestock]:
        """
        Rank livestock against a natural-language query.

        Species is a hard constraint when the query names one: a search for
        dairy goats must never return a tilapia, however many adjectives the
        two listings happen to share. Everything else contributes to a
        relevance score, and rows scoring below MIN_RELEVANCE are dropped
        rather than padded out with unrelated recent listings.

        TODO: Uncomment vector search when pgvector is ready:
        # vector = self.get_embedding(query)
        # if vector:
        #     return Livestock.objects.order_by(
        #         Livestock.embedding.cosine_distance(vector)
        #     )[:limit]
        """
        if not query or not query.strip():
            return []

        terms = self._extract_search_terms(query)

        queryset = (
            Livestock.objects.filter(is_sold=False)
            .select_related("category")
            .prefetch_related("media", "tags")
        )

        # Hard constraints — these express what the farmer actually asked for.
        if terms["species"]:
            if not terms["category_ids"]:
                # A species was named but nothing in the catalogue holds it.
                return []
            queryset = queryset.filter(category_id__in=terms["category_ids"])

        if terms["gender"]:
            queryset = queryset.filter(Q(gender=terms["gender"]) | Q(gender="mixed"))

        if terms["price_range"]:
            range_type, amount = terms["price_range"]
            if range_type == "max":
                queryset = queryset.filter(Q(price__lte=amount) | Q(price__isnull=True))
            else:
                queryset = queryset.filter(Q(price__gte=amount) | Q(price__isnull=True))

        candidates = list(queryset[:200])
        scored = [
            (score, item)
            for score, item in ((self._relevance(item, terms), item) for item in candidates)
            if score >= self.MIN_RELEVANCE
        ]

        # If the query only named a species ("goats"), the species filter has
        # already done the work and every remaining row is a legitimate answer.
        if not scored and terms["category_ids"] and not self._has_discriminating_terms(terms):
            return candidates[:limit]

        scored.sort(key=lambda pair: (-pair[0], -pair[1].created_at.timestamp()))
        return [item for _, item in scored[:limit]]

    @staticmethod
    def _has_discriminating_terms(terms: dict[str, Any]) -> bool:
        """Whether the query said anything beyond naming a species."""
        return bool(
            terms["breeds"]
            or terms["quality_terms"]
            or terms["purpose_terms"]
            or terms["general_terms"]
            or terms["location_terms"]
        )

    def _relevance(self, item: Livestock, terms: dict[str, Any]) -> int:
        """
        Score one listing against the extracted query terms. Each term scores
        once per field at that field's weight, so matching several distinct
        terms beats matching one term repeatedly.
        """
        fields = {
            "name": (item.name or "").lower(),
            "breed": (item.breed or "").lower(),
            "category": (item.category.name if item.category else "").lower(),
            "location": (item.location or "").lower(),
            "description": (item.description or "").lower(),
            "health_status": (item.health_status or "").lower(),
            "tags": " ".join(tag.name for tag in item.tags.all()).lower(),
        }

        score = 0

        # Species already matched as a hard filter — credit it so that a
        # species-only query still ranks above an incidental keyword hit.
        if terms["category_ids"]:
            score += self.FIELD_WEIGHTS["category"]

        weighted_terms = (
            [(b, 2) for b in terms["breeds"]]
            + [(t, 1) for t in terms["quality_terms"]]
            + [(t, 1) for t in terms["purpose_terms"]]
            + [(t, 1) for t in terms["location_terms"]]
            + [(t, 1) for t in terms["general_terms"]]
        )

        for term, multiplier in weighted_terms:
            for field, text in fields.items():
                if term and term in text:
                    score += self.FIELD_WEIGHTS[field] * multiplier

        return score

    def generate_chat_response(
        self,
        message: str,
        context_livestock: list[Livestock] = None,
        context_eggs: list[Egg] = None,
        conversation_history: list[ConversationMessage] = None,
    ) -> str:
        """
        Generate a response using RAG with enhanced context and conversation history.
        Now supports both livestock and eggs context.
        """
        if context_livestock is None:
            context_livestock = []
        if context_eggs is None:
            context_eggs = []
        if conversation_history is None:
            conversation_history = []

        system_prompt = self._build_system_prompt(context_livestock, context_eggs)

        # Build messages with conversation history
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (limit to last 10 exchanges to control context)
        for msg in conversation_history[-20:]:  # Last 20 messages (10 exchanges)
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message
        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.4,
                max_tokens=1000,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"AI Response Error: {e}")
            return "I apologize, but I'm having trouble connecting right now. Please try again in a moment."

    def generate_chat_response_stream(
        self,
        message: str,
        context_livestock: list[Livestock] = None,
        context_eggs: list[Egg] = None,
        conversation_history: list[ConversationMessage] = None,
    ) -> Iterator[str]:
        """
        Generate a streaming response using RAG with enhanced context and conversation history.
        Yields text chunks as they are generated. Now supports both livestock and eggs context.
        """
        if context_livestock is None:
            context_livestock = []
        if context_eggs is None:
            context_eggs = []
        if conversation_history is None:
            conversation_history = []

        system_prompt = self._build_system_prompt(context_livestock, context_eggs)

        # Build messages with conversation history
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (limit to last 10 exchanges to control context)
        for msg in conversation_history[-20:]:  # Last 20 messages (10 exchanges)
            messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message
        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.4,
                max_tokens=1000,
                stream=True,  # Enable streaming
            )

            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            print(f"AI Streaming Error: {e}")
            yield "I apologize, but I'm having trouble connecting right now. Please try again in a moment."

    def _build_system_prompt(
        self, livestock_list: list[Livestock], eggs_list: list[Egg] = None
    ) -> str:
        """
        Build a comprehensive system prompt with inventory context.
        Now includes both livestock and eggs inventory.
        """
        if eggs_list is None:
            eggs_list = []

        # Get livestock inventory summary
        try:
            categories = Category.objects.prefetch_related("livestock").all()
            livestock_summary = []

            for category in categories:
                available = category.livestock.filter(is_sold=False)
                count = available.count()
                if count > 0:
                    breeds = list(available.values_list("breed", flat=True).distinct()[:5])
                    price_agg = available.aggregate(min_price=Min("price"), max_price=Max("price"))
                    min_p = price_agg["min_price"]
                    max_p = price_agg["max_price"]

                    breed_str = ", ".join(breeds) if breeds else "Various"
                    price_str = (
                        f"₦{min_p:,.0f} - ₦{max_p:,.0f}" if min_p and max_p else "Contact for price"
                    )

                    livestock_summary.append(
                        f"  • {category.name}: {count} available ({breed_str}). Price range: {price_str}"
                    )

            livestock_text = (
                "\n".join(livestock_summary)
                if livestock_summary
                else "  Currently updating livestock inventory."
            )
        except Exception:
            livestock_text = "  Livestock inventory temporarily unavailable."

        # Get eggs inventory summary
        try:
            egg_categories = EggCategory.objects.filter(is_active=True).prefetch_related("eggs")
            eggs_summary = []

            for category in egg_categories:
                available = category.eggs.filter(is_available=True)
                count = available.count()
                if count > 0:
                    # Get egg types available
                    egg_types = list(available.values_list("egg_type", flat=True).distinct())
                    type_labels = {
                        "table": "Table",
                        "fertilized": "Fertilized/Hatching",
                        "organic": "Organic",
                        "free_range": "Free Range",
                    }
                    types_str = ", ".join([type_labels.get(t, t) for t in egg_types[:3]])

                    price_agg = available.aggregate(min_price=Min("price"), max_price=Max("price"))
                    min_p = price_agg["min_price"]
                    max_p = price_agg["max_price"]

                    price_str = (
                        f"₦{min_p:,.0f} - ₦{max_p:,.0f}" if min_p and max_p else "Contact for price"
                    )

                    # Get total eggs available
                    total_units = sum(available.values_list("quantity_available", flat=True))

                    eggs_summary.append(
                        f"  • {category.name} Eggs: {count} products, {total_units} units in stock ({types_str}). Price: {price_str}/package"
                    )

            eggs_text = (
                "\n".join(eggs_summary) if eggs_summary else "  Currently updating eggs inventory."
            )
        except Exception:
            eggs_text = "  Eggs inventory temporarily unavailable."

        base_prompt = f"""You are the Green Livestock Africa AI Assistant - a knowledgeable, practical guide for livestock farmers across Africa.

Green Livestock Africa is an education-first platform: we exist to raise the knowledge and practice of livestock farmers as a direct answer to hunger and food insecurity. Our model is Enlighten (open training on breeding, nutrition, disease prevention, farm management), Equip (improved genetics, vets, vaccination schedules, quality inputs), Verify (documented genetics and health records), and Grow (a marketplace that is proof the model works, not the headline). Our first cohort trained 93 farmers.

## Your Role
- First and foremost, help farmers farm better: answer questions on breeding, feeding, disease prevention, vaccination, and general husbandry with practical, correct guidance
- Point people to the free tools and knowledge (the Learn hub, the Herd Health Card vaccination schedule) before anything transactional
- When it's genuinely useful, help them find verified livestock, fresh or fertile eggs, and farm inputs in our catalogue
- Be warm, respectful, and straight to the point. Treat farming as the serious profession it is - never condescend, never hype
- Speak to smallholders, established farmers, and newcomers alike; tailor the depth to who you're talking to

## Current Livestock Inventory
{livestock_text}

## Current Eggs Inventory
{eggs_text}

## Specific Livestock Matches
"""

        if not livestock_list:
            base_prompt += "No specific livestock matched the immediate search criteria.\n"
        else:
            for i, stock in enumerate(livestock_list[:5], 1):
                tags = (
                    ", ".join([t.name for t in stock.tags.all()[:3]])
                    if stock.tags.exists()
                    else "N/A"
                )
                price_str = (
                    f"₦{stock.price:,.0f} {stock.currency}"
                    if stock.price is not None
                    else "Contact for price"
                )
                base_prompt += f"""
{i}. **{stock.name}**
   - Breed: {stock.breed}
   - Category: {stock.category.name}
   - Price: {price_str}
   - Age: {stock.age} | Weight: {stock.weight or "N/A"} | Gender: {stock.get_gender_display()}
   - Location: {stock.location}
   - Health: {stock.health_status[:100]}{"..." if len(stock.health_status) > 100 else ""}
   - Tags: {tags}
   - Description: {stock.description[:150]}{"..." if len(stock.description) > 150 else ""}
"""

        base_prompt += "\n## Specific Egg Matches\n"

        if not eggs_list:
            base_prompt += "No specific eggs matched the immediate search criteria.\n"
        else:
            for i, egg in enumerate(eggs_list[:5], 1):
                # Get freshness info
                freshness = egg.freshness_status
                freshness_labels = {
                    "fresh": "Fresh (7+ days)",
                    "use_soon": "Use Soon (4-7 days)",
                    "expiring_soon": "Expiring Soon (0-3 days)",
                    "expired": "Expired",
                    "unknown": "Freshness N/A",
                }
                freshness_str = freshness_labels.get(freshness, "N/A")

                # Get egg type label
                type_labels = {
                    "table": "Table Eggs",
                    "fertilized": "Fertilized/Hatching",
                    "organic": "Organic",
                    "free_range": "Free Range",
                }
                egg_type_str = type_labels.get(egg.egg_type, egg.egg_type)

                # Get size label
                size_labels = {
                    "small": "Small",
                    "medium": "Medium",
                    "large": "Large",
                    "extra_large": "Extra Large",
                    "jumbo": "Jumbo",
                }
                size_str = size_labels.get(egg.size, egg.size)

                # Get packaging label
                packaging_labels = {
                    "crate_30": "Crate (30 eggs)",
                    "tray_30": "Tray (30 eggs)",
                    "tray_12": "Tray (12 eggs)",
                    "half_crate_15": "Half Crate (15 eggs)",
                    "custom": "Custom",
                }
                packaging_str = packaging_labels.get(egg.packaging, egg.packaging)

                tags = (
                    ", ".join([t.name for t in egg.tags.all()[:3]]) if egg.tags.exists() else "N/A"
                )

                egg_price_str = (
                    f"₦{egg.price:,.0f} per package"
                    if egg.price is not None
                    else "Contact for price"
                )
                base_prompt += f"""
{i}. **{egg.name}**
   - Bird Type: {egg.category.name}
   - Breed: {egg.breed or "Various"}
   - Egg Type: {egg_type_str}
   - Size: {size_str} | Packaging: {packaging_str} ({egg.eggs_per_unit} eggs/pack)
   - Price: {egg_price_str}
   - Stock: {egg.quantity_available} packages available
   - Freshness: {freshness_str}
   - Location: {egg.location}
   - Tags: {tags}
   - Description: {egg.description[:150]}{"..." if len(egg.description) > 150 else ""}
"""

        base_prompt += """
## Guidelines
1. Lead with useful knowledge. For health, breeding, feeding, or disease questions, give clear, practical best practices - and mention the free Herd Health Card (vaccination schedules by species) and the Learn hub where they fit
2. If matching livestock or eggs are found, share them helpfully with honest details - never overhype
3. If no exact matches, suggest alternatives from our inventory or ask clarifying questions
4. For pricing questions, note that prices vary and suggest contacting us for current rates; some listings are inquiry-based
5. **For egg queries**: recommend based on use case (table vs hatching), mention freshness and packaging options
6. **For hatching eggs**: explain fertilization, storage, and incubation basics
7. Frame the marketplace as livestock raised by trained, equipped farmers - proof of the model, not a sales pitch
8. Use Nigerian Naira (₦) for all prices
9. Be concise but genuinely informative - farmers appreciate quick, actionable answers
10. If asked about something we don't have, be honest and point to the training, tools, or inputs that would help

## Egg-Specific Knowledge
- Table eggs are for consumption, fertilized eggs are for hatching/incubation
- Freshness is key: Fresh eggs (7+ days to expiry) are best, use soon means 4-7 days
- Packaging: Crate = 30 eggs, Half crate = 15 eggs, Tray = 12-30 eggs
- Chicken eggs are most common, followed by turkey, quail, duck, and guinea fowl
- Quail eggs are smaller but nutritionally dense
- Free range and organic eggs command premium prices

## Response Style
- Use markdown formatting for readability (bold, bullets, etc.)
- Keep responses focused and under 300 words unless detailed info is requested
- End with a helpful follow-up question or call-to-action when appropriate
- If the user asks about eggs, prioritize egg information; if livestock, prioritize livestock
"""
        return base_prompt

    def _extract_egg_search_terms(self, query: str) -> dict[str, Any]:
        """
        Extract egg-specific search parameters from natural language query.
        """
        query_lower = query.lower()

        extracted = {
            "category": None,
            "egg_type": None,
            "size": None,
            "packaging": None,
            "freshness": None,
            "price_max": None,
            "location_terms": [],
            "general_terms": [],
        }

        # Category detection (bird types)
        category_map = {
            "chicken": ["chicken", "chickens", "broiler", "layer", "hen", "rooster", "noiler"],
            "turkey": ["turkey", "turkeys"],
            "quail": ["quail", "quails"],
            "duck": ["duck", "ducks"],
            "guinea-fowl": ["guinea", "guinea fowl", "guinea-fowl"],
            "goose": ["goose", "geese"],
        }
        for slug, keywords in category_map.items():
            if any(kw in query_lower for kw in keywords):
                extracted["category"] = slug
                break

        # Egg type detection
        if "fertilized" in query_lower or "hatching" in query_lower or "incubat" in query_lower:
            extracted["egg_type"] = "fertilized"
        elif "organic" in query_lower:
            extracted["egg_type"] = "organic"
        elif "free range" in query_lower or "free-range" in query_lower:
            extracted["egg_type"] = "free_range"
        elif "table" in query_lower or "eating" in query_lower or "consumption" in query_lower:
            extracted["egg_type"] = "table"

        # Size detection
        size_keywords = {
            "small": ["small"],
            "medium": ["medium"],
            "large": ["large", "big"],
            "extra_large": ["extra large", "extra-large", "xl"],
            "jumbo": ["jumbo"],
        }
        for size, keywords in size_keywords.items():
            if any(kw in query_lower for kw in keywords):
                extracted["size"] = size
                break

        # Packaging detection
        if "crate" in query_lower:
            if "30" in query_lower or "full" in query_lower:
                extracted["packaging"] = "crate_30"
            elif "15" in query_lower or "half" in query_lower:
                extracted["packaging"] = "half_crate_15"
        elif "tray" in query_lower:
            if "30" in query_lower:
                extracted["packaging"] = "tray_30"
            elif "12" in query_lower or "dozen" in query_lower:
                extracted["packaging"] = "tray_12"

        # Freshness preference
        if "fresh" in query_lower or "new" in query_lower:
            extracted["freshness"] = "fresh"

        # Price extraction
        price_match = re.search(r"under\s*₦?\s*(\d+[k,]?\d*)", query_lower)
        if price_match:
            price_str = price_match.group(1).replace("k", "000").replace(",", "")
            try:
                extracted["price_max"] = int(price_str)
            except ValueError:
                pass

        # Nigerian locations
        nigerian_locations = [
            "lagos",
            "abuja",
            "kano",
            "ibadan",
            "kaduna",
            "port harcourt",
            "benin",
            "maiduguri",
            "zaria",
            "aba",
            "jos",
            "ilorin",
            "oyo",
            "enugu",
            "abeokuta",
            "sokoto",
            "onitsha",
            "warri",
            "calabar",
            "uyo",
            "asaba",
            "owerri",
        ]
        for loc in nigerian_locations:
            if loc in query_lower:
                extracted["location_terms"].append(loc)

        return extracted

    def semantic_search_eggs(self, query: str, limit: int = 20) -> list[Egg]:
        """
        Search eggs using extracted terms from natural language query.
        """
        from datetime import timedelta

        from django.utils import timezone

        terms = self._extract_egg_search_terms(query)

        queryset = (
            Egg.objects.filter(is_available=True)
            .select_related("category")
            .prefetch_related("media", "tags")
        )

        # Category filter
        if terms["category"]:
            queryset = queryset.filter(category__slug=terms["category"])

        # Egg type filter
        if terms["egg_type"]:
            queryset = queryset.filter(egg_type=terms["egg_type"])

        # Size filter
        if terms["size"]:
            queryset = queryset.filter(size=terms["size"])

        # Packaging filter
        if terms["packaging"]:
            queryset = queryset.filter(packaging=terms["packaging"])

        # Freshness filter
        if terms["freshness"] == "fresh":
            today = timezone.now().date()
            queryset = queryset.filter(expiry_date__gt=today + timedelta(days=7))

        # Price filter
        if terms["price_max"]:
            queryset = queryset.filter(price__lte=terms["price_max"])

        # Location filter
        if terms["location_terms"]:
            loc_q = Q()
            for loc in terms["location_terms"]:
                loc_q |= Q(location__icontains=loc)
            queryset = queryset.filter(loc_q)

        # Also do text search for general terms
        words = re.findall(r"\b\w{3,}\b", query.lower())
        stopwords = {
            "egg",
            "eggs",
            "the",
            "for",
            "and",
            "want",
            "need",
            "find",
            "show",
            "get",
            "looking",
        }
        search_words = [w for w in words[:5] if w not in stopwords]

        if search_words:
            text_q = Q()
            for word in search_words:
                text_q |= (
                    Q(name__icontains=word)
                    | Q(breed__icontains=word)
                    | Q(description__icontains=word)
                    | Q(category__name__icontains=word)
                )
            queryset = queryset.filter(text_q).distinct()

        # No padding with recent/featured eggs: an empty result is the honest
        # answer, both for the search UI and for the chat context this feeds.
        return list(queryset[:limit])

    def smart_search(self, query: str, limit: int = 10) -> dict[str, Any]:
        """
        Smart search that automatically detects whether to search livestock, eggs, or both.
        Returns a dict with livestock and eggs results.
        """
        intent = self._detect_query_intent(query)

        results = {
            "livestock": [],
            "eggs": [],
            "intent": intent,
        }

        if intent["livestock"]:
            results["livestock"] = self.semantic_search(query, limit=limit)

        if intent["eggs"]:
            results["eggs"] = self.semantic_search_eggs(query, limit=limit)

        return results

    # ============================================
    # ADMIN — IMAGE CLASSIFICATION (AI quick-fill)
    # ============================================

    def _vision_json(self, system_prompt: str, image_data_url: str) -> dict[str, Any]:
        """Send one image + instructions, get strict JSON back."""
        import json as _json

        response = self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Identify the animal(s) or eggs in this photo and fill the JSON schema.",
                        },
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                },
            ],
            temperature=0.2,
        )
        return _json.loads(response.choices[0].message.content or "{}")

    def classify_livestock_image(self, image_data_url: str) -> dict[str, Any]:
        """Suggest livestock form fields from a photo. Category and tag ids are
        validated against the database; unknowns come back blank, never guessed
        as facts (health status is deliberately left to the admin)."""
        from ..models import Tag

        categories = list(Category.objects.values("id", "name"))
        tags = list(Tag.objects.values("id", "name"))
        cat_lines = "\n".join(f"- {c['id']}: {c['name']}" for c in categories)
        tag_lines = "\n".join(f"- {t['id']}: {t['name']}" for t in tags) or "(none)"

        system = f"""You are a livestock intake assistant for Green Livestock Africa,
a Nigerian livestock platform. From ONE photo, draft an honest listing record.

Return ONLY a JSON object with exactly these keys:
- "name": short listing title in the style "<Breed> <Role/Sex>", e.g. "Kalahari Red Buck". No hype words.
- "category_id": the id (uuid string) of the best-matching category from the list below, or "" if none fits.
- "breed": most likely breed (common West African / commercial breeds), or "" if unclear.
- "gender": "M", "F", "mixed" (multiple animals of mixed sex), or "" if not visible.
- "age": rough visual estimate like "~6 months" or "~2 years", or "" if you cannot tell.
- "weight": rough estimate like "~30kg", or "" if you cannot tell.
- "description": 2-3 factual sentences describing what is visible — build, coat, condition, setting. No invented history, no health claims.
- "tag_ids": array of ids from the tag list that clearly apply (may be empty).
- "confidence": 0-1 number for the species/breed identification.
- "notes": one sentence telling the admin what you were unsure about and should be checked.

CATEGORIES (id: name):
{cat_lines}

TAGS (id: name):
{tag_lines}

Rules: never fabricate; prefer "" over a guess you are not confident in; the admin
reviews everything before submitting."""

        data = self._vision_json(system, image_data_url)

        # Server-side validation: only ids that actually exist survive.
        valid_cat_ids = {str(c["id"]) for c in categories}
        valid_tag_ids = {str(t["id"]) for t in tags}
        if str(data.get("category_id", "")) not in valid_cat_ids:
            data["category_id"] = ""
        data["tag_ids"] = [t for t in data.get("tag_ids", []) if str(t) in valid_tag_ids]
        for key in ["name", "breed", "gender", "age", "weight", "description", "notes"]:
            data[key] = str(data.get(key, "") or "")
        if data.get("gender") not in ("M", "F", "mixed"):
            data["gender"] = ""
        try:
            data["confidence"] = max(0.0, min(1.0, float(data.get("confidence", 0))))
        except (TypeError, ValueError):
            data["confidence"] = 0.0
        return data

    def classify_egg_image(self, image_data_url: str) -> dict[str, Any]:
        """Suggest egg form fields from a photo, constrained to the Egg schema
        choices and existing egg categories."""
        categories = list(EggCategory.objects.values("id", "name"))
        cat_lines = "\n".join(f"- {c['id']}: {c['name']}" for c in categories)
        type_choices = [c[0] for c in Egg.EGG_TYPE_CHOICES]
        size_choices = [c[0] for c in Egg.SIZE_CHOICES]

        system = f"""You are an egg-catalog intake assistant for a Nigerian farm platform.
From ONE photo of eggs, draft an honest catalog record.

Return ONLY a JSON object with exactly these keys:
- "name": short listing title, e.g. "Brown Chicken Eggs" or "Quail Eggs".
- "category_id": id of the best-matching bird type from the list below, or "".
- "egg_type": one of {type_choices}, or "" if unclear.
- "size": one of {size_choices}, or "" if unclear.
- "description": 2-3 factual sentences about what is visible — shell colour, size impression, presentation. No invented claims.
- "confidence": 0-1 number for the bird-type identification.
- "notes": one sentence on what the admin should verify.

BIRD TYPES (id: name):
{cat_lines}

Rules: never fabricate; prefer "" over an unconfident guess; the admin reviews
everything before submitting."""

        data = self._vision_json(system, image_data_url)

        valid_cat_ids = {str(c["id"]) for c in categories}
        if str(data.get("category_id", "")) not in valid_cat_ids:
            data["category_id"] = ""
        if data.get("egg_type") not in type_choices:
            data["egg_type"] = ""
        if data.get("size") not in size_choices:
            data["size"] = ""
        for key in ["name", "description", "notes"]:
            data[key] = str(data.get(key, "") or "")
        try:
            data["confidence"] = max(0.0, min(1.0, float(data.get("confidence", 0))))
        except (TypeError, ValueError):
            data["confidence"] = 0.0
        return data
