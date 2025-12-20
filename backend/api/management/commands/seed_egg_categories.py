"""
Management command to seed default egg categories.
Run with: python manage.py seed_egg_categories
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import EggCategory


class Command(BaseCommand):
    help = 'Seeds the database with default egg categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of categories even if they exist',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)

        categories = [
            {
                'name': 'Chicken',
                'description': 'Eggs from various chicken breeds including broilers and layers. Most common and widely consumed eggs.',
                'order': 1,
            },
            {
                'name': 'Turkey',
                'description': 'Turkey eggs are larger than chicken eggs with a richer, creamier taste. Great for baking.',
                'order': 2,
            },
            {
                'name': 'Guinea Fowl',
                'description': 'Guinea fowl eggs are smaller with a distinctive, gamey flavor. Prized in gourmet cooking.',
                'order': 3,
            },
            {
                'name': 'Quail',
                'description': 'Small, delicate quail eggs with a mild flavor. Often used as garnish and in fine dining.',
                'order': 4,
            },
            {
                'name': 'Duck',
                'description': 'Duck eggs have larger yolks and higher fat content, making them excellent for baking and rich dishes.',
                'order': 5,
            },
            {
                'name': 'Goose',
                'description': 'Large goose eggs with rich, buttery yolks. One goose egg equals about 3 chicken eggs.',
                'order': 6,
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for cat_data in categories:
            try:
                existing = EggCategory.objects.filter(name=cat_data['name']).first()

                if existing:
                    if force:
                        # Update existing category
                        existing.slug = slugify(cat_data['name'])
                        existing.description = cat_data['description']
                        existing.order = cat_data['order']
                        existing.is_active = True
                        existing.save()
                        updated_count += 1
                        self.stdout.write(
                            self.style.WARNING(f"Updated: {cat_data['name']}")
                        )
                    else:
                        skipped_count += 1
                        self.stdout.write(
                            self.style.NOTICE(f"Skipped (exists): {cat_data['name']}")
                        )
                else:
                    # Create new category
                    EggCategory.objects.create(
                        name=cat_data['name'],
                        slug=slugify(cat_data['name']),
                        description=cat_data['description'],
                        order=cat_data['order'],
                        is_active=True,
                    )
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"Created: {cat_data['name']}")
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error with {cat_data['name']}: {str(e)}")
                )

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Seed completed!'))
        self.stdout.write(f'  Created: {created_count}')
        self.stdout.write(f'  Updated: {updated_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')
        self.stdout.write(f'  Total categories: {EggCategory.objects.count()}')
