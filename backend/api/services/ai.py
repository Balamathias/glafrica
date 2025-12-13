import os
from openai import OpenAI
from django.conf import settings
from typing import List, Dict, Any
from ..models import Livestock

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o" 
        self.embedding_model = "text-embedding-3-small"

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a given text.
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

    def semantic_search(self, query: str, limit: int = 5) -> List[Livestock]:
        """
        Search for livestock using vector similarity.
        Falls back to text search if pgvector is not active.
        """
        # TODO: Uncomment when pgvector is ready
        # vector = self.get_embedding(query)
        # if vector:
        #     return Livestock.objects.order_by(
        #         Livestock.embedding.cosine_distance(vector)
        #     )[:limit]
        
        # Fallback: Simple text search
        return Livestock.objects.filter(description__icontains=query)[:limit]

    def generate_chat_response(self, message: str, context_livestock: List[Livestock] = []) -> str:
        """
        Generate a response using RAG.
        """
        system_prompt = self._build_system_prompt(context_livestock)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"I apologize, but I'm having trouble connecting to my brain right now. ({str(e)})"

    def _build_system_prompt(self, livestock_list: List[Livestock]) -> str:
        base_prompt = """You are the Green Livestock Africa AI Assistant. 
Your goal is to help potential investors and farmers find the perfect livestock.
You are professional, knowledgeable, and enthusiastic about agriculture.

Resources available to you based on the user's search:
"""
        if not livestock_list:
            base_prompt += "No specific livestock matched the immediate search, but you can answer general questions."
        else:
            for stock in livestock_list:
                base_prompt += f"- {stock.name} ({stock.breed}): {stock.price} {stock.currency}, {stock.age}, {stock.location}. {stock.description}\n"
        
        base_prompt += "\nIf the user asks about specific livestock listed above, provide details. If not, answer generally."
        return base_prompt
