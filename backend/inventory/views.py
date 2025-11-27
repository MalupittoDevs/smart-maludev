# backend/inventory/views.py
from datetime import timedelta

from django.db.models import Q, Sum, F
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Product, StockMovement
from .serializers import ProductSerializer, StockMovementSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-updated_at")
    serializer_class = ProductSerializer

    @action(detail=True, methods=["post"])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        try:
            delta = int(request.data.get("delta", 0))
        except (TypeError, ValueError):
            return Response(
                {"error": "delta debe ser entero"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if delta == 0:
            return Response(
                {"error": "delta no puede ser 0"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_qty = product.qty + delta
        if new_qty < 0:
            return Response(
                {"error": f"El ajuste dejaría el stock negativo ({new_qty})"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason") or StockMovement.Reason.ADJUSTMENT
        if reason not in StockMovement.Reason.values:
            return Response(
                {"error": "reason inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        note = (request.data.get("note") or "").strip()

        product.qty = new_qty
        product.refresh_status()
        product.save()

        movement = StockMovement.objects.create(
          product=product,
          delta=delta,
          reason=reason,
          note=note,
        )

        return Response(
            {
                "message": "Ajuste aplicado",
                "product": ProductSerializer(product).data,
                "movement": StockMovementSerializer(movement).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def buy(self, request, pk=None):
        product = self.get_object()
        try:
            qty_to_buy = int(request.data.get("qty", 0))
        except (TypeError, ValueError):
            return Response(
                {"error": "qty debe ser entero"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if qty_to_buy <= 0:
            return Response(
                {"error": "Cantidad inválida"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if qty_to_buy > product.qty:
            return Response(
                {"error": "Stock insuficiente"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.qty -= qty_to_buy
        product.refresh_status()
        product.save()

        movement = StockMovement.objects.create(
            product=product,
            delta=-qty_to_buy,
            reason=StockMovement.Reason.ADJUSTMENT,  # o "SALE" si lo tienes en el enum
            note="Venta punto de venta",
        )

        return Response(
            {
                "message": "Compra registrada",
                "new_stock": product.qty,
                "status": product.status,
                "movement": StockMovementSerializer(movement).data,
            },
            status=status.HTTP_200_OK,
        )


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/movements/?sku=&reason=&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&product=&limit=200
    """
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        qs = StockMovement.objects.select_related("product").order_by("-created_at")
        params = self.request.query_params

        sku = params.get("sku")
        if sku:
            qs = qs.filter(product__sku__icontains=sku)

        product_id = params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)

        reason = params.get("reason")
        if reason:
            qs = qs.filter(reason=reason)

        df = params.get("date_from")
        dt = params.get("date_to")
        if df:
            d1 = parse_date(df)
            if d1:
                qs = qs.filter(created_at__date__gte=d1)
        if dt:
            d2 = parse_date(dt)
            if d2:
                qs = qs.filter(created_at__date__lte=d2)

        try:
            limit = int(params.get("limit", 200))
        except ValueError:
            limit = 200
        return qs[: max(1, min(limit, 1000))]


# 🔹 NUEVO: endpoint para el dashboard
@api_view(["GET"])
def dashboard_summary(request):
    products = Product.objects.all()

    total_products = products.count()
    total_stock = products.aggregate(s=Sum("qty"))["s"] or 0
    total_value = products.aggregate(v=Sum(F("qty") * F("price")))["v"] or 0

    now = timezone.now()
    week_ago = now - timedelta(days=7)
    movements_last_7d = StockMovement.objects.filter(
        created_at__gte=week_ago
    ).count()

    low_stock_qs = products.filter(qty__lte=5).order_by("qty")[:5]
    low_stock = [
        {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "qty": p.qty,
            "status": p.status,
        }
        for p in low_stock_qs
    ]

    month_ago = now - timedelta(days=30)
    forecasts = []
    for p in products:
        qs = StockMovement.objects.filter(
            product=p,
            created_at__gte=month_ago,
            delta__lt=0,
        )
        total_out = qs.aggregate(s=Sum("delta"))["s"] or 0
        daily_usage = -total_out / 30.0 if total_out else 0.0

        if daily_usage > 0:
            days_to_zero = p.qty / daily_usage
        else:
            days_to_zero = None

        forecasts.append(
            {
                "sku": p.sku,
                "name": p.name,
                "avg_daily_usage": round(daily_usage, 2),
                "days_to_zero": round(days_to_zero, 1)
                if days_to_zero is not None
                else None,
                "current_qty": p.qty,
            }
        )

    forecasts_sorted = sorted(
        [f for f in forecasts if f["days_to_zero"] is not None],
        key=lambda f: f["days_to_zero"],
    )[:5]

    data = {
        "total_products": total_products,
        "total_stock": total_stock,
        "total_value": total_value,
        "movements_last_7d": movements_last_7d,
        "low_stock": low_stock,
        "forecast": forecasts_sorted,
    }
    return Response(data, status=status.HTTP_200_OK)
