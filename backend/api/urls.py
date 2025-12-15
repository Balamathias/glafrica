from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LivestockViewSet, CategoryViewSet, ChatView, ContactInquiryCreateView

router = DefaultRouter()
router.register(r'livestock', LivestockViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'chat', ChatView, basename='chat')

urlpatterns = [
    # Public API endpoints
    path('', include(router.urls)),

    # Contact form endpoint (public, rate-limited)
    path('contact/', ContactInquiryCreateView.as_view(), name='contact'),

    # Admin API endpoints (namespaced)
    path('admin/', include('api.admin_api.urls', namespace='admin_api')),
]
