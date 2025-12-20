"""
Management command to cleanup old visit tracking data.
Runs daily to maintain 30-day data retention policy.

Usage:
    python manage.py cleanup_old_visits
    python manage.py cleanup_old_visits --days=60  # Override retention period
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import PageView, VisitorSession


class Command(BaseCommand):
    help = 'Cleanup old visit tracking data (default: older than 30 days)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to retain data (default: 30)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cutoff_date = timezone.now() - timedelta(days=days)

        self.stdout.write(f"Cleanup cutoff date: {cutoff_date.isoformat()}")

        # Count records to delete
        page_views_count = PageView.objects.filter(created_at__lt=cutoff_date).count()
        sessions_count = VisitorSession.objects.filter(last_activity__lt=cutoff_date).count()

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"[DRY RUN] Would delete:\n"
                f"  - {page_views_count} page views\n"
                f"  - {sessions_count} visitor sessions"
            ))
            return

        # Delete old page views
        if page_views_count > 0:
            PageView.objects.filter(created_at__lt=cutoff_date).delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {page_views_count} page views"))

        # Delete old sessions
        if sessions_count > 0:
            VisitorSession.objects.filter(last_activity__lt=cutoff_date).delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {sessions_count} visitor sessions"))

        if page_views_count == 0 and sessions_count == 0:
            self.stdout.write(self.style.SUCCESS("No old records to delete"))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"Cleanup complete. Removed {page_views_count + sessions_count} total records."
            ))
