from django.db import models

class Product(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Disponible"
        PENDING   = "PENDING",   "En espera"
        OUT       = "OUT",       "Agotado"

    sku = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=200)
    qty = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.AVAILABLE)
    price = models.PositiveIntegerField(default=0)  # << tiene que existir aquí
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.name} ({self.qty})"
