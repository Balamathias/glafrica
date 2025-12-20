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
# EGGS MODELS
# ============================================

class EggCategory(TimeStampedModel):
    """Bird species/type that produces eggs (e.g., Chicken, Turkey, Quail)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = CloudinaryField('image', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Egg Categories"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Egg(TimeStampedModel):
    """Individual egg product listing."""
    SIZE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
        ('extra_large', 'Extra Large'),
        ('jumbo', 'Jumbo'),
    ]

    PACKAGING_CHOICES = [
        ('crate_30', 'Crate (30 eggs)'),
        ('tray_30', 'Tray (30 eggs)'),
        ('tray_12', 'Tray (12 eggs)'),
        ('half_crate_15', 'Half Crate (15 eggs)'),
        ('custom', 'Custom'),
    ]

    EGG_TYPE_CHOICES = [
        ('table', 'Table Eggs'),
        ('fertilized', 'Fertilized/Hatching'),
        ('organic', 'Organic'),
        ('free_range', 'Free Range'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text="e.g., 'Fresh Farm Chicken Eggs'")
    slug = models.SlugField(max_length=200, unique=True)
    category = models.ForeignKey(
        EggCategory,
        on_delete=models.PROTECT,
        related_name='eggs'
    )
    breed = models.CharField(max_length=100, blank=True, help_text="e.g., 'Rhode Island Red', 'Broiler'")
    egg_type = models.CharField(max_length=20, choices=EGG_TYPE_CHOICES, default='table')
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, default='medium')
    packaging = models.CharField(max_length=20, choices=PACKAGING_CHOICES, default='crate_30')
    eggs_per_unit = models.PositiveIntegerField(default=30, help_text="Number of eggs per package")

    # Pricing
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Price per package")
    currency = models.CharField(max_length=3, default='NGN')

    # Inventory
    quantity_available = models.PositiveIntegerField(default=0, help_text="Number of packages in stock")

    # Freshness
    production_date = models.DateField(null=True, blank=True, help_text="Date eggs were produced/laid")
    expiry_date = models.DateField(null=True, blank=True, help_text="Best before date")

    # Location & Details
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)

    # Status
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)

    # Relations
    tags = models.ManyToManyField(Tag, blank=True, related_name='eggs')

    # Audit
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_eggs'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_available', 'created_at']),
            models.Index(fields=['category', 'is_available']),
            models.Index(fields=['production_date']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['egg_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_packaging_display()})"

    @property
    def shelf_life_days(self):
        """Total shelf life in days from production to expiry."""
        if not self.production_date or not self.expiry_date:
            return None
        return (self.expiry_date - self.production_date).days

    @property
    def days_until_expiry(self):
        """Days remaining until expiry."""
        if not self.expiry_date:
            return None
        from django.utils import timezone
        today = timezone.now().date()
        return (self.expiry_date - today).days

    @property
    def freshness_status(self):
        """Calculate freshness status based on remaining shelf life."""
        days_left = self.days_until_expiry

        if days_left is None:
            return 'unknown'

        if days_left < 0:
            return 'expired'
        elif days_left <= 3:
            return 'expiring_soon'
        elif days_left <= 7:
            return 'use_soon'
        else:
            return 'fresh'

    @property
    def freshness_percentage(self):
        """Percentage of freshness remaining (100% = just produced, 0% = expired)."""
        shelf_life = self.shelf_life_days
        days_left = self.days_until_expiry

        if shelf_life is None or days_left is None or shelf_life <= 0:
            return None
        remaining = max(0, days_left)
        return min(100, int((remaining / shelf_life) * 100))


class EggMediaAsset(TimeStampedModel):
    """Media files (images/videos) for eggs."""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    egg = models.ForeignKey(Egg, on_delete=models.CASCADE, related_name='media')
    file = CloudinaryField('file', resource_type='auto')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False, help_text="Show as main image")
    order = models.PositiveIntegerField(default=0)
    aspect_ratio = models.FloatField(default=1.0, help_text="Width / Height ratio for layout")

    class Meta:
        ordering = ['order', '-is_primary', '-created_at']
        verbose_name = "Egg Media Asset"
        verbose_name_plural = "Egg Media Assets"

    def __str__(self):
        return f"{self.media_type} for {self.egg.name}"


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


# ============================================
# CONTACT & INQUIRIES
# ============================================

class ContactInquiry(TimeStampedModel):
    """Store contact form submissions from the public website."""
    SUBJECT_CHOICES = [
        ('purchase', 'Livestock Purchase'),
        ('investment', 'Investment Inquiry'),
        ('partnership', 'Partnership Opportunity'),
        ('visit', 'Schedule a Visit'),
        ('support', 'General Support'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    replied_at = models.DateTimeField(null=True, blank=True)
    replied_by = models.ForeignKey(
        'auth.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='replied_inquiries'
    )
    notes = models.TextField(blank=True, help_text="Internal admin notes")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Inquiry"
        verbose_name_plural = "Contact Inquiries"

    def __str__(self):
        return f"{self.name} - {self.get_subject_display()}"


# ============================================
# ANALYTICS & VISIT TRACKING
# ============================================

class PageView(TimeStampedModel):
    """Tracks individual page visits on the public site."""
    DEVICE_TYPE_CHOICES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
    ]
    EVENT_TYPE_CHOICES = [
        ('page_view', 'Page View'),
        ('livestock_view', 'Livestock View'),
        ('egg_view', 'Egg View'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=64, db_index=True, help_text="Browser session identifier")
    path = models.CharField(max_length=500, db_index=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='page_view')
    referrer = models.URLField(blank=True, null=True, max_length=1000)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES, default='desktop')

    # Livestock-specific tracking
    livestock = models.ForeignKey(
        'Livestock',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='page_views'
    )

    # Egg-specific tracking
    egg = models.ForeignKey(
        'Egg',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='page_views'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['path', 'created_at']),
            models.Index(fields=['livestock', 'created_at']),
            models.Index(fields=['egg', 'created_at']),
            models.Index(fields=['event_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.path} - {self.session_id[:8]}..."


class VisitorSession(TimeStampedModel):
    """Aggregates page views into visitor sessions for analytics."""
    DEVICE_TYPE_CHOICES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=64, unique=True, db_index=True)
    first_visit = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    page_count = models.PositiveIntegerField(default=1)
    entry_page = models.CharField(max_length=500)
    exit_page = models.CharField(max_length=500, blank=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES, default='desktop')
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['first_visit']),
            models.Index(fields=['last_activity']),
            models.Index(fields=['country']),
        ]

    def __str__(self):
        return f"Session {self.session_id[:8]}... ({self.page_count} pages)"

    @property
    def duration_seconds(self):
        """Calculate session duration in seconds."""
        if self.last_activity and self.first_visit:
            delta = self.last_activity - self.first_visit
            return delta.total_seconds()
        return 0

    @property
    def is_bounce(self):
        """A bounce is a single-page session."""
        return self.page_count == 1
