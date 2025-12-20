"""
Custom permission classes for the admin API.
"""
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to admin users (is_staff=True).
    """
    message = "Admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )


class IsSuperAdmin(BasePermission):
    """
    Allows access only to super administrator users.
    """
    message = "Super administrator access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        profile = getattr(request.user, 'profile', None)
        return profile and profile.role == 'superadmin'


class IsActiveAdmin(BasePermission):
    """
    Checks if the user is an active admin (not deactivated).
    """
    message = "Your admin account is deactivated."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_staff:
            return False

        profile = getattr(request.user, 'profile', None)
        if profile and not profile.is_active_admin:
            return False

        return True


class RoleBasedPermission(BasePermission):
    """
    Role-based permission with granular control.

    Usage in views:
        permission_classes = [IsAdminUser, RoleBasedPermission]
        required_permission = 'livestock.delete'
    """
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not request.user.is_staff:
            return False

        # Superusers have all permissions
        if request.user.is_superuser:
            return True

        # Get required permission from view
        required_permission = getattr(view, 'required_permission', None)
        if not required_permission:
            return True  # No specific permission required

        # Check user profile for permission
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        return profile.has_permission(required_permission)


class CanViewLivestock(BasePermission):
    """Shortcut permission for viewing livestock."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        return profile and profile.has_permission('livestock.view')


class CanManageLivestock(BasePermission):
    """Shortcut permission for full livestock management."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        # Map HTTP methods to permissions
        method_permissions = {
            'GET': 'livestock.view',
            'HEAD': 'livestock.view',
            'OPTIONS': 'livestock.view',
            'POST': 'livestock.add',
            'PUT': 'livestock.change',
            'PATCH': 'livestock.change',
            'DELETE': 'livestock.delete',
        }

        required = method_permissions.get(request.method, 'livestock.view')
        return profile.has_permission(required)


class CanManageCategories(BasePermission):
    """Shortcut permission for category management."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        method_permissions = {
            'GET': 'category.view',
            'HEAD': 'category.view',
            'OPTIONS': 'category.view',
            'POST': 'category.add',
            'PUT': 'category.change',
            'PATCH': 'category.change',
            'DELETE': 'category.delete',
        }

        required = method_permissions.get(request.method, 'category.view')
        return profile.has_permission(required)


class CanManageTags(BasePermission):
    """Shortcut permission for tag management."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        method_permissions = {
            'GET': 'tag.view',
            'HEAD': 'tag.view',
            'OPTIONS': 'tag.view',
            'POST': 'tag.add',
            'PUT': 'tag.change',
            'PATCH': 'tag.change',
            'DELETE': 'tag.delete',
        }

        required = method_permissions.get(request.method, 'tag.view')
        return profile.has_permission(required)


class CanManageMedia(BasePermission):
    """Shortcut permission for media management."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        method_permissions = {
            'GET': 'media.view',
            'HEAD': 'media.view',
            'OPTIONS': 'media.view',
            'POST': 'media.add',
            'DELETE': 'media.delete',
        }

        required = method_permissions.get(request.method, 'media.view')
        return profile.has_permission(required)


class CanViewAnalytics(BasePermission):
    """Permission to view analytics and reports."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        return profile and profile.has_permission('analytics.view')


class CanManageUsers(BasePermission):
    """Only superadmins can manage users."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        return profile and profile.role == 'superadmin'


class CanManageEggs(BasePermission):
    """Shortcut permission for egg management."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        # Map HTTP methods to permissions (uses livestock permissions as eggs are similar)
        method_permissions = {
            'GET': 'livestock.view',
            'HEAD': 'livestock.view',
            'OPTIONS': 'livestock.view',
            'POST': 'livestock.add',
            'PUT': 'livestock.change',
            'PATCH': 'livestock.change',
            'DELETE': 'livestock.delete',
        }

        required = method_permissions.get(request.method, 'livestock.view')
        return profile.has_permission(required)
