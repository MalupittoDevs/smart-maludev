from rest_framework import serializers
from .models import Product, StockMovement

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id","sku","name","qty","status","price","updated_at"]

class StockMovementSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_sku",
            "product_name",
            "delta",
            "reason",
            "note",
            "created_at",
        ]
