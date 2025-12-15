"""
Admin API views for full CRUD operations with bulk support.
"""
import csv
from io import StringIO
from django.db.models import Q, Count, Sum
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from ..models import Livestock, MediaAsset, Category, Tag, AuditLog
from ..permissions import (
    IsAdminUser, CanManageLivestock, CanManageCategories,
    CanManageTags, CanManageMedia
)
from .serializers import (
    AdminLivestockListSerializer,
    AdminLivestockDetailSerializer,
    AdminCategorySerializer,
    AdminTagSerializer,
    AdminMediaAssetSerializer,
    AdminAuditLogSerializer,
    BulkDeleteSerializer,
    BulkUpdateSerializer,
    BulkMarkSoldSerializer,
    MediaUploadSerializer,
    ExportSerializer,
)


class AdminLivestockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin livestock management with bulk operations.
    """
    permission_classes = [IsAuthenticated, IsAdminUser, CanManageLivestock]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'breed', 'location', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'updated_at', 'is_sold']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Livestock.objects.select_related('category').prefetch_related('tags', 'media')

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # Filter by sold status
        is_sold = self.request.query_params.get('is_sold')
        if is_sold is not None:
            queryset = queryset.filter(is_sold=is_sold.lower() == 'true')

        # Filter by tags
        tags = self.request.query_params.getlist('tags')
        if tags:
            queryset = queryset.filter(tags__slug__in=tags).distinct()

        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminLivestockListSerializer
        return AdminLivestockDetailSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.log_action(
            user=self.request.user,
            action_type='create',
            resource_type='livestock',
            description=f"Created livestock: {instance.name}",
            resource_id=str(instance.id),
            request=self.request
        )

    def perform_update(self, serializer):
        old_data = AdminLivestockDetailSerializer(serializer.instance).data
        instance = serializer.save()
        new_data = AdminLivestockDetailSerializer(instance).data

        # Track changes
        changes = {}
        for key in new_data:
            if key in old_data and old_data[key] != new_data[key]:
                changes[key] = {'old': old_data[key], 'new': new_data[key]}

        AuditLog.log_action(
            user=self.request.user,
            action_type='update',
            resource_type='livestock',
            description=f"Updated livestock: {instance.name}",
            resource_id=str(instance.id),
            changes=changes,
            request=self.request
        )

    def perform_destroy(self, instance):
        name = instance.name
        livestock_id = str(instance.id)

        AuditLog.log_action(
            user=self.request.user,
            action_type='delete',
            resource_type='livestock',
            description=f"Deleted livestock: {name}",
            resource_id=livestock_id,
            request=self.request
        )

        instance.delete()

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple livestock items."""
        serializer = BulkDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.validated_data['ids']
        livestock_items = Livestock.objects.filter(id__in=ids)
        count = livestock_items.count()
        names = list(livestock_items.values_list('name', flat=True))

        livestock_items.delete()

        AuditLog.log_action(
            user=request.user,
            action_type='bulk_operation',
            resource_type='livestock',
            description=f"Bulk deleted {count} livestock items: {', '.join(names[:5])}{'...' if len(names) > 5 else ''}",
            changes={'deleted_ids': [str(id) for id in ids]},
            request=request
        )

        return Response({
            'detail': f'Successfully deleted {count} items.',
            'count': count
        })

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple livestock items with same values."""
        serializer = BulkUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.validated_data['ids']
        updates = serializer.validated_data['updates']

        # Handle category update specially
        if 'category' in updates:
            try:
                updates['category'] = Category.objects.get(slug=updates['category'])
            except Category.DoesNotExist:
                return Response(
                    {'detail': f"Category '{updates['category']}' not found."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        count = Livestock.objects.filter(id__in=ids).update(**updates)

        AuditLog.log_action(
            user=request.user,
            action_type='bulk_operation',
            resource_type='livestock',
            description=f"Bulk updated {count} livestock items",
            changes={'updated_ids': [str(id) for id in ids], 'updates': {k: str(v) for k, v in updates.items()}},
            request=request
        )

        return Response({
            'detail': f'Successfully updated {count} items.',
            'count': count
        })

    @action(detail=False, methods=['post'])
    def bulk_mark_sold(self, request):
        """Mark multiple livestock items as sold."""
        serializer = BulkMarkSoldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.validated_data['ids']
        price_percentage = serializer.validated_data.get('sold_price_percentage', 100.0)

        livestock_items = Livestock.objects.filter(id__in=ids, is_sold=False)
        now = timezone.now()

        updated_count = 0
        for item in livestock_items:
            item.is_sold = True
            item.sold_at = now
            item.sold_price = float(item.price) * (price_percentage / 100)
            item.save()
            updated_count += 1

        AuditLog.log_action(
            user=request.user,
            action_type='bulk_operation',
            resource_type='livestock',
            description=f"Marked {updated_count} livestock items as sold",
            changes={'sold_ids': [str(id) for id in ids], 'price_percentage': price_percentage},
            request=request
        )

        return Response({
            'detail': f'Successfully marked {updated_count} items as sold.',
            'count': updated_count
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export livestock data to CSV/Excel."""
        serializer = ExportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        export_format = serializer.validated_data.get('format', 'csv')
        ids = serializer.validated_data.get('ids', [])
        include_sold = serializer.validated_data.get('include_sold', True)

        queryset = self.get_queryset()
        if ids:
            queryset = queryset.filter(id__in=ids)
        if not include_sold:
            queryset = queryset.filter(is_sold=False)

        if export_format == 'csv':
            return self._export_csv(queryset)
        elif export_format == 'json':
            serializer = AdminLivestockDetailSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'Excel export not yet implemented.'},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )

    def _export_csv(self, queryset):
        """Generate CSV export."""
        output = StringIO()
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            'ID', 'Name', 'Breed', 'Category', 'Age', 'Weight', 'Gender',
            'Price', 'Currency', 'Location', 'Is Sold', 'Sold At', 'Sold Price',
            'Description', 'Health Status', 'Tags', 'Created At'
        ])

        # Data rows
        for item in queryset:
            writer.writerow([
                str(item.id),
                item.name,
                item.breed,
                item.category.name,
                item.age,
                item.weight,
                item.get_gender_display(),
                str(item.price),
                item.currency,
                item.location,
                'Yes' if item.is_sold else 'No',
                item.sold_at.isoformat() if item.sold_at else '',
                str(item.sold_price) if item.sold_price else '',
                item.description,
                item.health_status,
                ', '.join(t.name for t in item.tags.all()),
                item.created_at.isoformat()
            ])

        # Log export action
        AuditLog.log_action(
            user=self.request.user,
            action_type='export',
            resource_type='livestock',
            description=f"Exported {queryset.count()} livestock items to CSV",
            request=self.request
        )

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="livestock_export_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        return response

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        """Upload media for a specific livestock item."""
        livestock = self.get_object()

        file = request.FILES.get('file')
        if not file:
            return Response(
                {'detail': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        media_type = request.data.get('media_type', 'image')
        is_featured = request.data.get('is_featured', 'false').lower() == 'true'
        aspect_ratio = float(request.data.get('aspect_ratio', 1.0))

        # If this is set as featured, unset others
        if is_featured:
            livestock.media.filter(is_featured=True).update(is_featured=False)

        media = MediaAsset.objects.create(
            livestock=livestock,
            file=file,
            media_type=media_type,
            is_featured=is_featured,
            aspect_ratio=aspect_ratio
        )

        AuditLog.log_action(
            user=request.user,
            action_type='create',
            resource_type='media',
            description=f"Uploaded {media_type} for livestock: {livestock.name}",
            resource_id=str(media.id),
            request=request
        )

        return Response(
            AdminMediaAssetSerializer(media).data,
            status=status.HTTP_201_CREATED
        )


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for admin category management."""
    queryset = Category.objects.annotate(
        livestock_count=Count('livestock'),
        available_count=Count('livestock', filter=Q(livestock__is_sold=False)),
        sold_count=Count('livestock', filter=Q(livestock__is_sold=True))
    )
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser, CanManageCategories]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'livestock_count']
    ordering = ['name']

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.log_action(
            user=self.request.user,
            action_type='create',
            resource_type='category',
            description=f"Created category: {instance.name}",
            resource_id=str(instance.id),
            request=self.request
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.log_action(
            user=self.request.user,
            action_type='update',
            resource_type='category',
            description=f"Updated category: {instance.name}",
            resource_id=str(instance.id),
            request=self.request
        )

    def perform_destroy(self, instance):
        # Check if category has livestock
        if instance.livestock.exists():
            return Response(
                {'detail': 'Cannot delete category with existing livestock.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        name = instance.name
        category_id = str(instance.id)

        AuditLog.log_action(
            user=self.request.user,
            action_type='delete',
            resource_type='category',
            description=f"Deleted category: {name}",
            resource_id=category_id,
            request=self.request
        )

        instance.delete()


class AdminTagViewSet(viewsets.ModelViewSet):
    """ViewSet for admin tag management."""
    queryset = Tag.objects.annotate(usage_count=Count('livestock'))
    serializer_class = AdminTagSerializer
    permission_classes = [IsAuthenticated, IsAdminUser, CanManageTags]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'usage_count']
    ordering = ['name']

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.log_action(
            user=self.request.user,
            action_type='create',
            resource_type='tag',
            description=f"Created tag: {instance.name}",
            resource_id=str(instance.id),
            request=self.request
        )

    def perform_destroy(self, instance):
        name = instance.name
        tag_id = str(instance.id)

        AuditLog.log_action(
            user=self.request.user,
            action_type='delete',
            resource_type='tag',
            description=f"Deleted tag: {name}",
            resource_id=tag_id,
            request=self.request
        )

        instance.delete()


class AdminMediaViewSet(viewsets.ModelViewSet):
    """ViewSet for admin media management."""
    queryset = MediaAsset.objects.select_related('livestock')
    serializer_class = AdminMediaAssetSerializer
    permission_classes = [IsAuthenticated, IsAdminUser, CanManageMedia]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'is_featured']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by livestock
        livestock_id = self.request.query_params.get('livestock')
        if livestock_id:
            queryset = queryset.filter(livestock_id=livestock_id)

        # Filter by media type
        media_type = self.request.query_params.get('type')
        if media_type:
            queryset = queryset.filter(media_type=media_type)

        return queryset

    @action(detail=True, methods=['post'])
    def set_featured(self, request, pk=None):
        """Set this media as the featured image."""
        media = self.get_object()

        # Unset other featured media for this livestock
        MediaAsset.objects.filter(
            livestock=media.livestock,
            is_featured=True
        ).update(is_featured=False)

        media.is_featured = True
        media.save()

        return Response({'detail': 'Media set as featured.'})

    def perform_destroy(self, instance):
        livestock_name = instance.livestock.name
        media_id = str(instance.id)

        AuditLog.log_action(
            user=self.request.user,
            action_type='delete',
            resource_type='media',
            description=f"Deleted media from livestock: {livestock_name}",
            resource_id=media_id,
            request=self.request
        )

        instance.delete()


class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs (read-only)."""
    queryset = AuditLog.objects.select_related('user')
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by user
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by action type
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)

        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset
