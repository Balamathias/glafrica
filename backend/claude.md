# Green Life Africa's Backend API - Development Instructions

## Project Overview
This is a Django 5 backend application serving as the API for Green Life Africa. It provides secure, scalable, and efficient endpoints for the Next.js frontend, managing authentication, livestock data, and livestock management logic. The core idea is to provide a rich showcase of livestock data, image/video gallery (infinite discovery) like pinterest with varied sizes.

## Technology Stack
- **Framework**: Django 5.x
- **API Toolkit**: Django Rest Framework (DRF)
- **Database**: PostgreSQL (Production), SQLite (Dev - optional but prefer Postgres)
- **Authentication**: JWT (SimpleJWT)
- **Storage**: Cloudinary (Media), Whitenoise (Static)
- **Language**: Python 3.9+ (Environment managed via `requirements.txt`)

## Project Structure

### App Organization
Modularize code into apps based on domain logic.
```
backend/
├── glafrica/              # Project settings & configuration
├── api/                   # Main API app (or split into users, investments, etc.)
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── ...
├── manage.py
└── vercel.json
```

**Rules:**
- Keep apps focused: `users`, `investments`, `payments`, etc.
- Use `settings.py` for global config, decoupled from app logic.
- Place utility scripts in `utils/` or within relevant app `utils.py`.

## Development Best Practices

### Django & DRF Standards
- **Models**: Use descriptive field names. Always define `__str__` methods. Use `TimeStampedModel` (abstract) for `created_at`/`updated_at`.
- **Serializers**: Use `ModelSerializer` where possible. Keep validation logic in serializers, not views.
- **Views**: Prefer `ViewSet` or `GenericAPIView` for consistency. Avoid function-based views unless simple.
- **URLs**: Use Routers for ViewSets. Explicit paths for strictly defined endpoints.

### Code Quality
- **Type Hinting**: Use Python type hints (`def get_queryset(self) -> QuerySet:`) for clarity.
- **Linting**: Follow PEP 8.
- **Environment Variables**: NEVER hardcode secrets. Use `python-dotenv` and `os.getenv`.

### Security
- **Authentication**: All private endpoints must require `IsAuthenticated`.
- **Permissions**: Use DRF permission classes (`IsOwner`, `IsAdminUser`).
- **Data**: Validate all inputs. Sanitize data before processing.
- **CORS**: Configured in settings. Restrict to trusted domains in production.

### API Design
- **RESTful**: Use proper HTTP verbs (GET, POST, PUT, DELETE).
- **Responses**: Standardize error responses (e.g., `{"detail": "Error message"}`).
- **Pagination**: Use standard pagination for lists (PageNumberPagination).
- **Versioning**: Namespace API versions if needed (e.g., `/api/v1/`).

## File Naming Conventions
- **Apps**: Lowercase, plural usually (`users`, `orders`).
- **Classes**: PascalCase (`UserProfile`, `OrderSerializer`).
- **Functions/Variables**: snake_case (`get_user_profile`, `is_active`).
- **Files**: snake_case (`permissions.py`, `renderers.py`).

## Performance & Deployment
- **Database**: Use `select_related` and `prefetch_related` to avoid N+1 queries.
- **Static Files**: Configured with `whitenoise` for production.
- **Deployment**: Vercel (using `vercel.json` and `build_files.sh`).
- **WSGI**: Configured in `glafrica/wsgi.py` for Vercel integration.

## Key Commands
- `python manage.py runserver` - Development server
- `python manage.py makemigrations` - Create migration files
- `python manage.py migrate` - Apply migrations
- `python manage.py createsuperuser` - Create admin
- `python manage.py test` - Run tests

---

**Last Updated**: December 2025
**Status**: Active Development
