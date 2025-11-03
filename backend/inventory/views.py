# inventory/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-updated_at')
    serializer_class = ProductSerializer

    # --- POST /api/products/{id}/buy/ ---
    @action(detail=True, methods=['post'])
    def buy(self, request, pk=None):
        try:
            product = self.get_object()
            qty_to_buy = int(request.data.get('qty', 0))

            if qty_to_buy <= 0:
                return Response({'error': 'Cantidad inválida'}, status=status.HTTP_400_BAD_REQUEST)
            if qty_to_buy > product.qty:
                return Response({'error': 'Stock insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

            # Restar stock
            product.qty -= qty_to_buy

            # Actualizar estado según stock
            if product.qty == 0:
                product.status = 'OUT'
            elif product.qty <= 5:
                product.status = 'PENDING'
            else:
                product.status = 'AVAILABLE'

            product.save()
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Product.DoesNotExist:
            return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
