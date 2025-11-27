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
    price = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.name} ({self.qty})"

    def refresh_status(self):
        if self.qty == 0:
            self.status = self.Status.OUT
        elif self.qty < 5:
            self.status = self.Status.PENDING
        else:
            self.status = self.Status.AVAILABLE

class Movement(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty_change = models.IntegerField()
    movement_type = models.CharField(max_length=16)  # "BUY" o "ADJUST"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.sku} - {self.qty_change} ({self.movement_type})"


class StockMovement(models.Model):
    class Reason(models.TextChoices):
        ADJUSTMENT = "ADJUSTMENT", "Ajuste manual"
        DAMAGE     = "DAMAGE",     "Merma/daño"
        RETURN     = "RETURN",     "Devolución"
        COUNT      = "COUNT",      "Diferencia inventario"

    product   = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements")
    delta     = models.IntegerField()  # puede ser negativo o positivo
    reason    = models.CharField(max_length=20, choices=Reason.choices, default=Reason.ADJUSTMENT)
    note      = models.CharField(max_length=255, blank=True)
    created_at= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sign = "+" if self.delta >= 0 else ""
        return f"{self.product.sku} {sign}{self.delta} ({self.reason})"
