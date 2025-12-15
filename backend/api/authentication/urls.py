"""
Authentication URL configuration for the admin API.
"""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminTokenObtainPairView,
    AdminTokenRefreshView,
    LogoutView,
    CurrentUserView,
    PasswordChangeView,
    AdminUserViewSet,
    ToggleUserStatusView,
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    # Authentication endpoints
    path('login/', AdminTokenObtainPairView.as_view(), name='admin-login'),
    path('token/refresh/', AdminTokenRefreshView.as_view(), name='admin-token-refresh'),
    path('logout/', LogoutView.as_view(), name='admin-logout'),

    # Current user endpoints
    path('me/', CurrentUserView.as_view(), name='admin-current-user'),
    path('password/change/', PasswordChangeView.as_view(), name='admin-password-change'),

    # User management (superadmin only)
    path('users/<int:user_id>/toggle-status/', ToggleUserStatusView.as_view(), name='admin-toggle-user-status'),
]

# Add router URLs
urlpatterns += router.urls
