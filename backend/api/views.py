import json
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, throttle_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.http import StreamingHttpResponse
from .models import Livestock, Category, Tag, MediaAsset, ContactInquiry
from .serializers import (
    LivestockSerializer, LivestockListSerializer,
    CategorySerializer, CategoryWithPreviewSerializer, TagSerializer,
    ContactInquirySerializer
)
from .services.email import send_contact_notification_email

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
    Supports both regular and streaming responses.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def send(self, request):
        """Non-streaming endpoint for backwards compatibility."""
        message = request.data.get('message')
        conversation_history = request.data.get('history', [])

        ai_service = AIService()

        # 1. Search for context based on current message
        context_results = ai_service.semantic_search(message)

        # 2. Generate Response with conversation history
        response_text = ai_service.generate_chat_response(
            message,
            context_results,
            conversation_history
        )

        return Response({
            "response": response_text,
            "context_count": len(context_results)
        })

    @action(detail=False, methods=['post'])
    def stream(self, request):
        """
        Streaming endpoint using Server-Sent Events (SSE).
        Accepts conversation history for context continuity.
        """
        message = request.data.get('message')
        conversation_history = request.data.get('history', [])

        if not message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ai_service = AIService()

        # Search for context based on current message
        context_results = ai_service.semantic_search(message)

        def event_stream():
            """Generator that yields SSE formatted chunks."""
            try:
                # Send context count first
                yield f"data: {json.dumps({'type': 'context', 'count': len(context_results)})}\n\n"

                # Stream the response
                for chunk in ai_service.generate_chat_response_stream(
                    message,
                    context_results,
                    conversation_history
                ):
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

                # Signal completion
                yield f"data: {json.dumps({'type': 'done'})}\n\n"

            except Exception as e:
                print(f"Stream error: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
        return response


class ContactRateThrottle(AnonRateThrottle):
    """Rate limiting for contact form submissions."""
    rate = '5/hour'  # 5 submissions per hour per IP


class ContactInquiryCreateView(APIView):
    """
    Public endpoint for contact form submissions.
    Rate limited to prevent spam.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    def post(self, request):
        serializer = ContactInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()

        # Send email notification to admin (async would be better, but this works)
        email_sent = send_contact_notification_email(inquiry)

        return Response({
            'detail': 'Your message has been sent successfully. We will get back to you soon.',
            'id': str(inquiry.id),
            'email_sent': email_sent
        }, status=status.HTTP_201_CREATED)
