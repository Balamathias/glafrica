"""
Authentication views for the admin API.
"""
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ..models import AuditLog, UserProfile
from ..permissions import IsAdminUser, IsSuperAdmin
from .serializers import (
    AdminTokenObtainPairSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    AdminUserCreateSerializer,
    PasswordChangeSerializer,
    LogoutSerializer,
)


class AdminTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view for admin users.
    Returns JWT tokens with admin-specific claims.
    """
    serializer_class = AdminTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Log successful login
            user = User.objects.get(username=request.data.get('username'))

            # Update last login IP
            ip_address = self._get_client_ip(request)
            if hasattr(user, 'profile'):
                user.profile.last_login_ip = ip_address
                user.profile.save(update_fields=['last_login_ip'])

            AuditLog.log_action(
                user=user,
                action_type='login',
                resource_type='auth',
                description=f"Admin login: {user.username}",
                request=request
            )

        return response

    def _get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class AdminTokenRefreshView(TokenRefreshView):
    """Token refresh view for admin users."""
    pass


class LogoutView(APIView):
    """
    Logout view that blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Log logout
        AuditLog.log_action(
            user=request.user,
            action_type='logout',
            resource_type='auth',
            description=f"Admin logout: {request.user.username}",
            request=request
        )

        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK
        )


class CurrentUserView(APIView):
    """
    View for getting and updating the current authenticated user's profile.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Get current user profile."""
        serializer = AdminUserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update current user profile."""
        serializer = AdminUserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Log profile update
        AuditLog.log_action(
            user=request.user,
            action_type='update',
            resource_type='user',
            description=f"Profile updated: {request.user.username}",
            resource_id=str(request.user.id),
            changes=request.data,
            request=request
        )

        return Response(AdminUserSerializer(request.user).data)


class PasswordChangeView(APIView):
    """
    View for changing the current user's password.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Password changed successfully."},
            status=status.HTTP_200_OK
        )


class AdminUserViewSet(ModelViewSet):
    """
    ViewSet for managing admin users.
    Only accessible by superadmins.
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.filter(is_staff=True).select_related('profile')

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by role if provided
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(profile__role=role)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Search by username or email
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        return queryset.order_by('-date_joined')

    def create(self, request, *args, **kwargs):
        """Override to return data with AdminUserSerializer for proper role handling."""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Note: AuditLog is also called in the serializer's create method,
        # so we skip it here to avoid duplicate logging

        # Return response with AdminUserSerializer which handles profile/role properly
        response_serializer = AdminUserSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        user = serializer.save()
        AuditLog.log_action(
            user=self.request.user,
            action_type='update',
            resource_type='user',
            description=f"Updated admin user: {user.username}",
            resource_id=str(user.id),
            changes=self.request.data,
            request=self.request
        )

    def perform_destroy(self, instance):
        username = instance.username
        user_id = str(instance.id)

        # Don't allow deleting yourself
        if instance == self.request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Soft delete - deactivate instead of actual delete
        instance.is_active = False
        instance.save()

        if hasattr(instance, 'profile'):
            instance.profile.is_active_admin = False
            instance.profile.save()

        AuditLog.log_action(
            user=self.request.user,
            action_type='delete',
            resource_type='user',
            description=f"Deactivated admin user: {username}",
            resource_id=user_id,
            request=self.request
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Don't allow deleting yourself
        if instance == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_destroy(instance)
        return Response(
            {"detail": "User deactivated successfully."},
            status=status.HTTP_200_OK
        )


class ToggleUserStatusView(APIView):
    """
    Toggle a user's active status (activate/deactivate).
    Only accessible by superadmins.
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id, is_staff=True)
        except User.DoesNotExist:
            return Response(
                {"detail": "Admin user not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Don't allow toggling yourself
        if user == request.user:
            return Response(
                {"detail": "You cannot change your own status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Toggle status
        user.is_active = not user.is_active
        user.save()

        if hasattr(user, 'profile'):
            user.profile.is_active_admin = user.is_active
            user.profile.save()

        action = "activated" if user.is_active else "deactivated"

        AuditLog.log_action(
            user=request.user,
            action_type='update',
            resource_type='user',
            description=f"Admin user {action}: {user.username}",
            resource_id=str(user.id),
            request=request
        )

        return Response({
            "detail": f"User {action} successfully.",
            "is_active": user.is_active
        })
