from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0002_alter_product_status"),  # p.ej. "0002_auto_20251102_2040" o "0001_initial"
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="price",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
