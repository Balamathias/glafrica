"""
Authentication serializers for the admin API.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import UserProfile, AuditLog


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes admin-specific claims in the JWT.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser

        # Add profile data if exists
        if hasattr(user, 'profile'):
            token['role'] = user.profile.role
            token['avatar'] = user.profile.avatar.url if user.profile.avatar else None
        else:
            token['role'] = 'staff'
            token['avatar'] = None

        return token

    def validate(self, attrs):
        # First perform standard validation
        data = super().validate(attrs)

        # Check if user is admin
        if not self.user.is_staff:
            raise serializers.ValidationError(
                {"detail": "Admin access required. This account does not have admin privileges."}
            )

        # Check if user is active
        if not self.user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account has been deactivated."}
            )

        # Check profile-level lock
        profile = getattr(self.user, 'profile', None)
        if profile:
            if profile.locked_until and timezone.now() < profile.locked_until:
                raise serializers.ValidationError(
                    {"detail": "Account temporarily locked due to too many failed login attempts. Please try again later."}
                )

            if not profile.is_active_admin:
                raise serializers.ValidationError(
                    {"detail": "Your admin access has been revoked."}
                )

            # Reset failed login attempts on successful login
            profile.failed_login_attempts = 0
            profile.locked_until = None
            profile.save(update_fields=['failed_login_attempts', 'locked_until'])

        # Add user info to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_superuser': self.user.is_superuser,
            'role': profile.role if profile else 'staff',
            'avatar': profile.avatar.url if profile and profile.avatar else None,
        }

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    class Meta:
        model = UserProfile
        fields = ['role', 'avatar', 'phone', 'is_active_admin', 'last_login_ip']
        read_only_fields = ['last_login_ip']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user data."""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)
    avatar = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_active', 'is_staff', 'is_superuser',
            'profile', 'role', 'avatar', 'last_login', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_staff']

    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return None

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating admin user profile."""
    phone = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'avatar']

    def update(self, instance, validated_data):
        # Extract profile fields
        phone = validated_data.pop('phone', None)
        avatar = validated_data.pop('avatar', None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile fields
        profile, created = UserProfile.objects.get_or_create(user=instance)
        if phone is not None:
            profile.phone = phone
        if avatar is not None:
            profile.avatar = avatar
        profile.save()

        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": "New passwords do not match."}
            )
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from current password."}
            )
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()

        # Log the password change
        AuditLog.log_action(
            user=user,
            action_type='update',
            resource_type='user',
            description=f"Password changed for user: {user.username}",
            resource_id=user.id,
            request=self.context.get('request')
        )

        return user


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new admin users (superadmin only)."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'role', 'phone'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        confirm_password = attrs.pop('confirm_password', None)
        if not confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "This field is required."}
            )
        if attrs.get('password') != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        role = validated_data.pop('role')
        phone = validated_data.pop('phone', '')
        password = validated_data.pop('password')

        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.is_staff = True
        user.save()

        # Create profile
        UserProfile.objects.create(
            user=user,
            role=role,
            phone=phone
        )

        # Log the action
        request = self.context.get('request')
        if request:
            AuditLog.log_action(
                user=request.user,
                action_type='create',
                resource_type='user',
                description=f"Created new admin user: {user.username} with role {role}",
                resource_id=user.id,
                request=request
            )

        return user


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout - blacklists the refresh token."""
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self):
        try:
            RefreshToken(self.token).blacklist()
        except Exception:
            raise serializers.ValidationError({"refresh": "Invalid or expired token."})
