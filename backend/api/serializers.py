from rest_framework import serializers
from .models import Livestock, MediaAsset, Category, Tag

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ['id', 'file', 'media_type', 'is_featured', 'aspect_ratio']

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
    media_count = serializers.IntegerField(source='media.count', read_only=True)

    class Meta:
        model = Livestock
        fields = [
            'id', 'name', 'breed', 'price', 'currency', 
            'location', 'featured_image', 'category_name',
            'media_count', 'is_sold'
        ]

    def get_featured_image(self, obj):
        # Return first featured image or first image available
        media = obj.media.filter(is_featured=True).first()
        if not media:
            media = obj.media.first()
        if media:
            return MediaAssetSerializer(media).data
        return None
