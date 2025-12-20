import json
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, throttle_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from rest_framework.throttling import AnonRateThrottle
from django_filters.rest_framework import DjangoFilterBackend
from django.http import StreamingHttpResponse
from .models import Livestock, Category, Tag, MediaAsset, ContactInquiry, PageView, VisitorSession
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


class TrackingRateThrottle(AnonRateThrottle):
    """Rate limiting for analytics tracking endpoint."""
    rate = '60/minute'  # 60 requests per minute per IP


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


class TrackVisitView(APIView):
    """
    Public endpoint to track page views and livestock modal views.
    Rate limited to prevent abuse.
    """
    permission_classes = [AllowAny]
    throttle_classes = [TrackingRateThrottle]

    def post(self, request):
        session_id = request.data.get('session_id')
        path = request.data.get('path', '/')
        event_type = request.data.get('type', 'page_view')
        livestock_id = request.data.get('livestock_id')
        referrer = request.data.get('referrer', '')

        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get client info
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Detect device type from user agent
        device_type = self._detect_device_type(user_agent)

        # Get country from IP (using free ip-api.com service)
        country = self._get_country_from_ip(ip_address)

        # Get or create visitor session
        session, created = VisitorSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'entry_page': path,
                'exit_page': path,
                'device_type': device_type,
                'user_agent': user_agent[:500] if user_agent else '',  # Limit length
                'ip_address': ip_address,
                'country': country,
            }
        )

        if not created:
            # Update existing session
            session.page_count += 1
            session.exit_page = path
            session.save(update_fields=['page_count', 'exit_page', 'last_activity'])

        # Get livestock if tracking livestock view
        livestock = None
        if livestock_id and event_type == 'livestock_view':
            try:
                livestock = Livestock.objects.get(id=livestock_id)
            except (Livestock.DoesNotExist, ValueError):
                pass

        # Create page view record
        PageView.objects.create(
            session_id=session_id,
            path=path[:500],  # Limit length
            event_type=event_type if event_type in ['page_view', 'livestock_view'] else 'page_view',
            referrer=referrer[:1000] if referrer else None,  # Limit length
            user_agent=user_agent[:500] if user_agent else '',
            ip_address=ip_address,
            country=country,
            device_type=device_type,
            livestock=livestock,
        )

        return Response({'status': 'ok'}, status=status.HTTP_201_CREATED)

    def _detect_device_type(self, user_agent: str) -> str:
        """Detect device type from user agent string."""
        ua_lower = user_agent.lower()

        # Check for tablets first (they might contain 'mobile' too)
        tablet_keywords = ['ipad', 'tablet', 'kindle', 'silk', 'playbook']
        if any(keyword in ua_lower for keyword in tablet_keywords):
            return 'tablet'

        # Check for mobile devices
        mobile_keywords = ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone', 'opera mini', 'opera mobi']
        if any(keyword in ua_lower for keyword in mobile_keywords):
            # Android tablets often have 'android' but not 'mobile'
            if 'android' in ua_lower and 'mobile' not in ua_lower:
                return 'tablet'
            return 'mobile'

        return 'desktop'

    def _get_country_from_ip(self, ip_address: str) -> str:
        """Get country from IP address using free ip-api.com service."""
        if not ip_address or ip_address in ['127.0.0.1', 'localhost', '::1']:
            return ''

        try:
            import urllib.request
            import json as json_module

            # Use ip-api.com free tier (limited to 45 req/min)
            url = f'http://ip-api.com/json/{ip_address}?fields=status,country'
            req = urllib.request.Request(url, headers={'User-Agent': 'GreenLivestockAfrica/1.0'})

            with urllib.request.urlopen(req, timeout=2) as response:
                data = json_module.loads(response.read().decode())
                if data.get('status') == 'success':
                    return data.get('country', '')
        except Exception:
            pass  # Silent fail - don't break tracking

        return ''
