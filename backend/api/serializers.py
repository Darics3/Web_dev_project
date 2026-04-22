from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, UserProfile


# ════════════════════════════════════════════════════════════════
#  serializers.Serializer  (plain, manual validation)
# ════════════════════════════════════════════════════════════════

class LoginSerializer(serializers.Serializer):
    """#1 — plain Serializer: used for login endpoint."""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_username(self, value):
        if not value.strip():
            raise serializers.ValidationError('Username cannot be blank.')
        return value.strip()


class RegisterSerializer(serializers.Serializer):
    """#2 — plain Serializer: used for register endpoint."""
    username   = serializers.CharField(max_length=150)
    email      = serializers.EmailField()
    password   = serializers.CharField(write_only=True, min_length=6)
    password2  = serializers.CharField(write_only=True, label='Confirm password')
    role       = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False, default=UserProfile.ROLE_CUSTOMER)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({'username': 'Username already taken.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', UserProfile.ROLE_CUSTOMER)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, role=role)
        return user


# ════════════════════════════════════════════════════════════════
#  serializers.ModelSerializer
# ════════════════════════════════════════════════════════════════

class CategorySerializer(serializers.ModelSerializer):
    """#1 — ModelSerializer for Category."""
    product_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'description', 'created_at', 'product_count']
        read_only_fields = ['id', 'created_at']

    def get_product_count(self, obj):
        return obj.products.count()


class OrderItemSerializer(serializers.ModelSerializer):
    """Nested serializer for order items."""
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


class ProductSerializer(serializers.ModelSerializer):
    """#2 — ModelSerializer for Product."""
    category_name  = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'category', 'category_name',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    """#3 — ModelSerializer for Order (with nested items)."""
    items          = OrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    status_display  = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'status', 'status_display',
            'total_price', 'notes', 'items',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'total_price', 'created_at', 'updated_at']
