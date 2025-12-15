"""
Dashboard and Analytics API views.
"""
from datetime import datetime
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..permissions import IsAdminUser, CanViewAnalytics
from ..services.analytics import AnalyticsService


class DashboardSummaryView(APIView):
    """
    Get dashboard summary statistics.

    Returns quick stats including:
    - Total/available/sold livestock counts
    - Revenue metrics (total, pending, this week)
    - Week-over-week changes
    - Conversion rate
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        summary = AnalyticsService.get_dashboard_summary()
        return Response(summary)


class LivestockByCategoryView(APIView):
    """
    Get livestock distribution by category.

    Returns category breakdown with:
    - Total count
    - Available count
    - Sold count
    - Revenue per category
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        categories = AnalyticsService.get_livestock_by_category()
        return Response(categories)


class SalesTrendView(APIView):
    """
    Get daily sales trend.

    Query parameters:
    - days: Number of days to look back (default: 30)
    """
    permission_classes = [IsAuthenticated, IsAdminUser, CanViewAnalytics]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        trend = AnalyticsService.get_sales_trend(days=days)
        return Response(trend)


class RevenueTrendView(APIView):
    """
    Get daily revenue trend with filled dates.

    Query parameters:
    - days: Number of days to look back (default: 30)
    """
    permission_classes = [IsAuthenticated, IsAdminUser, CanViewAnalytics]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        trend = AnalyticsService.get_revenue_trend(days=days)
        return Response(trend)


class RecentActivityView(APIView):
    """
    Get recent admin activity.

    Query parameters:
    - limit: Number of activities to return (default: 10, max: 50)
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 10)), 50)
        activities = AnalyticsService.get_recent_activity(limit=limit)
        return Response(activities)


class InventoryMetricsView(APIView):
    """
    Get detailed inventory metrics.

    Returns:
    - Price range (min, max, avg, total value)
    - Age distribution
    - Gender distribution
    - Top performing categories
    - Media and category counts
    """
    permission_classes = [IsAuthenticated, IsAdminUser, CanViewAnalytics]

    def get(self, request):
        metrics = AnalyticsService.get_inventory_metrics()
        return Response(metrics)


class SalesAnalyticsView(APIView):
    """
    Get detailed sales analytics for a date range.

    Query parameters:
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)
    """
    permission_classes = [IsAuthenticated, IsAdminUser, CanViewAnalytics]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                return Response(
                    {'detail': 'Invalid start_date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                return Response(
                    {'detail': 'Invalid end_date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        analytics = AnalyticsService.get_sales_analytics(
            start_date=start_date,
            end_date=end_date
        )
        return Response(analytics)


class TopItemsView(APIView):
    """
    Get top performing livestock items.

    Query parameters:
    - limit: Number of items to return (default: 10)
    - by: Sort by 'price' or 'recent' (default: 'price')
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 10)), 50)
        by = request.query_params.get('by', 'price')
        items = AnalyticsService.get_top_items(limit=limit, by=by)
        return Response(items)


class FullDashboardView(APIView):
    """
    Get complete dashboard data in a single request.

    Combines:
    - Summary stats
    - Category breakdown
    - Sales trend
    - Recent activity
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({
            'summary': AnalyticsService.get_dashboard_summary(),
            'categories': AnalyticsService.get_livestock_by_category(),
            'sales_trend': AnalyticsService.get_sales_trend(days=30),
            'recent_activity': AnalyticsService.get_recent_activity(limit=5),
        })
