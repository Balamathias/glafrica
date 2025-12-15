"""
Authentication module for the admin API.
"""
from .views import (
    AdminTokenObtainPairView,
    AdminTokenRefreshView,
    LogoutView,
    CurrentUserView,
    PasswordChangeView,
    AdminUserViewSet,
    ToggleUserStatusView,
)

from .serializers import (
    AdminTokenObtainPairSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    AdminUserCreateSerializer,
    PasswordChangeSerializer,
    LogoutSerializer,
    UserProfileSerializer,
)

__all__ = [
    # Views
    'AdminTokenObtainPairView',
    'AdminTokenRefreshView',
    'LogoutView',
    'CurrentUserView',
    'PasswordChangeView',
    'AdminUserViewSet',
    'ToggleUserStatusView',
    # Serializers
    'AdminTokenObtainPairSerializer',
    'AdminUserSerializer',
    'AdminUserUpdateSerializer',
    'AdminUserCreateSerializer',
    'PasswordChangeSerializer',
    'LogoutSerializer',
    'UserProfileSerializer',
]
