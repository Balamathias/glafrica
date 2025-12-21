import os
import re
from openai import OpenAI
from django.conf import settings
from django.db.models import Q, Min, Max
from typing import List, Dict, Any, Optional, Generator, Iterator
from ..models import Livestock, Category, Egg, EggCategory


# Type alias for conversation messages
ConversationMessage = Dict[str, str]  # {"role": "user" | "assistant", "content": str}


class AIService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        self.model = "gemini-2.5-flash"
        self.embedding_model = "gemini-embedding-001"

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a given text.
        TODO: Use when pgvector is ready
        """
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    def _detect_query_intent(self, query: str) -> Dict[str, bool]:
        """
        Detect whether the query is about livestock, eggs, or both.
        Returns a dict indicating which product types to search.
        """
        query_lower = query.lower()

        # Egg-specific keywords
        egg_keywords = [
            'egg', 'eggs', 'crate', 'tray', 'dozen', 'hatching', 'fertilized',
            'fresh eggs', 'organic eggs', 'free range', 'table eggs', 'laying',
            'yolk', 'shell', 'incubation',
        ]

        # Livestock-specific keywords (excluding birds that could mean eggs)
        livestock_only_keywords = [
            'cattle', 'cow', 'cows', 'bull', 'bulls', 'calf', 'calves', 'beef',
            'goat', 'goats', 'buck', 'doe', 'kid', 'boer', 'kalahari',
            'sheep', 'ram', 'ewe', 'lamb', 'lambs', 'wool',
            'pig', 'pigs', 'swine', 'hog', 'sow', 'piglet', 'pork',
            'livestock', 'animal', 'animals', 'breeding stock', 'herd',
        ]

        # Poultry keywords that could mean either live birds OR eggs
        poultry_keywords = [
            'chicken', 'chickens', 'poultry', 'hen', 'rooster', 'cockerel',
            'turkey', 'turkeys', 'duck', 'ducks', 'quail', 'guinea fowl',
            'broiler', 'layer', 'noiler',
        ]

        has_egg_keywords = any(kw in query_lower for kw in egg_keywords)
        has_livestock_keywords = any(kw in query_lower for kw in livestock_only_keywords)
        has_poultry_keywords = any(kw in query_lower for kw in poultry_keywords)

        # Determine intent
        if has_egg_keywords:
            # Explicit egg search
            return {'livestock': False, 'eggs': True}
        elif has_livestock_keywords:
            # Explicit livestock search
            return {'livestock': True, 'eggs': False}
        elif has_poultry_keywords:
            # Poultry could mean either - search both
            return {'livestock': True, 'eggs': True}
        else:
            # General query - search both
            return {'livestock': True, 'eggs': True}

    def _extract_search_terms(self, query: str) -> Dict[str, Any]:
        """
        Extract meaningful search terms from a natural language query.
        Returns a dict with extracted criteria.
        """
        query_lower = query.lower()

        # Category keywords mapping
        category_keywords = {
            'cattle': ['cattle', 'cow', 'cows', 'bull', 'bulls', 'calf', 'calves', 'beef', 'dairy'],
            'goats': ['goat', 'goats', 'buck', 'doe', 'kid', 'boer', 'kalahari'],
            'sheep': ['sheep', 'ram', 'ewe', 'lamb', 'lambs', 'wool'],
            'poultry': ['chicken', 'chickens', 'poultry', 'rooster', 'hen', 'chicks', 'broiler', 'layer'],
            'pigs': ['pig', 'pigs', 'swine', 'hog', 'sow', 'boar', 'piglet'],
        }

        # Breed keywords (common breeds)
        breed_keywords = [
            'boer', 'kalahari', 'red', 'sokoto', 'west african dwarf', 'wad',
            'brahman', 'white fulani', 'ndama', 'muturu', 'bunaji',
            'dorper', 'balami', 'yankasa', 'uda',
            'noiler', 'broiler', 'layer', 'cockerel',
            'large white', 'landrace', 'duroc',
        ]

        # Gender keywords
        gender_map = {
            'male': ['male', 'buck', 'bull', 'ram', 'boar', 'rooster', 'cock', 'he'],
            'female': ['female', 'doe', 'cow', 'ewe', 'sow', 'hen', 'she'],
        }

        # Quality/health keywords
        quality_keywords = [
            'healthy', 'vaccinated', 'premium', 'quality', 'investment', 'breeding',
            'purebred', 'pure', 'registered', 'certified', 'organic',
        ]

        # Price keywords
        price_keywords = ['cheap', 'affordable', 'budget', 'expensive', 'premium', 'under', 'below', 'above']

        extracted = {
            'categories': [],
            'breeds': [],
            'gender': None,
            'quality_terms': [],
            'price_range': None,
            'location_terms': [],
            'general_terms': [],
        }

        # Extract categories
        for category, keywords in category_keywords.items():
            if any(kw in query_lower for kw in keywords):
                extracted['categories'].append(category)

        # Extract breeds
        for breed in breed_keywords:
            if breed in query_lower:
                extracted['breeds'].append(breed)

        # Extract gender
        for gender, keywords in gender_map.items():
            if any(kw in query_lower for kw in keywords):
                extracted['gender'] = 'M' if gender == 'male' else 'F'
                break

        # Extract quality terms
        for term in quality_keywords:
            if term in query_lower:
                extracted['quality_terms'].append(term)

        # Extract price range hints
        price_match = re.search(r'under\s*(\d+[k,]?\d*)', query_lower)
        if price_match:
            price_str = price_match.group(1).replace('k', '000').replace(',', '')
            try:
                extracted['price_range'] = ('max', int(price_str))
            except ValueError:
                pass

        price_match = re.search(r'above\s*(\d+[k,]?\d*)', query_lower)
        if price_match:
            price_str = price_match.group(1).replace('k', '000').replace(',', '')
            try:
                extracted['price_range'] = ('min', int(price_str))
            except ValueError:
                pass

        # Extract location terms (Nigerian states/cities)
        nigerian_locations = [
            'lagos', 'abuja', 'kano', 'ibadan', 'kaduna', 'port harcourt', 'benin',
            'maiduguri', 'zaria', 'aba', 'jos', 'ilorin', 'oyo', 'enugu', 'abeokuta',
            'sokoto', 'onitsha', 'warri', 'calabar', 'uyo', 'asaba', 'owerri',
        ]
        for loc in nigerian_locations:
            if loc in query_lower:
                extracted['location_terms'].append(loc)

        # Keep remaining significant words as general terms
        stopwords = {
            'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for',
            'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
            'during', 'before', 'after', 'above', 'below', 'between',
            'under', 'again', 'further', 'then', 'once', 'here', 'there',
            'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
            'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
            'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and',
            'but', 'if', 'or', 'because', 'until', 'while', 'although',
            'find', 'me', 'show', 'get', 'looking', 'want', 'need', 'search',
            'give', 'tell', 'about', 'what', 'which', 'any', 'good', 'best',
            'i', 'my', 'your', 'like', 'please',
        }
        words = re.findall(r'\b\w+\b', query_lower)
        for word in words:
            if word not in stopwords and len(word) > 2:
                if word not in extracted['breeds'] and word not in extracted['quality_terms']:
                    # Check if it's not already captured
                    already_captured = False
                    for cat_keywords in category_keywords.values():
                        if word in cat_keywords:
                            already_captured = True
                            break
                    if not already_captured:
                        extracted['general_terms'].append(word)

        return extracted

    def semantic_search(self, query: str, limit: int = 10) -> List[Livestock]:
        """
        Search for livestock using intelligent text matching.
        Falls back to broader search if specific criteria yield no results.

        TODO: Uncomment vector search when pgvector is ready:
        # vector = self.get_embedding(query)
        # if vector:
        #     return Livestock.objects.order_by(
        #         Livestock.embedding.cosine_distance(vector)
        #     )[:limit]
        """

        # Extract search terms from query
        terms = self._extract_search_terms(query)

        # Build the query
        queryset = Livestock.objects.filter(is_sold=False).select_related('category').prefetch_related('media', 'tags')

        # Start with category filter if detected
        if terms['categories']:
            category_q = Q()
            for cat in terms['categories']:
                category_q |= Q(category__name__icontains=cat)
            queryset = queryset.filter(category_q)

        # Apply breed filter
        if terms['breeds']:
            breed_q = Q()
            for breed in terms['breeds']:
                breed_q |= Q(breed__icontains=breed)
            queryset = queryset.filter(breed_q)

        # Apply gender filter
        if terms['gender']:
            queryset = queryset.filter(gender=terms['gender'])

        # Apply price filter
        if terms['price_range']:
            range_type, amount = terms['price_range']
            if range_type == 'max':
                queryset = queryset.filter(price__lte=amount)
            else:
                queryset = queryset.filter(price__gte=amount)

        # Apply location filter
        if terms['location_terms']:
            loc_q = Q()
            for loc in terms['location_terms']:
                loc_q |= Q(location__icontains=loc)
            queryset = queryset.filter(loc_q)

        # Apply quality/general term search across multiple fields
        search_terms = terms['quality_terms'] + terms['general_terms']
        if search_terms:
            text_q = Q()
            for term in search_terms:
                text_q |= (
                    Q(name__icontains=term) |
                    Q(description__icontains=term) |
                    Q(breed__icontains=term) |
                    Q(health_status__icontains=term) |
                    Q(tags__name__icontains=term)
                )
            queryset = queryset.filter(text_q).distinct()

        results = list(queryset[:limit])

        # If no results with strict criteria, do a broader search
        if not results and query.strip():
            # Try searching across all text fields with any word from query
            words = re.findall(r'\b\w{3,}\b', query.lower())
            if words:
                broad_q = Q()
                for word in words[:5]:  # Limit to first 5 meaningful words
                    broad_q |= (
                        Q(name__icontains=word) |
                        Q(breed__icontains=word) |
                        Q(description__icontains=word) |
                        Q(category__name__icontains=word) |
                        Q(location__icontains=word)
                    )
                results = list(
                    Livestock.objects.filter(is_sold=False)
                    .filter(broad_q)
                    .select_related('category')
                    .prefetch_related('media', 'tags')
                    .distinct()[:limit]
                )

        # If still no results, return some featured/recent items
        if not results:
            results = list(
                Livestock.objects.filter(is_sold=False)
                .select_related('category')
                .prefetch_related('media', 'tags')
                .order_by('-created_at')[:limit]
            )

        return results

    def generate_chat_response(
        self,
        message: str,
        context_livestock: List[Livestock] = None,
        context_eggs: List[Egg] = None,
        conversation_history: List[ConversationMessage] = None
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
        context_livestock: List[Livestock] = None,
        context_eggs: List[Egg] = None,
        conversation_history: List[ConversationMessage] = None
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
        self,
        livestock_list: List[Livestock],
        eggs_list: List[Egg] = None
    ) -> str:
        """
        Build a comprehensive system prompt with inventory context.
        Now includes both livestock and eggs inventory.
        """
        if eggs_list is None:
            eggs_list = []

        # Get livestock inventory summary
        try:
            categories = Category.objects.prefetch_related('livestock').all()
            livestock_summary = []

            for category in categories:
                available = category.livestock.filter(is_sold=False)
                count = available.count()
                if count > 0:
                    breeds = list(available.values_list('breed', flat=True).distinct()[:5])
                    price_agg = available.aggregate(
                        min_price=Min('price'),
                        max_price=Max('price')
                    )
                    min_p = price_agg['min_price']
                    max_p = price_agg['max_price']

                    breed_str = ', '.join(breeds) if breeds else 'Various'
                    price_str = f"₦{min_p:,.0f} - ₦{max_p:,.0f}" if min_p and max_p else "Contact for price"

                    livestock_summary.append(f"  • {category.name}: {count} available ({breed_str}). Price range: {price_str}")

            livestock_text = '\n'.join(livestock_summary) if livestock_summary else "  Currently updating livestock inventory."
        except Exception:
            livestock_text = "  Livestock inventory temporarily unavailable."

        # Get eggs inventory summary
        try:
            egg_categories = EggCategory.objects.filter(is_active=True).prefetch_related('eggs')
            eggs_summary = []

            for category in egg_categories:
                available = category.eggs.filter(is_available=True)
                count = available.count()
                if count > 0:
                    # Get egg types available
                    egg_types = list(available.values_list('egg_type', flat=True).distinct())
                    type_labels = {
                        'table': 'Table',
                        'fertilized': 'Fertilized/Hatching',
                        'organic': 'Organic',
                        'free_range': 'Free Range'
                    }
                    types_str = ', '.join([type_labels.get(t, t) for t in egg_types[:3]])

                    price_agg = available.aggregate(
                        min_price=Min('price'),
                        max_price=Max('price')
                    )
                    min_p = price_agg['min_price']
                    max_p = price_agg['max_price']

                    price_str = f"₦{min_p:,.0f} - ₦{max_p:,.0f}" if min_p and max_p else "Contact for price"

                    # Get total eggs available
                    total_units = sum(available.values_list('quantity_available', flat=True))

                    eggs_summary.append(
                        f"  • {category.name} Eggs: {count} products, {total_units} units in stock ({types_str}). Price: {price_str}/package"
                    )

            eggs_text = '\n'.join(eggs_summary) if eggs_summary else "  Currently updating eggs inventory."
        except Exception:
            eggs_text = "  Eggs inventory temporarily unavailable."

        base_prompt = f"""You are the Green Livestock Africa AI Assistant - a knowledgeable, professional, and enthusiastic expert on livestock and eggs investment in Africa.

## Your Role
- Help investors and farmers find the perfect livestock AND fresh eggs
- Provide accurate information about breeds, pricing, egg freshness, and care
- Guide users toward making informed investment decisions
- Be warm, professional, genuinely helpful, and straight to the point

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
                tags = ', '.join([t.name for t in stock.tags.all()[:3]]) if stock.tags.exists() else 'N/A'
                base_prompt += f"""
{i}. **{stock.name}**
   - Breed: {stock.breed}
   - Category: {stock.category.name}
   - Price: ₦{stock.price:,.0f} {stock.currency}
   - Age: {stock.age} | Weight: {stock.weight or 'N/A'} | Gender: {stock.get_gender_display()}
   - Location: {stock.location}
   - Health: {stock.health_status[:100]}{'...' if len(stock.health_status) > 100 else ''}
   - Tags: {tags}
   - Description: {stock.description[:150]}{'...' if len(stock.description) > 150 else ''}
"""

        base_prompt += "\n## Specific Egg Matches\n"

        if not eggs_list:
            base_prompt += "No specific eggs matched the immediate search criteria.\n"
        else:
            for i, egg in enumerate(eggs_list[:5], 1):
                # Get freshness info
                freshness = egg.freshness_status
                freshness_labels = {
                    'fresh': 'Fresh (7+ days)',
                    'use_soon': 'Use Soon (4-7 days)',
                    'expiring_soon': 'Expiring Soon (0-3 days)',
                    'expired': 'Expired',
                    'unknown': 'Freshness N/A'
                }
                freshness_str = freshness_labels.get(freshness, 'N/A')

                # Get egg type label
                type_labels = {
                    'table': 'Table Eggs',
                    'fertilized': 'Fertilized/Hatching',
                    'organic': 'Organic',
                    'free_range': 'Free Range'
                }
                egg_type_str = type_labels.get(egg.egg_type, egg.egg_type)

                # Get size label
                size_labels = {
                    'small': 'Small',
                    'medium': 'Medium',
                    'large': 'Large',
                    'extra_large': 'Extra Large',
                    'jumbo': 'Jumbo'
                }
                size_str = size_labels.get(egg.size, egg.size)

                # Get packaging label
                packaging_labels = {
                    'crate_30': 'Crate (30 eggs)',
                    'tray_30': 'Tray (30 eggs)',
                    'tray_12': 'Tray (12 eggs)',
                    'half_crate_15': 'Half Crate (15 eggs)',
                    'custom': 'Custom'
                }
                packaging_str = packaging_labels.get(egg.packaging, egg.packaging)

                tags = ', '.join([t.name for t in egg.tags.all()[:3]]) if egg.tags.exists() else 'N/A'

                base_prompt += f"""
{i}. **{egg.name}**
   - Bird Type: {egg.category.name}
   - Breed: {egg.breed or 'Various'}
   - Egg Type: {egg_type_str}
   - Size: {size_str} | Packaging: {packaging_str} ({egg.eggs_per_unit} eggs/pack)
   - Price: ₦{egg.price:,.0f} per package
   - Stock: {egg.quantity_available} packages available
   - Freshness: {freshness_str}
   - Location: {egg.location}
   - Tags: {tags}
   - Description: {egg.description[:150]}{'...' if len(egg.description) > 150 else ''}
"""

        base_prompt += """
## Guidelines
1. If matching livestock or eggs are found, highlight them enthusiastically with helpful details
2. If no exact matches, suggest alternatives from our inventory or ask clarifying questions
3. For pricing questions, mention that prices may vary and suggest contacting for current rates
4. For health/breeding questions, provide general best practices while noting our products come with documentation
5. **For egg queries**: Emphasize freshness, recommend based on use case (table vs hatching), mention packaging options
6. **For hatching eggs**: Explain fertilization rates, storage requirements, and incubation tips
7. Always encourage users to explore our collection or ask follow-up questions
8. Use Nigerian Naira (₦) for all prices
9. Be concise but informative - users appreciate quick, actionable responses
10. If asked about something not in inventory, be honest but suggest alternatives

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

    def _extract_egg_search_terms(self, query: str) -> Dict[str, Any]:
        """
        Extract egg-specific search parameters from natural language query.
        """
        query_lower = query.lower()

        extracted = {
            'category': None,
            'egg_type': None,
            'size': None,
            'packaging': None,
            'freshness': None,
            'price_max': None,
            'location_terms': [],
            'general_terms': [],
        }

        # Category detection (bird types)
        category_map = {
            'chicken': ['chicken', 'chickens', 'broiler', 'layer', 'hen', 'rooster', 'noiler'],
            'turkey': ['turkey', 'turkeys'],
            'quail': ['quail', 'quails'],
            'duck': ['duck', 'ducks'],
            'guinea-fowl': ['guinea', 'guinea fowl', 'guinea-fowl'],
            'goose': ['goose', 'geese'],
        }
        for slug, keywords in category_map.items():
            if any(kw in query_lower for kw in keywords):
                extracted['category'] = slug
                break

        # Egg type detection
        if 'fertilized' in query_lower or 'hatching' in query_lower or 'incubat' in query_lower:
            extracted['egg_type'] = 'fertilized'
        elif 'organic' in query_lower:
            extracted['egg_type'] = 'organic'
        elif 'free range' in query_lower or 'free-range' in query_lower:
            extracted['egg_type'] = 'free_range'
        elif 'table' in query_lower or 'eating' in query_lower or 'consumption' in query_lower:
            extracted['egg_type'] = 'table'

        # Size detection
        size_keywords = {
            'small': ['small'],
            'medium': ['medium'],
            'large': ['large', 'big'],
            'extra_large': ['extra large', 'extra-large', 'xl'],
            'jumbo': ['jumbo'],
        }
        for size, keywords in size_keywords.items():
            if any(kw in query_lower for kw in keywords):
                extracted['size'] = size
                break

        # Packaging detection
        if 'crate' in query_lower:
            if '30' in query_lower or 'full' in query_lower:
                extracted['packaging'] = 'crate_30'
            elif '15' in query_lower or 'half' in query_lower:
                extracted['packaging'] = 'half_crate_15'
        elif 'tray' in query_lower:
            if '30' in query_lower:
                extracted['packaging'] = 'tray_30'
            elif '12' in query_lower or 'dozen' in query_lower:
                extracted['packaging'] = 'tray_12'

        # Freshness preference
        if 'fresh' in query_lower or 'new' in query_lower:
            extracted['freshness'] = 'fresh'

        # Price extraction
        price_match = re.search(r'under\s*₦?\s*(\d+[k,]?\d*)', query_lower)
        if price_match:
            price_str = price_match.group(1).replace('k', '000').replace(',', '')
            try:
                extracted['price_max'] = int(price_str)
            except ValueError:
                pass

        # Nigerian locations
        nigerian_locations = [
            'lagos', 'abuja', 'kano', 'ibadan', 'kaduna', 'port harcourt', 'benin',
            'maiduguri', 'zaria', 'aba', 'jos', 'ilorin', 'oyo', 'enugu', 'abeokuta',
            'sokoto', 'onitsha', 'warri', 'calabar', 'uyo', 'asaba', 'owerri',
        ]
        for loc in nigerian_locations:
            if loc in query_lower:
                extracted['location_terms'].append(loc)

        return extracted

    def semantic_search_eggs(self, query: str, limit: int = 20) -> List[Egg]:
        """
        Search eggs using extracted terms from natural language query.
        """
        from datetime import timedelta
        from django.utils import timezone

        terms = self._extract_egg_search_terms(query)

        queryset = Egg.objects.filter(is_available=True).select_related('category').prefetch_related('media', 'tags')

        # Category filter
        if terms['category']:
            queryset = queryset.filter(category__slug=terms['category'])

        # Egg type filter
        if terms['egg_type']:
            queryset = queryset.filter(egg_type=terms['egg_type'])

        # Size filter
        if terms['size']:
            queryset = queryset.filter(size=terms['size'])

        # Packaging filter
        if terms['packaging']:
            queryset = queryset.filter(packaging=terms['packaging'])

        # Freshness filter
        if terms['freshness'] == 'fresh':
            today = timezone.now().date()
            queryset = queryset.filter(expiry_date__gt=today + timedelta(days=7))

        # Price filter
        if terms['price_max']:
            queryset = queryset.filter(price__lte=terms['price_max'])

        # Location filter
        if terms['location_terms']:
            loc_q = Q()
            for loc in terms['location_terms']:
                loc_q |= Q(location__icontains=loc)
            queryset = queryset.filter(loc_q)

        # Also do text search for general terms
        words = re.findall(r'\b\w{3,}\b', query.lower())
        stopwords = {'egg', 'eggs', 'the', 'for', 'and', 'want', 'need', 'find', 'show', 'get', 'looking'}
        search_words = [w for w in words[:5] if w not in stopwords]

        if search_words:
            text_q = Q()
            for word in search_words:
                text_q |= (
                    Q(name__icontains=word) |
                    Q(breed__icontains=word) |
                    Q(description__icontains=word) |
                    Q(category__name__icontains=word)
                )
            queryset = queryset.filter(text_q).distinct()

        results = list(queryset[:limit])

        # If no results, return recent/featured eggs
        if not results:
            results = list(
                Egg.objects.filter(is_available=True)
                .select_related('category')
                .prefetch_related('media', 'tags')
                .order_by('-is_featured', '-created_at')[:limit]
            )

        return results

    def smart_search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """
        Smart search that automatically detects whether to search livestock, eggs, or both.
        Returns a dict with livestock and eggs results.
        """
        intent = self._detect_query_intent(query)

        results = {
            'livestock': [],
            'eggs': [],
            'intent': intent,
        }

        if intent['livestock']:
            results['livestock'] = self.semantic_search(query, limit=limit)

        if intent['eggs']:
            results['eggs'] = self.semantic_search_eggs(query, limit=limit)

        return results
