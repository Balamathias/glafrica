from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Livestock, Category, Tag, MediaAsset
from .serializers import (
    LivestockSerializer, LivestockListSerializer,
    CategorySerializer, CategoryWithPreviewSerializer, TagSerializer
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().prefetch_related('livestock', 'livestock__media')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'], url_path='with-previews')
    def with_previews(self, request):
        """Get categories with livestock count and preview images."""
        categories = self.get_queryset()
        serializer = CategoryWithPreviewSerializer(categories, many=True)
        return Response(serializer.data)

from .services.ai import AIService

class LivestockViewSet(viewsets.ModelViewSet):
    queryset = Livestock.objects.all().select_related('category').prefetch_related('media', 'tags')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__name', 'gender', 'is_sold', 'price']
    search_fields = ['name', 'breed', 'location', 'description']
    ordering_fields = ['price', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return LivestockListSerializer
        return LivestockSerializer

    @action(detail=False, methods=['post'], url_path='search-ai', permission_classes=[AllowAny])
    def search_ai(self, request):
        """
        Semantic search endpoint - allows anonymous access.
        """
        query = request.data.get('query', '')
        ai_service = AIService()
        results = ai_service.semantic_search(query)
        serializer = LivestockListSerializer(results, many=True)
        return Response(serializer.data)

class ChatView(viewsets.ViewSet):
    """
    Endpoint for AI Chatbot - allows anonymous access.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def send(self, request):
        message = request.data.get('message')
        ai_service = AIService()
        
        # 1. Search for context
        context_results = ai_service.semantic_search(message)
        
        # 2. Generate Response
        response_text = ai_service.generate_chat_response(message, context_results)
        
        return Response({
            "response": response_text, 
            "context_count": len(context_results)
        })
