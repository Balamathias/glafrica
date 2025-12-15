from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from pgvector.django import VectorField
from cloudinary.models import CloudinaryField
import uuid

class TimeStampedModel(models.Model):
    """Abstract base class with created and updated timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = CloudinaryField('icon', blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Tag(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Livestock(TimeStampedModel):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('mixed', 'Mixed (Group)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text="e.g., 'Premium Boer Goat Buck'")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='livestock')
    breed = models.CharField(max_length=100)
    
    # Physical Stats
    age = models.CharField(max_length=50, help_text="e.g., '2 years' or '6 months'")
    weight = models.CharField(max_length=50, blank=True, help_text="e.g., '45kg'")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    
    # Sales Info
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')
    location = models.CharField(max_length=200)
    is_sold = models.BooleanField(default=False)
    sold_at = models.DateTimeField(null=True, blank=True)
    sold_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Details
    description = models.TextField()
    health_status = models.TextField(help_text="Current health condition")
    vaccination_history = models.JSONField(default=list, blank=True, help_text="List of vaccines received")
    
    tags = models.ManyToManyField(Tag, related_name='livestock', blank=True)
    
    # AI 
    # embedding = VectorField(dimensions=1536, blank=True, null=True)  # OpenAI text-embedding-3-small is 1536
    # TODO: Enable when pgvector is installed on DB server
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.location})"

class MediaAsset(TimeStampedModel):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='media')
    file = CloudinaryField('file', resource_type='auto')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')

    is_featured = models.BooleanField(default=False, help_text="Show as main image in gallery")
    aspect_ratio = models.FloatField(default=1.0, help_text="Width / Height ratio for masonry layout")

    class Meta:
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.media_type} for {self.livestock.name}"


# ============================================
# ADMIN & AUTHENTICATION MODELS
# ============================================

class UserProfile(TimeStampedModel):
    """Extended profile for admin users with role-based permissions."""
    ROLE_CHOICES = [
        ('superadmin', 'Super Administrator'),
        ('admin', 'Administrator'),
        ('staff', 'Staff'),
        ('viewer', 'Viewer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    avatar = CloudinaryField('avatar', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active_admin = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    def is_superadmin(self):
        return self.role == 'superadmin' or self.user.is_superuser

    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission based on role."""
        ROLE_PERMISSIONS = {
            'superadmin': ['*'],
            'admin': [
                'livestock.view', 'livestock.add', 'livestock.change', 'livestock.delete',
                'category.view', 'category.add', 'category.change', 'category.delete',
                'tag.view', 'tag.add', 'tag.change', 'tag.delete',
                'media.view', 'media.add', 'media.delete',
                'analytics.view',
            ],
            'staff': [
                'livestock.view', 'livestock.add', 'livestock.change',
                'category.view',
                'tag.view', 'tag.add',
                'media.view', 'media.add',
            ],
            'viewer': [
                'livestock.view',
                'category.view',
                'tag.view',
                'media.view',
                'analytics.view',
            ],
        }

        if self.user.is_superuser:
            return True

        permissions = ROLE_PERMISSIONS.get(self.role, [])
        return '*' in permissions or permission in permissions


class AuditLog(TimeStampedModel):
    """Track all admin actions for security and compliance."""
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('export', 'Export'),
        ('bulk_operation', 'Bulk Operation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    resource_type = models.CharField(max_length=50)  # e.g., 'livestock', 'category'
    resource_id = models.CharField(max_length=50, blank=True)
    description = models.TextField()
    changes = models.JSONField(default=dict, blank=True)  # Before/after values
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['action_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.resource_type}"

    @classmethod
    def log_action(cls, user, action_type, resource_type, description,
                   resource_id='', changes=None, request=None):
        """Helper method to create audit log entries."""
        ip_address = None
        user_agent = ''

        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')

        return cls.objects.create(
            user=user,
            action_type=action_type,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else '',
            description=description,
            changes=changes or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
