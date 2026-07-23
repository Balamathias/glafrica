"""Seed the Herd Health Card with vaccination protocols.

DRAFT DATA — compiled from standard veterinary references and West African
livestock extension schedules (FAO / national veterinary service guides and
common poultry vaccination programmes used in Nigeria). Timing is a general
guide and must be confirmed with a licensed veterinarian for the specific herd,
region, and disease pressure. Editable later via the Django admin.
"""

from django.db import migrations

# Route codes: sc, im, oral, eye, spray, wing, topical, other
# Category codes: vaccine, deworm, vitamin, management

SPECIES = [
    {
        "name": "Goats",
        "slug": "goats",
        "common_breeds": "Boer, Kalahari Red, West African Dwarf, Sahel",
        "icon": "Rabbit",
        "sort_order": 1,
        "description": "Vaccination and health protocol for meat and dairy goats.",
        "source_note": "Compiled from standard small-ruminant references (PPR, CCPP, "
        "clostridial and anthrax programmes). Confirm with your veterinarian.",
        "events": [
            ("vaccine", "Clostridial multivalent (enterotoxaemia + tetanus)",
             "Enterotoxaemia (pulpy kidney), tetanus", 21, "3 weeks", None, "sc",
             "First dose; give the booster 3–4 weeks later, then annually.", True),
            ("vaccine", "Clostridial booster", "Enterotoxaemia, tetanus", 49,
             "7 weeks", 365, "sc", "Booster after the primary dose; repeat yearly.", True),
            ("deworm", "Deworming (broad-spectrum anthelmintic)",
             "Gastrointestinal worms", 56, "8 weeks", 90, "oral",
             "Repeat roughly every 3 months; rotate drug classes and deworm to "
             "faecal egg counts where possible.", True),
            ("vaccine", "PPR vaccine", "Peste des Petits Ruminants", 120,
             "4 months", 365, "sc",
             "Single dose gives long immunity; an annual programme is common in "
             "endemic areas. Kids from vaccinated dams: give from 4 months.", True),
            ("vaccine", "CCPP vaccine", "Contagious Caprine Pleuropneumonia", 120,
             "4 months", 365, "sc", "Annual booster in endemic regions.", True),
            ("vaccine", "Anthrax spore vaccine", "Anthrax", 150, "5 months", 365,
             "sc", "Annual, ideally before the rainy season. Do not use in sick "
             "animals.", True),
            ("vaccine", "Sheep & goat pox vaccine", "Goat pox", 150, "5 months",
             365, "sc", "Regional / optional depending on disease pressure.", False),
            ("vitamin", "Vitamin A/D/E + selenium", "Deficiency, weak kids", 30,
             "1 month", 180, "im", "Supportive; especially where pasture is poor.",
             False),
        ],
    },
    {
        "name": "Sheep",
        "slug": "sheep",
        "common_breeds": "West African Dwarf, Balami, Uda, Yankasa",
        "icon": "Rabbit",
        "sort_order": 2,
        "description": "Vaccination and health protocol for meat sheep.",
        "source_note": "Compiled from standard small-ruminant references. Confirm "
        "with your veterinarian.",
        "events": [
            ("vaccine", "Clostridial multivalent (enterotoxaemia + tetanus)",
             "Enterotoxaemia, tetanus", 21, "3 weeks", None, "sc",
             "First dose; booster 3–4 weeks later, then annually.", True),
            ("vaccine", "Clostridial booster", "Enterotoxaemia, tetanus", 49,
             "7 weeks", 365, "sc", "Booster; repeat yearly.", True),
            ("deworm", "Deworming (broad-spectrum anthelmintic)",
             "Gastrointestinal worms", 56, "8 weeks", 90, "oral",
             "Repeat about every 3 months; rotate drug classes.", True),
            ("vaccine", "PPR vaccine", "Peste des Petits Ruminants", 120,
             "4 months", 365, "sc", "From 4 months; annual programme common in "
             "endemic areas.", True),
            ("vaccine", "Anthrax spore vaccine", "Anthrax", 150, "5 months", 365,
             "sc", "Annual, before the rainy season.", True),
            ("vaccine", "Sheep & goat pox vaccine", "Sheep pox", 150, "5 months",
             365, "sc", "Regional / optional.", False),
        ],
    },
    {
        "name": "Cattle",
        "slug": "cattle",
        "common_breeds": "White Fulani, Sokoto Gudali, N'Dama, Friesian cross",
        "icon": "Beef",
        "sort_order": 3,
        "description": "Vaccination and health protocol for beef and dairy cattle.",
        "source_note": "Compiled from standard bovine references (clostridial, "
        "anthrax, HS, CBPP, FMD, brucellosis). Confirm with your veterinarian.",
        "events": [
            ("management", "Navel dip + colostrum check", "Navel ill, weak calves",
             0, "Day 1", None, "topical",
             "Dip navel in iodine; ensure the calf takes colostrum within 6 hours.",
             True),
            ("vaccine", "Brucellosis S19 (heifers only)", "Brucellosis", 120,
             "4 months", None, "sc",
             "Female calves only, once, between 4 and 8 months. Not for males or "
             "pregnant animals.", True),
            ("deworm", "Deworming (broad-spectrum anthelmintic)",
             "Gastrointestinal worms, liver fluke", 90, "3 months", 120, "oral",
             "Repeat roughly every 3–4 months depending on challenge.", True),
            ("vaccine", "Blackleg / clostridial (blackquarter)", "Blackleg", 180,
             "6 months", 365, "sc", "Annual, before the rainy season.", True),
            ("vaccine", "Haemorrhagic septicaemia (HS) vaccine",
             "Haemorrhagic septicaemia", 180, "6 months", 365, "sc",
             "Annual, before the rainy season.", True),
            ("vaccine", "Anthrax spore vaccine", "Anthrax", 180, "6 months", 365,
             "sc", "Annual; do not combine with antibiotics.", True),
            ("vaccine", "FMD vaccine", "Foot and Mouth Disease", 120, "4 months",
             180, "im", "Primary dose, booster ~4 weeks later, then every 6 months "
             "in endemic areas.", True),
            ("vaccine", "CBPP vaccine", "Contagious Bovine Pleuropneumonia", 180,
             "6 months", 365, "sc", "Annual in endemic zones.", False),
            ("vaccine", "Lumpy skin disease vaccine", "Lumpy skin disease", 180,
             "6 months", 365, "sc", "Regional / optional.", False),
        ],
    },
    {
        "name": "Poultry — Layers",
        "slug": "poultry-layers",
        "common_breeds": "ISA Brown, Bovans, Lohmann, Nera Black",
        "icon": "Egg",
        "sort_order": 4,
        "description": "Vaccination programme for layer / breeder birds to point of lay.",
        "source_note": "Compiled from standard commercial layer vaccination "
        "programmes used in Nigeria. Confirm with your veterinarian / hatchery.",
        "events": [
            ("vaccine", "Marek's disease (at hatchery)", "Marek's disease", 0,
             "Day 1", None, "sc", "Given at the hatchery to day-old chicks.", True),
            ("vaccine", "Newcastle + Infectious Bronchitis (ND+IB)",
             "Newcastle disease, infectious bronchitis", 7, "Day 7", None, "eye",
             "Eye/nostril drop.", True),
            ("vaccine", "Gumboro (IBD) intermediate", "Infectious bursal disease",
             14, "Day 14", None, "oral", "Drinking water; withdraw other water "
             "first.", True),
            ("vaccine", "Newcastle Lasota booster", "Newcastle disease", 21,
             "3 weeks", None, "oral", "Drinking water.", True),
            ("vaccine", "Gumboro (IBD) booster", "Infectious bursal disease", 28,
             "4 weeks", None, "oral", "Drinking water.", True),
            ("vaccine", "Fowl pox", "Fowl pox", 42, "6 weeks", None, "wing",
             "Wing-web stab.", True),
            ("deworm", "Deworming", "Roundworms, tapeworms", 56, "8 weeks", 42,
             "oral", "First deworming; then roughly every 6 weeks.", True),
            ("vaccine", "Newcastle (Komarov / killed)", "Newcastle disease", 56,
             "8 weeks", None, "im", "Intramuscular for stronger, longer immunity.",
             True),
            ("vaccine", "Fowl typhoid", "Fowl typhoid (Salmonella)", 63, "9 weeks",
             None, "im", "Regional / where fowl typhoid is a problem.", False),
            ("vaccine", "ND+IB killed (pre-lay)",
             "Newcastle disease, infectious bronchitis", 112, "16 weeks", None,
             "im", "Before point of lay for persistent immunity through laying.",
             True),
        ],
    },
    {
        "name": "Poultry — Broilers",
        "slug": "poultry-broilers",
        "common_breeds": "Cobb 500, Ross 308, Arbor Acres",
        "icon": "Egg",
        "sort_order": 5,
        "description": "Vaccination programme for broilers over a short grow-out.",
        "source_note": "Compiled from standard commercial broiler vaccination "
        "programmes. Confirm with your veterinarian / hatchery.",
        "events": [
            ("vaccine", "Newcastle + Infectious Bronchitis (ND+IB)",
             "Newcastle disease, infectious bronchitis", 0, "Day 1", None, "eye",
             "Often given at the hatchery, or eye-drop on arrival.", True),
            ("vaccine", "Newcastle Lasota + IB", "Newcastle disease", 7, "Day 7",
             None, "eye", "Eye/nostril drop.", True),
            ("vaccine", "Gumboro (IBD) intermediate", "Infectious bursal disease",
             14, "Day 14", None, "oral", "Drinking water.", True),
            ("vaccine", "Newcastle Lasota booster", "Newcastle disease", 21,
             "3 weeks", None, "oral", "Drinking water.", True),
            ("vaccine", "Gumboro (IBD) booster", "Infectious bursal disease", 24,
             "Day 24", None, "oral", "Drinking water; optional under high "
             "challenge.", False),
        ],
    },
]


def seed(apps, schema_editor):
    Species = apps.get_model("api", "Species")
    VaccinationEvent = apps.get_model("api", "VaccinationEvent")

    for order_hint, spec in enumerate(SPECIES):
        species, _ = Species.objects.update_or_create(
            slug=spec["slug"],
            defaults={
                "name": spec["name"],
                "common_breeds": spec["common_breeds"],
                "description": spec["description"],
                "icon": spec["icon"],
                "source_note": spec["source_note"],
                "sort_order": spec["sort_order"],
                "is_published": True,
            },
        )
        # Replace any existing events so re-running stays idempotent.
        species.events.all().delete()
        for i, ev in enumerate(spec["events"]):
            (category, name, protects, age_days, age_label, repeat, route,
             notes, is_core) = ev
            VaccinationEvent.objects.create(
                species=species,
                category=category,
                name=name,
                protects_against=protects,
                age_offset_days=age_days,
                age_label=age_label,
                repeat_interval_days=repeat,
                route=route,
                notes=notes,
                is_core=is_core,
                sort_order=i,
            )


def unseed(apps, schema_editor):
    Species = apps.get_model("api", "Species")
    slugs = [s["slug"] for s in SPECIES]
    Species.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0008_species_alter_egg_price_alter_livestock_age_and_more"),
    ]

    operations = [migrations.RunPython(seed, unseed)]
