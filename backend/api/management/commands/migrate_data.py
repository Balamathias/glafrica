"""
Management command to migrate data from local PostgreSQL to hosted database.

Usage:
    1. Configure your hosted database in settings.py under DATABASES['hosted']
    2. Run: python manage.py migrate_data --target=hosted

    Or use direct connection string:
    python manage.py migrate_data --database-url="postgresql://user:pass@host:port/dbname"

Options:
    --target: Database alias from DATABASES settings (default: 'hosted')
    --database-url: Direct connection string (overrides --target)
    --models: Comma-separated list of models to migrate (default: all)
    --dry-run: Show what would be migrated without actually doing it
    --batch-size: Number of records to migrate per batch (default: 100)
    --skip-users: Skip User and UserProfile models
"""

import json
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.db import connections, transaction
from django.conf import settings
from api.models import (
    Category, Tag, Livestock, MediaAsset,
    UserProfile, AuditLog, ContactInquiry
)


class Command(BaseCommand):
    help = 'Migrate data from local database to hosted database'

    # Define migration order (respects foreign key dependencies)
    MODEL_ORDER = [
        ('User', User),
        ('Category', Category),
        ('Tag', Tag),
        ('Livestock', Livestock),
        ('MediaAsset', MediaAsset),
        ('UserProfile', UserProfile),
        ('AuditLog', AuditLog),
        ('ContactInquiry', ContactInquiry),
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            '--target',
            type=str,
            default='hosted',
            help='Target database alias from DATABASES settings'
        )
        parser.add_argument(
            '--database-url',
            type=str,
            help='Direct database connection URL (postgresql://user:pass@host:port/dbname)'
        )
        parser.add_argument(
            '--models',
            type=str,
            help='Comma-separated list of model names to migrate (e.g., Category,Tag,Livestock)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to migrate per batch'
        )
        parser.add_argument(
            '--skip-users',
            action='store_true',
            help='Skip User and UserProfile models'
        )
        parser.add_argument(
            '--clear-target',
            action='store_true',
            help='Clear existing data in target database before migration (DANGEROUS!)'
        )

    def handle(self, *args, **options):
        target_alias = options['target']
        database_url = options.get('database_url')
        dry_run = options['dry_run']
        batch_size = options['batch_size']
        skip_users = options['skip_users']
        clear_target = options['clear_target']
        models_filter = options.get('models')

        # Configure target database
        if database_url:
            self._configure_database_from_url(database_url, target_alias)
        elif target_alias not in settings.DATABASES:
            raise CommandError(
                f"Database '{target_alias}' not found in settings. "
                f"Either add it to DATABASES or use --database-url option."
            )

        # Filter models if specified
        models_to_migrate = self.MODEL_ORDER.copy()
        if models_filter:
            model_names = [m.strip() for m in models_filter.split(',')]
            models_to_migrate = [
                (name, model) for name, model in self.MODEL_ORDER
                if name in model_names
            ]

        if skip_users:
            models_to_migrate = [
                (name, model) for name, model in models_to_migrate
                if name not in ('User', 'UserProfile')
            ]

        # Display migration plan
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Data Migration Plan ===\n'))
        self.stdout.write(f"Source: default (local)")
        self.stdout.write(f"Target: {target_alias}")
        self.stdout.write(f"Batch size: {batch_size}")
        self.stdout.write(f"Dry run: {dry_run}")
        self.stdout.write(f"\nModels to migrate:")

        total_records = 0
        for name, model in models_to_migrate:
            count = model.objects.using('default').count()
            total_records += count
            self.stdout.write(f"  - {name}: {count} records")

        self.stdout.write(f"\nTotal: {total_records} records\n")

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No data will be migrated'))
            return

        # Confirm before proceeding
        if not options.get('no_input', False):
            confirm = input('\nProceed with migration? [y/N]: ')
            if confirm.lower() != 'y':
                self.stdout.write(self.style.WARNING('Migration cancelled'))
                return

        # Test target connection
        try:
            connections[target_alias].ensure_connection()
            self.stdout.write(self.style.SUCCESS(f'Connected to target database'))
        except Exception as e:
            raise CommandError(f"Cannot connect to target database: {e}")

        # Clear target if requested
        if clear_target:
            self._clear_target_database(target_alias, models_to_migrate)

        # Perform migration
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Starting Migration ===\n'))

        for name, model in models_to_migrate:
            self._migrate_model(name, model, target_alias, batch_size)

        # Handle M2M relationships separately
        self._migrate_m2m_relationships(target_alias)

        self.stdout.write(self.style.SUCCESS('\n=== Migration Complete ===\n'))

    def _configure_database_from_url(self, url: str, alias: str):
        """Parse database URL and add to settings."""
        import dj_database_url
        db_config = dj_database_url.parse(url)
        settings.DATABASES[alias] = db_config
        self.stdout.write(f"Configured database from URL: {db_config.get('HOST', 'unknown')}")

    def _clear_target_database(self, alias: str, models: list):
        """Clear existing data in target database (reverse order to respect FK constraints)."""
        self.stdout.write(self.style.WARNING('\nClearing target database...'))

        # Reverse order for deletion (children first)
        for name, model in reversed(models):
            try:
                count = model.objects.using(alias).count()
                if count > 0:
                    model.objects.using(alias).all().delete()
                    self.stdout.write(f"  Deleted {count} {name} records")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  Error clearing {name}: {e}"))

    def _migrate_model(self, name: str, model, target_alias: str, batch_size: int):
        """Migrate a single model's data."""
        source_qs = model.objects.using('default').all()
        total = source_qs.count()

        if total == 0:
            self.stdout.write(f"  {name}: No records to migrate")
            return

        self.stdout.write(f"  Migrating {name}...")

        migrated = 0
        skipped = 0
        errors = 0

        # Process in batches
        for i in range(0, total, batch_size):
            batch = list(source_qs[i:i + batch_size])

            for obj in batch:
                try:
                    # Check if record already exists
                    if self._record_exists(model, obj, target_alias):
                        skipped += 1
                        continue

                    # Save to target database
                    self._save_object(obj, model, target_alias)
                    migrated += 1

                except Exception as e:
                    errors += 1
                    self.stdout.write(
                        self.style.ERROR(f"    Error migrating {name} {obj.pk}: {e}")
                    )

            # Progress update
            progress = min(i + batch_size, total)
            self.stdout.write(f"    Progress: {progress}/{total}", ending='\r')

        self.stdout.write(
            f"  {name}: migrated={migrated}, skipped={skipped}, errors={errors}"
            + " " * 20  # Clear progress line
        )

    def _record_exists(self, model, obj, alias: str) -> bool:
        """Check if a record already exists in target database."""
        return model.objects.using(alias).filter(pk=obj.pk).exists()

    def _save_object(self, obj, model, alias: str):
        """Save an object to the target database."""
        # For User model, we need special handling
        if model == User:
            # Create user without triggering signals
            user_data = {
                'id': obj.id,
                'username': obj.username,
                'email': obj.email,
                'password': obj.password,  # Already hashed
                'first_name': obj.first_name,
                'last_name': obj.last_name,
                'is_active': obj.is_active,
                'is_staff': obj.is_staff,
                'is_superuser': obj.is_superuser,
                'date_joined': obj.date_joined,
                'last_login': obj.last_login,
            }
            User.objects.using(alias).create(**user_data)
            return

        # For models with FK relationships, ensure related objects exist
        # The order of MODEL_ORDER ensures this

        # Clone the object for the new database
        obj.pk = obj.pk  # Keep the same PK
        obj._state.db = alias
        obj._state.adding = True

        # Use force_insert to prevent update attempts
        obj.save(using=alias, force_insert=True)

    def _migrate_m2m_relationships(self, target_alias: str):
        """Migrate M2M relationships (like Livestock.tags)."""
        self.stdout.write("\n  Migrating M2M relationships...")

        # Livestock.tags
        livestock_with_tags = Livestock.objects.using('default').prefetch_related('tags').filter(tags__isnull=False).distinct()

        for livestock in livestock_with_tags:
            try:
                tag_ids = list(livestock.tags.values_list('id', flat=True))
                if tag_ids:
                    # Get the livestock object from target
                    target_livestock = Livestock.objects.using(target_alias).get(pk=livestock.pk)
                    # Get tags from target
                    target_tags = Tag.objects.using(target_alias).filter(id__in=tag_ids)
                    # Set the relationship
                    target_livestock.tags.set(target_tags)
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"    Error migrating tags for Livestock {livestock.pk}: {e}")
                )

        self.stdout.write(self.style.SUCCESS("  M2M relationships migrated"))
