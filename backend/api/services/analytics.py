"""
Analytics service for dashboard metrics and reports.
"""
from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from ..models import Livestock, Category, MediaAsset, AuditLog, PageView, VisitorSession, Egg, EggCategory


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
        Now supports actual view counts from PageView model.
        """
        items = Livestock.objects.filter(is_sold=False).select_related('category')

        if by == 'views':
            # Annotate with view count from PageView
            items = items.annotate(
                view_count=Count('page_views', filter=Q(page_views__event_type='livestock_view'))
            ).order_by('-view_count')
        elif by == 'price':
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
                'view_count': getattr(item, 'view_count', 0),
            }
            for item in items[:limit]
        ]

    # ============================================
    # VISITOR ANALYTICS METHODS
    # ============================================

    @staticmethod
    def get_visitor_summary(days=30):
        """Get visitor summary metrics for the specified period."""
        start_date = timezone.now() - timedelta(days=days)
        prev_start = start_date - timedelta(days=days)

        # Current period metrics
        current_views = PageView.objects.filter(created_at__gte=start_date)
        current_sessions = VisitorSession.objects.filter(first_visit__gte=start_date)

        total_visits = current_views.count()
        unique_visitors = current_sessions.count()

        # Calculate bounce rate (sessions with only 1 page view)
        bounce_sessions = current_sessions.filter(page_count=1).count()
        bounce_rate = round((bounce_sessions / unique_visitors * 100), 1) if unique_visitors > 0 else 0

        # Average session duration (in seconds)
        sessions_with_duration = current_sessions.exclude(page_count=1)
        if sessions_with_duration.exists():
            total_duration = sum(
                (s.last_activity - s.first_visit).total_seconds()
                for s in sessions_with_duration
            )
            avg_duration = total_duration / sessions_with_duration.count()
        else:
            avg_duration = 0

        # Previous period for comparison
        prev_views = PageView.objects.filter(
            created_at__gte=prev_start,
            created_at__lt=start_date
        )
        prev_sessions = VisitorSession.objects.filter(
            first_visit__gte=prev_start,
            first_visit__lt=start_date
        )

        prev_total_visits = prev_views.count()
        prev_unique_visitors = prev_sessions.count()

        # Calculate percentage changes
        def calc_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 1)

        return {
            'total_visits': total_visits,
            'unique_visitors': unique_visitors,
            'bounce_rate': bounce_rate,
            'avg_session_duration': round(avg_duration, 0),  # In seconds
            'visits_change': calc_change(total_visits, prev_total_visits),
            'visitors_change': calc_change(unique_visitors, prev_unique_visitors),
            'period_days': days,
        }

    @staticmethod
    def get_visit_trend(days=30):
        """Get daily visit trend for the specified period."""
        start_date = timezone.now() - timedelta(days=days)

        # Page views by day
        views_by_day = PageView.objects.filter(
            created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            visits=Count('id'),
            unique_sessions=Count('session_id', distinct=True)
        ).order_by('date')

        # Fill in missing dates
        result = []
        current_date = start_date.date()
        end_date = timezone.now().date()
        views_dict = {
            item['date']: {
                'visits': item['visits'],
                'unique_visitors': item['unique_sessions']
            }
            for item in views_by_day
        }

        while current_date <= end_date:
            data = views_dict.get(current_date, {'visits': 0, 'unique_visitors': 0})
            result.append({
                'date': current_date.isoformat(),
                'visits': data['visits'],
                'unique_visitors': data['unique_visitors'],
            })
            current_date += timedelta(days=1)

        return result

    @staticmethod
    def get_top_pages(limit=10, days=30):
        """Get most viewed pages."""
        start_date = timezone.now() - timedelta(days=days)

        top_pages = PageView.objects.filter(
            created_at__gte=start_date,
            event_type='page_view'
        ).values('path').annotate(
            views=Count('id'),
            unique_visitors=Count('session_id', distinct=True)
        ).order_by('-views')[:limit]

        return list(top_pages)

    @staticmethod
    def get_top_livestock_views(limit=10, days=30):
        """Get most viewed livestock items."""
        start_date = timezone.now() - timedelta(days=days)

        top_livestock = PageView.objects.filter(
            created_at__gte=start_date,
            event_type='livestock_view',
            livestock__isnull=False
        ).values(
            'livestock__id',
            'livestock__name',
            'livestock__breed',
            'livestock__price',
            'livestock__category__name'
        ).annotate(
            views=Count('id'),
            unique_viewers=Count('session_id', distinct=True)
        ).order_by('-views')[:limit]

        return [
            {
                'id': str(item['livestock__id']),
                'name': item['livestock__name'],
                'breed': item['livestock__breed'],
                'price': float(item['livestock__price']) if item['livestock__price'] else 0,
                'category': item['livestock__category__name'],
                'views': item['views'],
                'unique_viewers': item['unique_viewers'],
            }
            for item in top_livestock
        ]

    @staticmethod
    def get_device_breakdown(days=30):
        """Get visitor device type breakdown."""
        start_date = timezone.now() - timedelta(days=days)

        devices = VisitorSession.objects.filter(
            first_visit__gte=start_date
        ).values('device_type').annotate(
            count=Count('id')
        ).order_by('-count')

        total = sum(d['count'] for d in devices)

        return [
            {
                'device_type': item['device_type'],
                'count': item['count'],
                'percentage': round((item['count'] / total * 100), 1) if total > 0 else 0,
            }
            for item in devices
        ]

    @staticmethod
    def get_traffic_sources(limit=10, days=30):
        """Get traffic sources from referrers."""
        start_date = timezone.now() - timedelta(days=days)
        from urllib.parse import urlparse

        # Get referrers
        referrers = PageView.objects.filter(
            created_at__gte=start_date,
            referrer__isnull=False
        ).exclude(referrer='').values_list('referrer', flat=True)

        # Parse domains and count
        domain_counts = {}
        for referrer in referrers:
            try:
                parsed = urlparse(referrer)
                domain = parsed.netloc or 'Direct'
                if domain:
                    domain_counts[domain] = domain_counts.get(domain, 0) + 1
            except:
                pass

        # Add direct traffic (no referrer)
        direct_count = PageView.objects.filter(
            created_at__gte=start_date
        ).filter(Q(referrer__isnull=True) | Q(referrer='')).count()

        if direct_count > 0:
            domain_counts['Direct / None'] = direct_count

        # Sort and limit
        sorted_sources = sorted(domain_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        total = sum(count for _, count in sorted_sources)

        return [
            {
                'source': source,
                'visits': count,
                'percentage': round((count / total * 100), 1) if total > 0 else 0,
            }
            for source, count in sorted_sources
        ]

    @staticmethod
    def get_geographic_breakdown(limit=10, days=30):
        """Get visitor geographic distribution by country."""
        start_date = timezone.now() - timedelta(days=days)

        countries = VisitorSession.objects.filter(
            first_visit__gte=start_date
        ).exclude(country='').values('country').annotate(
            visitors=Count('id')
        ).order_by('-visitors')[:limit]

        total = sum(c['visitors'] for c in countries)

        return [
            {
                'country': item['country'] or 'Unknown',
                'visitors': item['visitors'],
                'percentage': round((item['visitors'] / total * 100), 1) if total > 0 else 0,
            }
            for item in countries
        ]

    # ============================================
    # EGG ANALYTICS METHODS
    # ============================================

    @staticmethod
    def get_top_egg_views(limit=10, days=30):
        """Get most viewed egg products."""
        start_date = timezone.now() - timedelta(days=days)

        top_eggs = PageView.objects.filter(
            created_at__gte=start_date,
            event_type='egg_view',
            egg__isnull=False
        ).values(
            'egg__id',
            'egg__name',
            'egg__breed',
            'egg__price',
            'egg__packaging',
            'egg__freshness_status',
            'egg__category__name'
        ).annotate(
            views=Count('id'),
            unique_viewers=Count('session_id', distinct=True)
        ).order_by('-views')[:limit]

        return [
            {
                'id': str(item['egg__id']),
                'name': item['egg__name'],
                'breed': item['egg__breed'],
                'price': float(item['egg__price']) if item['egg__price'] else 0,
                'packaging': item['egg__packaging'],
                'category': item['egg__category__name'],
                'views': item['views'],
                'unique_viewers': item['unique_viewers'],
            }
            for item in top_eggs
        ]

    @staticmethod
    def get_egg_dashboard_summary():
        """Get egg-specific dashboard summary metrics."""
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)

        # Current counts
        total_eggs = Egg.objects.count()
        available_eggs = Egg.objects.filter(is_available=True).count()
        featured_eggs = Egg.objects.filter(is_featured=True).count()

        # Freshness metrics
        fresh_count = 0
        use_soon_count = 0
        expiring_soon_count = 0
        expired_count = 0

        for egg in Egg.objects.filter(is_available=True):
            status = egg.freshness_status
            if status == 'fresh':
                fresh_count += 1
            elif status == 'use_soon':
                use_soon_count += 1
            elif status == 'expiring_soon':
                expiring_soon_count += 1
            elif status == 'expired':
                expired_count += 1

        # Total inventory value
        total_value = Egg.objects.filter(
            is_available=True
        ).aggregate(
            total=Sum(F('price') * F('quantity_available'))
        )['total'] or Decimal('0')

        # By category
        eggs_by_category = list(
            EggCategory.objects.filter(is_active=True).annotate(
                total=Count('eggs'),
                available=Count('eggs', filter=Q(eggs__is_available=True)),
                value=Sum(
                    F('eggs__price') * F('eggs__quantity_available'),
                    filter=Q(eggs__is_available=True)
                )
            ).values('id', 'name', 'slug', 'total', 'available', 'value')
        )

        # New this week
        new_this_week = Egg.objects.filter(
            created_at__gte=week_ago
        ).count()

        # Price statistics
        available_queryset = Egg.objects.filter(is_available=True)
        min_price = available_queryset.order_by('price').values_list('price', flat=True).first() or 0
        max_price = available_queryset.order_by('-price').values_list('price', flat=True).first() or 0
        avg_price = available_queryset.aggregate(avg=Avg('price'))['avg'] or 0

        return {
            'total_eggs': total_eggs,
            'available_eggs': available_eggs,
            'featured_eggs': featured_eggs,
            'freshness': {
                'fresh': fresh_count,
                'use_soon': use_soon_count,
                'expiring_soon': expiring_soon_count,
                'expired': expired_count,
            },
            'total_value': float(total_value),
            'eggs_by_category': eggs_by_category,
            'new_this_week': new_this_week,
            'price_range': {
                'min': float(min_price),
                'max': float(max_price),
                'avg': float(avg_price),
            },
            'currency': 'NGN',
        }

    @staticmethod
    def get_eggs_by_category():
        """Get egg distribution by category."""
        categories = EggCategory.objects.filter(is_active=True).annotate(
            total=Count('eggs'),
            available=Count('eggs', filter=Q(eggs__is_available=True)),
            total_units=Sum('eggs__quantity_available', filter=Q(eggs__is_available=True)),
            value=Sum(
                F('eggs__price') * F('eggs__quantity_available'),
                filter=Q(eggs__is_available=True)
            )
        ).values('id', 'name', 'slug', 'total', 'available', 'total_units', 'value').order_by('order')

        return list(categories)

    @staticmethod
    def get_expiring_eggs(days=7):
        """Get eggs expiring within the specified number of days."""
        now = timezone.now()
        threshold_date = (now + timedelta(days=days)).date()

        expiring = Egg.objects.filter(
            is_available=True,
            expiry_date__lte=threshold_date,
            expiry_date__gte=now.date()
        ).select_related('category').order_by('expiry_date')

        return [
            {
                'id': str(egg.id),
                'name': egg.name,
                'breed': egg.breed,
                'category': egg.category.name if egg.category else None,
                'packaging': egg.packaging,
                'quantity_available': egg.quantity_available,
                'price': float(egg.price),
                'production_date': egg.production_date.isoformat() if egg.production_date else None,
                'expiry_date': egg.expiry_date.isoformat() if egg.expiry_date else None,
                'days_until_expiry': egg.days_until_expiry,
                'freshness_status': egg.freshness_status,
            }
            for egg in expiring
        ]

    @staticmethod
    def get_top_egg_items(limit=10, by='views'):
        """
        Get top performing egg items.
        Supports sorting by views, price, or freshness.
        """
        items = Egg.objects.filter(is_available=True).select_related('category')

        if by == 'views':
            # Annotate with view count from PageView
            items = items.annotate(
                view_count=Count('page_views', filter=Q(page_views__event_type='egg_view'))
            ).order_by('-view_count')
        elif by == 'price':
            items = items.order_by('-price')
        elif by == 'quantity':
            items = items.order_by('-quantity_available')
        else:
            items = items.order_by('-created_at')

        return [
            {
                'id': str(item.id),
                'name': item.name,
                'breed': item.breed,
                'category': item.category.name if item.category else None,
                'packaging': item.packaging,
                'eggs_per_unit': item.eggs_per_unit,
                'price': float(item.price),
                'currency': item.currency,
                'quantity_available': item.quantity_available,
                'freshness_status': item.freshness_status,
                'view_count': getattr(item, 'view_count', 0),
            }
            for item in items[:limit]
        ]
