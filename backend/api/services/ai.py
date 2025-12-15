import os
import re
from openai import OpenAI
from django.conf import settings
from django.db.models import Q, Min, Max
from typing import List, Dict, Any, Optional, Generator, Iterator
from ..models import Livestock, Category


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
        conversation_history: List[ConversationMessage] = None
    ) -> str:
        """
        Generate a response using RAG with enhanced context and conversation history.
        """
        if context_livestock is None:
            context_livestock = []
        if conversation_history is None:
            conversation_history = []

        system_prompt = self._build_system_prompt(context_livestock)

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
        conversation_history: List[ConversationMessage] = None
    ) -> Iterator[str]:
        """
        Generate a streaming response using RAG with enhanced context and conversation history.
        Yields text chunks as they are generated.
        """
        if context_livestock is None:
            context_livestock = []
        if conversation_history is None:
            conversation_history = []

        system_prompt = self._build_system_prompt(context_livestock)

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
                max_tokens=400,
                stream=True,  # Enable streaming
            )

            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            print(f"AI Streaming Error: {e}")
            yield "I apologize, but I'm having trouble connecting right now. Please try again in a moment."

    def _build_system_prompt(self, livestock_list: List[Livestock]) -> str:
        """
        Build a comprehensive system prompt with inventory context.
        """
        # Get inventory summary
        try:
            categories = Category.objects.prefetch_related('livestock').all()
            inventory_summary = []

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

                    inventory_summary.append(f"  • {category.name}: {count} available ({breed_str}). Price range: {price_str}")

            inventory_text = '\n'.join(inventory_summary) if inventory_summary else "  Currently updating inventory."
        except Exception:
            inventory_text = "  Inventory information temporarily unavailable."

        base_prompt = f"""You are the Green Livestock Africa AI Assistant - a knowledgeable, professional, and enthusiastic expert on livestock investment in Africa.

## Your Role
- Help investors and farmers find the perfect livestock
- Provide accurate information about breeds, pricing, and livestock care
- Guide users toward making informed investment decisions
- Be warm, professional, and genuinely helpful, and straight to the point.

## Current Inventory Overview
{inventory_text}

## Specific Matches for User's Query
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

        base_prompt += """
## Guidelines
1. If matching livestock are found, highlight them enthusiastically and provide helpful details
2. If no exact matches, suggest alternatives from our inventory or ask clarifying questions
3. For pricing questions, always mention that prices may vary and suggest contacting for current rates
4. For health/breeding questions, provide general best practices while noting our livestock comes with documentation
5. Always encourage users to explore our collection or ask follow-up questions
6. Use Nigerian Naira (₦) for all prices
7. Be concise but informative - users appreciate quick, actionable responses
8. If asked about something not in inventory, be honest but suggest alternatives

## Response Style
- Use markdown formatting for readability (bold, bullets, etc.)
- Keep responses focused and under 300 words unless detailed info is requested
- End with a helpful follow-up question or call-to-action when appropriate
"""
        return base_prompt
