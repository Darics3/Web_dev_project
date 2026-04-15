from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Product, Order, OrderItem
from .serializers import (
    LoginSerializer, RegisterSerializer,
    CategorySerializer, ProductSerializer, OrderSerializer, OrderItemSerializer,
)


# ════════════════════════════════════════════════════════════════
#  Helper
# ════════════════════════════════════════════════════════════════
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


# ════════════════════════════════════════════════════════════════
#  FBV #1 — Register
# ════════════════════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/auth/register/
    Creates a new user account and returns JWT tokens.
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'User registered successfully.',
            'user': {'id': user.id, 'username': user.username, 'email': user.email},
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════════════════════
#  FBV #2 — Login / Logout
# ════════════════════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Validates credentials and returns JWT tokens.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    if user is None:
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = get_tokens_for_user(user)
    return Response({
        'message': 'Login successful.',
        'user': {'id': user.id, 'username': user.username, 'email': user.email},
        'tokens': tokens,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout/
    Blacklists the refresh token.
    """
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    GET /api/auth/me/
    Returns the currently authenticated user's info.
    """
    user = request.user
    return Response({
        'id':       user.id,
        'username': user.username,
        'email':    user.email,
    })


# ════════════════════════════════════════════════════════════════
#  CBV #1 — ProductListCreateView  (List + Create)
# ════════════════════════════════════════════════════════════════
class ProductListCreateView(APIView):
    """
    GET  /api/products/    — list all products
    POST /api/products/    — create a product (linked to request.user)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search   = request.query_params.get('search', '')
        category = request.query_params.get('category', '')

        products = Product.objects.select_related('category', 'created_by').all()
        if search:
            products = products.filter(name__icontains=search)
        if category:
            products = products.filter(category_id=category)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)   # link to authenticated user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════════════════════
#  CBV #2 — ProductDetailView  (Retrieve + Update + Delete)
# ════════════════════════════════════════════════════════════════
class ProductDetailView(APIView):
    """
    GET    /api/products/<pk>/  — retrieve
    PUT    /api/products/<pk>/  — full update
    PATCH  /api/products/<pk>/  — partial update
    DELETE /api/products/<pk>/  — delete
    """
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self._get_object(pk)
        if product is None:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data)

    def put(self, request, pk):
        product = self._get_object(pk)
        if product is None:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        product = self._get_object(pk)
        if product is None:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self._get_object(pk)
        if product is None:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response({'message': 'Product deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════════════
#  CBV #3 — OrderListCreateView
# ════════════════════════════════════════════════════════════════
class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        orders = Order.objects.filter(created_by=request.user).prefetch_related('items__product')
        if status_filter:
            orders = orders.filter(status=status_filter)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(created_by=request.user)   # link to user
            # Handle items from request body
            items_data = request.data.get('items', [])
            total = 0
            for item_data in items_data:
                try:
                    product = Product.objects.get(pk=item_data['product'])
                    qty     = int(item_data.get('quantity', 1))
                    price   = product.price
                    OrderItem.objects.create(order=order, product=product, quantity=qty, price=price)
                    total += price * qty
                except Product.DoesNotExist:
                    pass
            order.total_price = total
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════════════════════
#  CBV #4 — OrderDetailView
# ════════════════════════════════════════════════════════════════
class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        try:
            return Order.objects.get(pk=pk, created_by=user)
        except Order.DoesNotExist:
            return None

    def get(self, request, pk):
        order = self._get_object(pk, request.user)
        if order is None:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)

    def patch(self, request, pk):
        order = self._get_object(pk, request.user)
        if order is None:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        order = self._get_object(pk, request.user)
        if order is None:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        order.delete()
        return Response({'message': 'Order deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ════════════════════════════════════════════════════════════════
#  Categories — simple CRUD via APIView
# ════════════════════════════════════════════════════════════════
class CategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all()
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def get(self, request, pk):
        cat = self._get_object(pk)
        if cat is None:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(cat).data)

    def put(self, request, pk):
        cat = self._get_object(pk)
        if cat is None:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(cat, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cat = self._get_object(pk)
        if cat is None:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        cat.delete()
        return Response({'message': 'Category deleted.'}, status=status.HTTP_204_NO_CONTENT)
