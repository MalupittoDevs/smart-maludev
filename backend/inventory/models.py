from django.db import models

# Create your models here.

class Product(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Disponible"
        PENDING   = "PENDING",   "En espera"
        OUT       = "OUT",       "Agotado"

    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    qty = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.AVAILABLE)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.name} ({self.qty})"
