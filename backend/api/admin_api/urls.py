"""
Admin API URL configuration.
All admin endpoints are namespaced under /api/v1/admin/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AdminLivestockViewSet,
    AdminCategoryViewSet,
    AdminTagViewSet,
    AdminMediaViewSet,
    AdminAuditLogViewSet,
    AdminContactInquiryViewSet,
    VisitorAnalyticsView,
)
from .dashboard_views import (
    DashboardSummaryView,
    LivestockByCategoryView,
    SalesTrendView,
    RevenueTrendView,
    RecentActivityView,
    InventoryMetricsView,
    SalesAnalyticsView,
    TopItemsView,
    FullDashboardView,
)

app_name = 'admin_api'

# Router for ViewSets
router = DefaultRouter()
router.register(r'livestock', AdminLivestockViewSet, basename='admin-livestock')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'tags', AdminTagViewSet, basename='admin-tags')
router.register(r'media', AdminMediaViewSet, basename='admin-media')
router.register(r'audit-logs', AdminAuditLogViewSet, basename='admin-audit-logs')
router.register(r'inquiries', AdminContactInquiryViewSet, basename='admin-inquiries')

urlpatterns = [
    # Authentication endpoints
    path('auth/', include('api.authentication.urls')),

    # Resource endpoints from router
    path('', include(router.urls)),

    # Dashboard endpoints
    path('dashboard/', FullDashboardView.as_view(), name='dashboard'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('dashboard/categories/', LivestockByCategoryView.as_view(), name='dashboard-categories'),
    path('dashboard/activity/', RecentActivityView.as_view(), name='dashboard-activity'),
    path('dashboard/top-items/', TopItemsView.as_view(), name='dashboard-top-items'),

    # Analytics endpoints (Sales/Inventory)
    path('analytics/sales/', SalesAnalyticsView.as_view(), name='analytics-sales'),
    path('analytics/sales-trend/', SalesTrendView.as_view(), name='analytics-sales-trend'),
    path('analytics/revenue-trend/', RevenueTrendView.as_view(), name='analytics-revenue-trend'),
    path('analytics/inventory/', InventoryMetricsView.as_view(), name='analytics-inventory'),

    # Visitor Analytics endpoints
    path('analytics/visitors/', VisitorAnalyticsView.as_view(), {'action': 'summary'}, name='analytics-visitors'),
    path('analytics/visits-trend/', VisitorAnalyticsView.as_view(), {'action': 'visits-trend'}, name='analytics-visits-trend'),
    path('analytics/top-pages/', VisitorAnalyticsView.as_view(), {'action': 'top-pages'}, name='analytics-top-pages'),
    path('analytics/top-livestock/', VisitorAnalyticsView.as_view(), {'action': 'top-livestock'}, name='analytics-top-livestock'),
    path('analytics/devices/', VisitorAnalyticsView.as_view(), {'action': 'devices'}, name='analytics-devices'),
    path('analytics/referrers/', VisitorAnalyticsView.as_view(), {'action': 'referrers'}, name='analytics-referrers'),
    path('analytics/geographic/', VisitorAnalyticsView.as_view(), {'action': 'geographic'}, name='analytics-geographic'),
]
