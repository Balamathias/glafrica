from rest_framework import serializers
from .models import Livestock, MediaAsset, Category, Tag

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']


class CategoryWithPreviewSerializer(serializers.ModelSerializer):
    """Category serializer with livestock count and preview image."""
    livestock_count = serializers.SerializerMethodField()
    preview_image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'livestock_count', 'preview_image']

    def get_livestock_count(self, obj):
        return obj.livestock.filter(is_sold=False).count()

    def get_preview_image(self, obj):
        # Prioritize the category icon if it exists
        if obj.icon:
            return {
                'id': None,
                'file': obj.icon.url if hasattr(obj.icon, 'url') else str(obj.icon),
                'media_type': 'image',
                'is_featured': True,
                'aspect_ratio': 1.0
            }

        # Fallback: Get featured image from any livestock in this category
        livestock = obj.livestock.filter(is_sold=False).first()
        if livestock:
            media = livestock.media.filter(is_featured=True, media_type='image').first()
            if not media:
                media = livestock.media.filter(media_type='image').first()
            if media:
                return MediaAssetSerializer(media).data
        return None

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class MediaAssetSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id', 'file', 'media_type', 'is_featured', 'aspect_ratio']

    def get_file(self, obj):
        """Return the full Cloudinary URL for the file."""
        if obj.file:
            # CloudinaryField stores the public_id, we need the full URL
            return obj.file.url if hasattr(obj.file, 'url') else str(obj.file)
        return None

class LivestockSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    media = MediaAssetSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), source='tags', write_only=True, many=True, required=False
    )

    class Meta:
        model = Livestock
        fields = [
            'id', 'name', 'breed', 'category', 'category_id',
            'age', 'weight', 'gender', 'price', 'currency',
            'location', 'is_sold', 'description',
            'health_status', 'vaccination_history',
            'media', 'tags', 'tag_ids',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class LivestockListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    category_name = serializers.CharField(source='category.name')
    featured_image = serializers.SerializerMethodField()
    media_count = serializers.SerializerMethodField()

    class Meta:
        model = Livestock
        fields = [
            'id', 'name', 'breed', 'price', 'currency',
            'location', 'featured_image', 'category_name',
            'media_count', 'is_sold'
        ]

    def get_featured_image(self, obj):
        # Return first featured image or first available media
        media = obj.media.filter(is_featured=True).first()
        if not media:
            media = obj.media.first()
        if media:
            return MediaAssetSerializer(media).data
        return None

    def get_media_count(self, obj):
        return obj.media.count()
