from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LivestockViewSet, CategoryViewSet, ChatView, ContactInquiryCreateView, TrackVisitView,
    EggViewSet, EggCategoryViewSet, SmartSearchView
)

router = DefaultRouter()
router.register(r'livestock', LivestockViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'chat', ChatView, basename='chat')
router.register(r'eggs', EggViewSet, basename='eggs')
router.register(r'egg-categories', EggCategoryViewSet, basename='egg-categories')

urlpatterns = [
    # Public API endpoints
    path('', include(router.urls)),

    # Unified AI-powered search for both livestock and eggs
    path('search/', SmartSearchView.as_view(), name='smart-search'),

    # Contact form endpoint (public, rate-limited)
    path('contact/', ContactInquiryCreateView.as_view(), name='contact'),

    # Analytics tracking endpoint (public, rate-limited)
    path('analytics/track/', TrackVisitView.as_view(), name='track-visit'),

    # Admin API endpoints (namespaced)
    path('admin/', include('api.admin_api.urls', namespace='admin_api')),
]
