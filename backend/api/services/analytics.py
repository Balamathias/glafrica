"""
Analytics service for dashboard metrics and reports.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from ..models import Livestock, Category, MediaAsset, AuditLog


class AnalyticsService:
    """Service for generating admin dashboard analytics."""

    @staticmethod
    def get_dashboard_summary():
        """Get quick stats for the dashboard."""
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Current counts
        total_livestock = Livestock.objects.count()
        available_livestock = Livestock.objects.filter(is_sold=False).count()
        sold_livestock = Livestock.objects.filter(is_sold=True).count()

        # Revenue calculations
        total_revenue = Livestock.objects.filter(
            is_sold=True,
            sold_price__isnull=False
        ).aggregate(total=Sum('sold_price'))['total'] or Decimal('0')

        pending_value = Livestock.objects.filter(
            is_sold=False
        ).aggregate(total=Sum('price'))['total'] or Decimal('0')

        # This week metrics
        new_this_week = Livestock.objects.filter(
            created_at__gte=week_ago
        ).count()

        sold_this_week = Livestock.objects.filter(
            sold_at__gte=week_ago
        ).count()

        revenue_this_week = Livestock.objects.filter(
            sold_at__gte=week_ago,
            sold_price__isnull=False
        ).aggregate(total=Sum('sold_price'))['total'] or Decimal('0')

        # Previous week for comparison
        two_weeks_ago = now - timedelta(days=14)
        sold_last_week = Livestock.objects.filter(
            sold_at__gte=two_weeks_ago,
            sold_at__lt=week_ago
        ).count()

        revenue_last_week = Livestock.objects.filter(
            sold_at__gte=two_weeks_ago,
            sold_at__lt=week_ago,
            sold_price__isnull=False
        ).aggregate(total=Sum('sold_price'))['total'] or Decimal('0')

        # Calculate percentage changes
        def calc_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 1)

        # Conversion rate (sold / total)
        conversion_rate = round((sold_livestock / total_livestock * 100), 1) if total_livestock > 0 else 0

        return {
            'total_livestock': total_livestock,
            'available_livestock': available_livestock,
            'sold_livestock': sold_livestock,
            'total_revenue': float(total_revenue),
            'pending_value': float(pending_value),
            'new_this_week': new_this_week,
            'sold_this_week': sold_this_week,
            'revenue_this_week': float(revenue_this_week),
            'sold_change': calc_change(sold_this_week, sold_last_week),
            'revenue_change': calc_change(float(revenue_this_week), float(revenue_last_week)),
            'conversion_rate': conversion_rate,
            'currency': 'NGN',
        }

    @staticmethod
    def get_livestock_by_category():
        """Get livestock distribution by category."""
        categories = Category.objects.annotate(
            total=Count('livestock'),
            available=Count('livestock', filter=Q(livestock__is_sold=False)),
            sold=Count('livestock', filter=Q(livestock__is_sold=True)),
            revenue=Sum('livestock__sold_price', filter=Q(livestock__is_sold=True))
        ).values('id', 'name', 'slug', 'total', 'available', 'sold', 'revenue')

        return list(categories)

    @staticmethod
    def get_sales_trend(days=30):
        """Get daily sales trend for the specified period."""
        start_date = timezone.now() - timedelta(days=days)

        sales_by_day = Livestock.objects.filter(
            sold_at__gte=start_date,
            is_sold=True
        ).annotate(
            date=TruncDate('sold_at')
        ).values('date').annotate(
            count=Count('id'),
            revenue=Sum('sold_price')
        ).order_by('date')

        return list(sales_by_day)

    @staticmethod
    def get_revenue_trend(days=30):
        """Get daily revenue trend for the specified period."""
        start_date = timezone.now() - timedelta(days=days)

        revenue_by_day = Livestock.objects.filter(
            sold_at__gte=start_date,
            is_sold=True
        ).annotate(
            date=TruncDate('sold_at')
        ).values('date').annotate(
            revenue=Sum('sold_price')
        ).order_by('date')

        # Fill in missing dates with zero
        result = []
        current_date = start_date.date()
        end_date = timezone.now().date()
        revenue_dict = {item['date']: float(item['revenue'] or 0) for item in revenue_by_day}

        while current_date <= end_date:
            result.append({
                'date': current_date.isoformat(),
                'revenue': revenue_dict.get(current_date, 0)
            })
            current_date += timedelta(days=1)

        return result

    @staticmethod
    def get_recent_activity(limit=10):
        """Get recent admin activity from audit logs."""
        activities = AuditLog.objects.select_related('user').order_by('-created_at')[:limit]

        return [
            {
                'id': str(activity.id),
                'user': activity.user.username if activity.user else 'System',
                'action': activity.action_type,
                'resource_type': activity.resource_type,
                'description': activity.description,
                'timestamp': activity.created_at.isoformat(),
            }
            for activity in activities
        ]

    @staticmethod
    def get_inventory_metrics():
        """Get detailed inventory metrics."""
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Price statistics
        price_stats = Livestock.objects.filter(is_sold=False).aggregate(
            avg_price=Avg('price'),
            min_price=Sum('price') - Sum('price'),  # Placeholder
            max_price=Sum('price'),
            total_value=Sum('price')
        )

        # Get actual min/max
        available = Livestock.objects.filter(is_sold=False)
        min_price = available.order_by('price').values_list('price', flat=True).first() or 0
        max_price = available.order_by('-price').values_list('price', flat=True).first() or 0
        avg_price = available.aggregate(avg=Avg('price'))['avg'] or 0

        # Age distribution (approximate by parsing age strings)
        age_distribution = {
            'young': available.filter(
                Q(age__icontains='month') | Q(age__icontains='week')
            ).count(),
            'adult': available.filter(
                Q(age__icontains='year') | Q(age__icontains='yr')
            ).count(),
        }

        # Gender distribution
        gender_distribution = list(
            available.values('gender').annotate(count=Count('id'))
        )

        # Top performing categories
        top_categories = list(
            Category.objects.annotate(
                sold_count=Count('livestock', filter=Q(livestock__is_sold=True)),
                revenue=Sum('livestock__sold_price', filter=Q(livestock__is_sold=True))
            ).order_by('-revenue')[:5].values('name', 'sold_count', 'revenue')
        )

        return {
            'price_range': {
                'min': float(min_price),
                'max': float(max_price),
                'avg': float(avg_price),
                'total_value': float(price_stats['total_value'] or 0),
            },
            'age_distribution': age_distribution,
            'gender_distribution': gender_distribution,
            'top_categories': top_categories,
            'media_count': MediaAsset.objects.count(),
            'categories_count': Category.objects.count(),
        }

    @staticmethod
    def get_sales_analytics(start_date=None, end_date=None):
        """Get detailed sales analytics for a date range."""
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()

        sold_items = Livestock.objects.filter(
            is_sold=True,
            sold_at__gte=start_date,
            sold_at__lte=end_date
        )

        total_sales = sold_items.count()
        total_revenue = sold_items.aggregate(total=Sum('sold_price'))['total'] or Decimal('0')
        avg_sale_price = sold_items.aggregate(avg=Avg('sold_price'))['avg'] or Decimal('0')

        # Sales by category
        sales_by_category = list(
            sold_items.values('category__name').annotate(
                count=Count('id'),
                revenue=Sum('sold_price')
            ).order_by('-revenue')
        )

        # Daily breakdown
        daily_sales = list(
            sold_items.annotate(date=TruncDate('sold_at')).values('date').annotate(
                count=Count('id'),
                revenue=Sum('sold_price')
            ).order_by('date')
        )

        # Weekly breakdown
        weekly_sales = list(
            sold_items.annotate(week=TruncWeek('sold_at')).values('week').annotate(
                count=Count('id'),
                revenue=Sum('sold_price')
            ).order_by('week')
        )

        return {
            'period': {
                'start': start_date.isoformat() if hasattr(start_date, 'isoformat') else str(start_date),
                'end': end_date.isoformat() if hasattr(end_date, 'isoformat') else str(end_date),
            },
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'average_sale_price': float(avg_sale_price),
            'sales_by_category': sales_by_category,
            'daily_trend': daily_sales,
            'weekly_trend': weekly_sales,
        }

    @staticmethod
    def get_top_items(limit=10, by='views'):
        """
        Get top performing livestock items.
        Note: Views tracking would require additional implementation.
        Currently returns by price for available items.
        """
        items = Livestock.objects.filter(is_sold=False).select_related('category')

        if by == 'price':
            items = items.order_by('-price')
        else:
            items = items.order_by('-created_at')

        return [
            {
                'id': str(item.id),
                'name': item.name,
                'category': item.category.name,
                'price': float(item.price),
                'currency': item.currency,
            }
            for item in items[:limit]
        ]
