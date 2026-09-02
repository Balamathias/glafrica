import json
from datetime import date

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from .admin_api.serializers import AdminCourseMaterialSerializer
from .models import (
    Category,
    Certificate,
    CourseMaterial,
    Livestock,
    SiteFigure,
    normalize_phone,
)
from .serializers import CourseMaterialSerializer
from .services.ai import AIService


class SemanticSearchTests(TestCase):
    """
    Regression cover for the AI search accuracy report: searching
    "High-yield dairy goats" returned a tilapia listing alongside a goat.

    Three separate defects combined to produce that:
      1. "dairy" was a cattle keyword, so a dairy-goat query asked for cattle.
      2. Species was matched with `category__name__icontains="goats"`, which
         never matches the category actually named "Goat" — so the species
         filter silently matched nothing.
      3. With no strict results, a fallback OR'd every word of three or more
         characters across descriptions. "high" matched the tilapia.
    """

    @classmethod
    def setUpTestData(cls):
        cls.goats = Category.objects.create(name="Goat", slug="goat")
        cls.fishes = Category.objects.create(name="Fishes", slug="fishes")
        cls.fowl = Category.objects.create(name="Fowl", slug="fowl")

        cls.boer = Livestock.objects.create(
            name="Boer Goat Herd",
            category=cls.goats,
            breed="Boer",
            gender="mixed",
            location="Rivers, Nigeria",
            description="A high-yield herd of Boer goats in excellent condition.",
            health_status="Healthy, fully vaccinated",
        )
        cls.dairy_doe = Livestock.objects.create(
            name="Kalahari Dairy Doe",
            category=cls.goats,
            breed="Kalahari",
            gender="F",
            location="Rivers, Nigeria",
            description="Proven dairy doe with strong milk production.",
            health_status="Healthy",
        )
        cls.tilapia = Livestock.objects.create(
            name="Tilapia, Red & Nile",
            category=cls.fishes,
            breed="Tilapia",
            gender="mixed",
            location="Rivers, Nigeria",
            description="High-yield tilapia fingerlings for high-density ponds.",
            health_status="Healthy stock",
        )

    def setUp(self):
        self.service = AIService()

    def test_dairy_goat_query_excludes_fish(self):
        """The reported bug: a tilapia must never answer a goat query."""
        results = self.service.semantic_search("High-yield dairy goats")

        self.assertNotIn(self.tilapia, results)
        self.assertTrue(results, "a dairy goat query should still return goats")
        for item in results:
            self.assertEqual(item.category, self.goats)

    def test_dairy_is_not_a_cattle_signal(self):
        """'dairy' must not drag cattle into a small-ruminant query."""
        terms = self.service._extract_search_terms("High-yield dairy goats")

        self.assertEqual(terms["species"], ["goat"])
        self.assertIn("dairy", terms["purpose_terms"])

    def test_species_resolves_to_singular_category_name(self):
        """A plural query word must resolve to the singular category row."""
        terms = self.service._extract_search_terms("goats")

        self.assertEqual(terms["category_ids"], [self.goats.pk])

    def test_purpose_term_ranks_but_does_not_exclude(self):
        """The doe that actually mentions dairy should outrank the one that doesn't."""
        results = self.service.semantic_search("dairy goats")

        self.assertEqual(results[0], self.dairy_doe)
        self.assertIn(self.boer, results)

    def test_generic_words_do_not_match_on_their_own(self):
        """'high yield' alone must not pull in every listing containing 'high'."""
        terms = self.service._extract_search_terms("high yield")

        self.assertEqual(terms["general_terms"], [])
        self.assertEqual(self.service.semantic_search("high yield"), [])

    def test_no_matches_returns_empty_not_recent_listings(self):
        """An unmatched query must not be padded with unrelated recent stock."""
        self.assertEqual(self.service.semantic_search("xylophone spacecraft"), [])

    def test_species_with_no_stock_returns_empty(self):
        """Naming a species we hold no stock of returns nothing, not substitutes."""
        self.assertEqual(self.service.semantic_search("pigs"), [])

    def test_substring_does_not_trigger_phantom_gender(self):
        """'when' contains 'hen'; word boundaries must stop that matching."""
        terms = self.service._extract_search_terms("when will chickens lay")

        self.assertIsNone(terms["gender"])
        self.assertEqual(terms["species"], ["poultry"])

    def test_substring_does_not_trigger_phantom_species(self):
        """'program' contains 'ram'; it must not read as sheep."""
        terms = self.service._extract_search_terms("what is your breeding program")

        self.assertEqual(terms["species"], [])

    def test_breed_query_ranks_matching_breed_first(self):
        results = self.service.semantic_search("Boer goats")

        self.assertEqual(results[0], self.boer)

    def test_gender_filter_keeps_mixed_groups(self):
        """A group listing can still satisfy a female query."""
        results = self.service.semantic_search("female goats")

        self.assertIn(self.dairy_doe, results)

    def test_empty_query_returns_empty(self):
        self.assertEqual(self.service.semantic_search("   "), [])


class PhoneNormalizationTests(TestCase):
    """The lookup key. If these diverge, farmers cannot find their own record."""

    def test_local_international_and_spaced_forms_converge(self):
        self.assertEqual(normalize_phone("08012344521"), "8012344521")
        self.assertEqual(normalize_phone("0801 234 4521"), "8012344521")
        self.assertEqual(normalize_phone("+234 801 234 4521"), "8012344521")
        self.assertEqual(normalize_phone("+2348012344521"), "8012344521")

    def test_short_numbers_are_kept_whole_not_discarded(self):
        self.assertEqual(normalize_phone("12345"), "12345")

    def test_empty_input_is_safe(self):
        self.assertEqual(normalize_phone(""), "")
        self.assertEqual(normalize_phone(None), "")


class CertificateLookupTests(APITestCase):
    """The public certificate endpoint is the one place farmer PII is exposed,
    so its guard rails get direct cover."""

    def setUp(self):
        self.url = reverse("certificate-lookup")
        self.cert = Certificate.objects.create(
            holder_name="Amina Yusuf",
            phone="0801 234 4521",
            certificate_number="GLA-2026-0001",
            cohort="Cohort 01",
            programme="Small Ruminants",
            issued_on=date(2026, 3, 12),
        )
        for i in range(12):
            Certificate.objects.create(
                holder_name=f"Bala Musa {i}",
                phone=f"080333198{i:02d}",
                certificate_number=f"GLA-2026-01{i:02d}",
                issued_on=date(2026, 3, 12),
            )

    def tearDown(self):
        cache.clear()  # reset throttle history between tests

    def test_blank_and_short_queries_are_rejected(self):
        for query in ["", "a", "ab"]:
            response = self.client.get(self.url, {"q": query})
            self.assertEqual(response.status_code, 400, msg=query)

    def test_name_search_finds_the_holder(self):
        response = self.client.get(self.url, {"q": "Amina"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["holder_name"], "Amina Yusuf")

    def test_phone_search_matches_across_input_formats(self):
        for query in ["08012344521", "+2348012344521", "8012344521"]:
            response = self.client.get(self.url, {"q": query})
            self.assertEqual(response.data["count"], 1, msg=query)
            self.assertEqual(response.data["results"][0]["certificate_number"], "GLA-2026-0001")

    def test_partial_phone_does_not_match(self):
        """Phone lookup is exact. A prefix must not enumerate holders."""
        response = self.client.get(self.url, {"q": "0801234"})
        self.assertEqual(response.data["count"], 0)

    def test_response_never_contains_the_raw_phone_number(self):
        response = self.client.get(self.url, {"q": "Amina"})
        result = response.data["results"][0]
        self.assertNotIn("phone", result)
        self.assertEqual(result["phone_masked"], "080****4521")
        self.assertNotIn("8012344521", json.dumps(response.data))

    def test_results_are_capped_and_flagged_as_truncated(self):
        response = self.client.get(self.url, {"q": "Bala"})
        self.assertEqual(response.data["count"], 10)
        self.assertTrue(response.data["truncated"])

    def test_unpublished_certificates_are_not_discoverable(self):
        self.cert.is_published = False
        self.cert.save()
        response = self.client.get(self.url, {"q": "Amina"})
        self.assertEqual(response.data["count"], 0)

    def test_lookup_is_throttled(self):
        for _ in range(20):
            self.client.get(self.url, {"q": "Amina"})
        response = self.client.get(self.url, {"q": "Amina"})
        self.assertEqual(response.status_code, 429)

    def test_there_is_no_certificate_list_endpoint(self):
        """Guards the core design decision: no route returns all certificates."""
        response = self.client.get("/api/v1/certificates/")
        self.assertIn(response.status_code, (301, 404))


class SiteFigureTests(APITestCase):
    def test_farmers_trained_defaults_to_zero_before_it_is_set(self):
        response = self.client.get(reverse("site-figures"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["farmers_trained"], 0)

    def test_configured_value_is_served(self):
        SiteFigure.objects.create(key="farmers_trained", integer_value=147)
        response = self.client.get(reverse("site-figures"))
        self.assertEqual(response.data["farmers_trained"], 147)


class AdminCertificateAccessTests(APITestCase):
    def test_anonymous_writes_are_rejected(self):
        response = self.client.post("/api/v1/admin/certificates/", {"holder_name": "Intruder"})
        self.assertIn(response.status_code, (401, 403))

    def test_anonymous_listing_is_rejected(self):
        response = self.client.get("/api/v1/admin/certificates/")
        self.assertIn(response.status_code, (401, 403))


class CourseMaterialFormatTests(TestCase):
    """Course materials are not all PDFs.

    Trainers author in PowerPoint and Word as often as they export to PDF, so
    the model has to report the real format instead of letting the public card
    promise a PDF and hand over a .pptx.
    """

    def _material(self, filename, **kwargs):
        return CourseMaterial(
            title="Feeding basics",
            slug=f"feeding-basics-{filename}",
            file=f"course-materials/{filename}",
            **kwargs,
        )

    def test_format_label_reflects_the_stored_file(self):
        cases = {
            "ration.pdf": "PDF",
            "ration.docx": "DOCX",
            "ration.pptx": "PPTX",
            "ration.doc": "DOC",
            "ration.ppt": "PPT",
        }
        for filename, expected in cases.items():
            with self.subTest(filename=filename):
                self.assertEqual(self._material(filename).format_label, expected)

    def test_extension_is_case_insensitive(self):
        self.assertEqual(self._material("RATION.PPTX").format_label, "PPTX")

    def test_a_file_without_an_extension_degrades_quietly(self):
        material = self._material("ration")
        self.assertEqual(material.file_extension, "")
        self.assertEqual(material.format_label, "")
        self.assertEqual(material.page_unit, "pages")

    def test_decks_are_measured_in_slides_and_documents_in_pages(self):
        self.assertEqual(self._material("deck.pptx").page_unit, "slides")
        self.assertEqual(self._material("deck.ppt").page_unit, "slides")
        self.assertEqual(self._material("notes.docx").page_unit, "pages")
        self.assertEqual(self._material("notes.pdf").page_unit, "pages")

    def test_public_serializer_exposes_the_format(self):
        data = CourseMaterialSerializer(self._material("deck.pptx")).data
        self.assertEqual(data["format_label"], "PPTX")
        self.assertEqual(data["page_unit"], "slides")


class CourseMaterialUploadValidationTests(TestCase):
    """The file picker's `accept` attribute is a convenience, not a control —
    a direct API call bypasses it, so the serializer has to hold the line."""

    def _validate(self, filename):
        upload = SimpleUploadedFile(filename, b"stub", content_type="application/octet-stream")
        return AdminCourseMaterialSerializer().validate_file(upload)

    def test_office_and_pdf_uploads_are_accepted(self):
        for filename in ("guide.pdf", "guide.docx", "guide.pptx", "guide.doc", "guide.ppt"):
            with self.subTest(filename=filename):
                self.assertIsNotNone(self._validate(filename))

    def test_uppercase_extensions_are_accepted(self):
        self.assertIsNotNone(self._validate("GUIDE.PPTX"))

    def test_unsupported_types_are_rejected(self):
        for filename in ("payload.exe", "sheet.xlsx", "photo.png", "archive.zip"):
            with self.subTest(filename=filename):
                with self.assertRaises(ValidationError):
                    self._validate(filename)

    def test_a_file_with_no_extension_is_rejected(self):
        with self.assertRaises(ValidationError):
            self._validate("guide")
