from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-updated_at')
    serializer_class = ProductSerializer

    # POST /api/products/{id}/buy/
    @action(detail=True, methods=['post'])
    def buy(self, request, pk=None):
        product = self.get_object()
        qty_to_buy = int(request.data.get('qty', 0))

        if qty_to_buy <= 0:
            return Response({'error': 'Cantidad inválida'}, status=status.HTTP_400_BAD_REQUEST)
        if qty_to_buy > product.qty:
            return Response({'error': 'Stock insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

        # Actualizar stock
        product.qty -= qty_to_buy
        if product.qty == 0:
            product.status = 'OUT'
        elif product.qty < 5:
            product.status = 'PENDING'
        product.save()

        return Response({'message': f'Compra confirmada de {qty_to_buy} unidad(es) de {product.name}',
                         'new_stock': product.qty,
                         'status': product.status},
                        status=status.HTTP_200_OK)
