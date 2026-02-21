from django.contrib import admin
from .models import Category, Tag, Livestock, MediaAsset

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class MediaAssetInline(admin.TabularInline):
    model = MediaAsset
    extra = 1

@admin.register(Livestock)
class LivestockAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'location', 'is_sold', 'created_at')
    list_filter = ('category', 'is_sold', 'gender', 'created_at')
    search_fields = ('name', 'breed', 'location', 'description')
    inlines = [MediaAssetInline]
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('livestock', 'media_type', 'is_featured', 'created_at')
    list_filter = ('media_type', 'is_featured')
