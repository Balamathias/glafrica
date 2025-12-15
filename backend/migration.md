# Database Migration Guide

Migrate data from your local PostgreSQL database to a hosted database.

## Prerequisites

- Both databases should have the same schema (run migrations on the hosted DB first)
- Install `dj-database-url` if using connection strings: `pip install dj-database-url`

## Setup

### Option 1: Add hosted database to settings.py

```python
DATABASES = {
    'default': {
        # Your current local database config
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'glafrica_local',
        'USER': 'postgres',
        'PASSWORD': 'your_local_password',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'hosted': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'your-hosted-db.example.com',
        'PORT': '5432',
    }
}
```

### Option 2: Use environment variable

```bash
export HOSTED_DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## Run Migrations on Hosted Database First

Before migrating data, ensure the hosted database has the correct schema:

```bash
uv run python manage.py migrate --database=hosted
```

## Usage

### 1. Dry Run (Preview)

See what will be migrated without making changes:

```bash
uv run python manage.py migrate_data --dry-run
```

### 2. Full Migration

Migrate all data to the hosted database:

```bash
# Using database alias from settings
uv run python manage.py migrate_data --target=hosted

# Or using direct connection URL
uv run python manage.py migrate_data --database-url="postgresql://user:pass@host:5432/dbname"
```

### 3. Migrate Specific Models

Only migrate certain models:

```bash
uv run python manage.py migrate_data --models=Category,Tag,Livestock,MediaAsset
```

### 4. Skip User Data

Migrate without user-related data:

```bash
uv run python manage.py migrate_data --skip-users
```

### 5. Clear Target Before Migration

**Use with caution!** This deletes existing data in the target database:

```bash
uv run python manage.py migrate_data --clear-target
```

### 6. Adjust Batch Size

For large datasets or memory constraints:

```bash
uv run python manage.py migrate_data --batch-size=50
```

## Migration Order

The command respects foreign key dependencies and migrates in this order:

1. **User** - Django auth users
2. **Category** - Livestock categories
3. **Tag** - Livestock tags
4. **Livestock** - Main livestock records
5. **MediaAsset** - Images/videos linked to livestock
6. **UserProfile** - Extended user profiles
7. **AuditLog** - Admin action logs
8. **ContactInquiry** - Contact form submissions

Many-to-many relationships (like `Livestock.tags`) are migrated after all models.

## Command Options Reference

| Option | Description | Default |
|--------|-------------|---------|
| `--target` | Database alias from DATABASES settings | `hosted` |
| `--database-url` | Direct PostgreSQL connection URL | - |
| `--models` | Comma-separated list of models to migrate | All |
| `--dry-run` | Preview without migrating | `False` |
| `--batch-size` | Records per batch | `100` |
| `--skip-users` | Skip User and UserProfile | `False` |
| `--clear-target` | Delete target data first (DANGEROUS) | `False` |

## Troubleshooting

### Connection Issues

```bash
# Test connection to hosted database
uv run python manage.py dbshell --database=hosted
```

### Foreign Key Errors

Ensure you're migrating in the correct order. If migrating specific models, include their dependencies:

```bash
# Wrong - MediaAsset depends on Livestock
uv run python manage.py migrate_data --models=MediaAsset

# Correct - Include dependencies
uv run python manage.py migrate_data --models=Category,Livestock,MediaAsset
```

### Duplicate Key Errors

Records with the same UUID already exist in the target. Use `--clear-target` to start fresh, or the command will skip duplicates automatically.

### Memory Issues

Reduce batch size for large datasets:

```bash
uv run python manage.py migrate_data --batch-size=25
```

## Post-Migration Verification

After migration, verify data integrity:

```bash
# Check record counts
uv run python manage.py shell --database=hosted
```

```python
from api.models import *

print(f"Categories: {Category.objects.count()}")
print(f"Tags: {Tag.objects.count()}")
print(f"Livestock: {Livestock.objects.count()}")
print(f"MediaAssets: {MediaAsset.objects.count()}")
print(f"ContactInquiries: {ContactInquiry.objects.count()}")
```

## Switching to Hosted Database

After successful migration, update your `settings.py` to use the hosted database as default:

```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', 'postgresql://user:pass@host:5432/dbname')
    )
}
```

Or set the environment variable:

```bash
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
```
