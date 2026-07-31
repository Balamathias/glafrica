from django.test import TestCase

from .models import Category, Livestock
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
