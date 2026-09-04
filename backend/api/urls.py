from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    CertificateDownloadView,
    CertificateLookupView,
    ChatView,
    ContactInquiryCreateView,
    CourseMaterialViewSet,
    EggCategoryViewSet,
    EggViewSet,
    LivestockViewSet,
    SiteFigureListView,
    SmartSearchView,
    SpeciesViewSet,
    TrackVisitView,
    VaccinationScheduleView,
)

router = DefaultRouter()
router.register(r"livestock", LivestockViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"chat", ChatView, basename="chat")
router.register(r"eggs", EggViewSet, basename="eggs")
router.register(r"egg-categories", EggCategoryViewSet, basename="egg-categories")
router.register(r"species", SpeciesViewSet, basename="species")
router.register(r"course-materials", CourseMaterialViewSet, basename="course-materials")

urlpatterns = [
    # Public API endpoints
    path("", include(router.urls)),
    # Herd Health Card — vaccination schedule generator (public)
    path(
        "vaccination-schedule/",
        VaccinationScheduleView.as_view(),
        name="vaccination-schedule",
    ),
    # Certificate directory — search-only by design. There is deliberately no
    # list endpoint; see CertificateLookupView for why.
    path(
        "certificates/lookup/",
        CertificateLookupView.as_view(),
        name="certificate-lookup",
    ),
    path(
        "certificates/<uuid:pk>/download/",
        CertificateDownloadView.as_view(),
        name="certificate-download",
    ),
    # Editable public headline figures (farmers trained, ...)
    path("site-figures/", SiteFigureListView.as_view(), name="site-figures"),
    # Unified AI-powered search for both livestock and eggs
    path("search/", SmartSearchView.as_view(), name="smart-search"),
    # Contact form endpoint (public, rate-limited)
    path("contact/", ContactInquiryCreateView.as_view(), name="contact"),
    # Analytics tracking endpoint (public, rate-limited)
    path("analytics/track/", TrackVisitView.as_view(), name="track-visit"),
    # Admin API endpoints (namespaced)
    path("admin/", include("api.admin_api.urls", namespace="admin_api")),
]
