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

    # Analytics endpoints
    path('analytics/sales/', SalesAnalyticsView.as_view(), name='analytics-sales'),
    path('analytics/sales-trend/', SalesTrendView.as_view(), name='analytics-sales-trend'),
    path('analytics/revenue-trend/', RevenueTrendView.as_view(), name='analytics-revenue-trend'),
    path('analytics/inventory/', InventoryMetricsView.as_view(), name='analytics-inventory'),
]
