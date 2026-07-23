from django.db import migrations, models


def backfill_null_referrer(apps, schema_editor):
    PageView = apps.get_model("api", "PageView")
    PageView.objects.filter(referrer__isnull=True).update(referrer="")


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0006_make_egg_dates_nullable"),
    ]

    operations = [
        migrations.RunPython(backfill_null_referrer, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="pageview",
            name="referrer",
            field=models.URLField(blank=True, default="", max_length=1000),
        ),
    ]
