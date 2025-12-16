"""
WSGI config for glafrica project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

# Force psycopg to use pure-python implementation (no libpq C library needed)
# This MUST be set before Django imports anything - required for Vercel serverless
os.environ.setdefault('PSYCOPG_IMPL', 'python')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'glafrica.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

app = application
