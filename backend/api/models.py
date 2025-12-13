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
