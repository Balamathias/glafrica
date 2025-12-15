"""
Admin API serializers for full CRUD operations.
"""
from django.utils import timezone
from rest_framework import serializers
from ..models import Livestock, MediaAsset, Category, Tag, AuditLog


class AdminMediaAssetSerializer(serializers.ModelSerializer):
    """Media asset serializer with full details for admin."""
    file_url = serializers.SerializerMethodField()
    livestock_id = serializers.UUIDField(source='livestock.id', read_only=True)
    livestock_name = serializers.CharField(source='livestock.name', read_only=True)

    class Meta:
        model = MediaAsset
        fields = [
            'id', 'file', 'file_url', 'media_type',
            'is_featured', 'aspect_ratio',
            'livestock_id', 'livestock_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url if hasattr(obj.file, 'url') else str(obj.file)
        return None


class AdminCategorySerializer(serializers.ModelSerializer):
    """Category serializer with statistics for admin."""
    livestock_count = serializers.SerializerMethodField()
    available_count = serializers.SerializerMethodField()
    sold_count = serializers.SerializerMethodField()
    icon_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'icon_url',
            'livestock_count', 'available_count', 'sold_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_livestock_count(self, obj):
        return obj.livestock.count()

    def get_available_count(self, obj):
        return obj.livestock.filter(is_sold=False).count()

    def get_sold_count(self, obj):
        return obj.livestock.filter(is_sold=True).count()

    def get_icon_url(self, obj):
        if obj.icon:
            return obj.icon.url if hasattr(obj.icon, 'url') else str(obj.icon)
        return None

    def create(self, validated_data):
        # Auto-generate slug from name
        from django.utils.text import slugify
        if 'slug' not in validated_data or not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class AdminTagSerializer(serializers.ModelSerializer):
    """Tag serializer with usage count for admin."""
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'usage_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_usage_count(self, obj):
        return obj.livestock.count()

    def create(self, validated_data):
        from django.utils.text import slugify
        if 'slug' not in validated_data or not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class AdminLivestockListSerializer(serializers.ModelSerializer):
    """Livestock list serializer optimized for admin data tables."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    featured_image = serializers.SerializerMethodField()
    media_count = serializers.SerializerMethodField()
    tag_names = serializers.SerializerMethodField()

    class Meta:
        model = Livestock
        fields = [
            'id', 'name', 'breed', 'category_name', 'category_slug',
            'age', 'weight', 'gender', 'price', 'currency',
            'location', 'is_sold', 'sold_at', 'sold_price',
            'featured_image', 'media_count', 'tag_names',
            'created_at', 'updated_at'
        ]

    def get_featured_image(self, obj):
        media = obj.media.filter(is_featured=True).first()
        if not media:
            media = obj.media.filter(media_type='image').first()
        if media:
            return AdminMediaAssetSerializer(media).data
        return None

    def get_media_count(self, obj):
        return obj.media.count()

    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]


class AdminLivestockDetailSerializer(serializers.ModelSerializer):
    """Full livestock serializer for admin create/update operations."""
    category = AdminCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    media = AdminMediaAssetSerializer(many=True, read_only=True)
    tags = AdminTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source='tags',
        write_only=True,
        many=True,
        required=False
    )

    class Meta:
        model = Livestock
        fields = [
            'id', 'name', 'breed',
            'category', 'category_id',
            'age', 'weight', 'gender',
            'price', 'currency', 'location',
            'is_sold', 'sold_at', 'sold_price',
            'description', 'health_status', 'vaccination_history',
            'media', 'tags', 'tag_ids',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Track if is_sold changed for analytics
        was_sold = instance.is_sold
        is_now_sold = validated_data.get('is_sold', was_sold)

        # Auto-set sold_at when marked as sold
        if not was_sold and is_now_sold:
            validated_data['sold_at'] = timezone.now()
            if 'sold_price' not in validated_data:
                validated_data['sold_price'] = instance.price

        return super().update(instance, validated_data)


class BulkDeleteSerializer(serializers.Serializer):
    """Serializer for bulk delete operations."""
    ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100,
        help_text="List of UUIDs to delete"
    )


class BulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk update operations."""
    ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    updates = serializers.DictField(
        help_text="Fields to update with their new values"
    )

    def validate_updates(self, value):
        allowed_fields = ['is_sold', 'category', 'location', 'price']
        for field in value.keys():
            if field not in allowed_fields:
                raise serializers.ValidationError(
                    f"Field '{field}' is not allowed in bulk updates. "
                    f"Allowed fields: {', '.join(allowed_fields)}"
                )
        return value


class BulkMarkSoldSerializer(serializers.Serializer):
    """Serializer for bulk mark as sold operation."""
    ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    sold_price_percentage = serializers.FloatField(
        required=False,
        default=100.0,
        min_value=0,
        max_value=200,
        help_text="Percentage of original price (100 = full price)"
    )


class AdminAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit log entries."""
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'username', 'user_email',
            'action_type', 'resource_type', 'resource_id',
            'description', 'changes', 'ip_address',
            'created_at'
        ]
        read_only_fields = fields


class MediaUploadSerializer(serializers.Serializer):
    """Serializer for media upload."""
    livestock_id = serializers.UUIDField()
    file = serializers.FileField()
    media_type = serializers.ChoiceField(
        choices=['image', 'video'],
        default='image'
    )
    is_featured = serializers.BooleanField(default=False)
    aspect_ratio = serializers.FloatField(default=1.0)


class ExportSerializer(serializers.Serializer):
    """Serializer for data export options."""
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
        ('json', 'JSON'),
    ]

    format = serializers.ChoiceField(choices=FORMAT_CHOICES, default='csv')
    ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="Specific IDs to export. If empty, exports all."
    )
    include_sold = serializers.BooleanField(default=True)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
