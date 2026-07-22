"""
Authentication module for the admin API.
"""

from .serializers import (
    AdminTokenObtainPairSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    LogoutSerializer,
    PasswordChangeSerializer,
    UserProfileSerializer,
)
from .views import (
    AdminTokenObtainPairView,
    AdminTokenRefreshView,
    AdminUserViewSet,
    CurrentUserView,
    LogoutView,
    PasswordChangeView,
    ToggleUserStatusView,
)

__all__ = [
    # Views
    "AdminTokenObtainPairView",
    "AdminTokenRefreshView",
    "LogoutView",
    "CurrentUserView",
    "PasswordChangeView",
    "AdminUserViewSet",
    "ToggleUserStatusView",
    # Serializers
    "AdminTokenObtainPairSerializer",
    "AdminUserSerializer",
    "AdminUserUpdateSerializer",
    "AdminUserCreateSerializer",
    "PasswordChangeSerializer",
    "LogoutSerializer",
    "UserProfileSerializer",
]
