from django.db import models
from django.contrib.auth.models import User


# ─── Custom Model Manager ────────────────────────────────────────
class ActiveProductManager(models.Manager):
    """Custom manager: returns only products that are in stock."""
    def get_queryset(self):
        return super().get_queryset().filter(stock__gt=0)

    def by_category(self, category_id):
        return self.get_queryset().filter(category_id=category_id)


# ─── Model 1: Category ──────────────────────────────────────────
class Category(models.Model):
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


# ─── Model 2: Product ───────────────────────────────────────────
class Product(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    stock       = models.PositiveIntegerField(default=0)
    category    = models.ForeignKey(          # ForeignKey #1
                    Category,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    related_name='products')
    created_by  = models.ForeignKey(          # ForeignKey #2
                    User,
                    on_delete=models.CASCADE,
                    related_name='products')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    # Default manager
    objects = models.Manager()
    # Custom manager (in_stock products only)
    in_stock = ActiveProductManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


# ─── Model 3: Order ─────────────────────────────────────────────
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('processing', 'Processing'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
    ]

    customer_name  = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes          = models.TextField(blank=True, default='')
    created_by     = models.ForeignKey(   # ForeignKey #3
                       User,
                       on_delete=models.CASCADE,
                       related_name='orders')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.pk} — {self.customer_name}"


# ─── Model 4: OrderItem ─────────────────────────────────────────
class OrderItem(models.Model):
    order    = models.ForeignKey(     # ForeignKey #4
                 Order,
                 on_delete=models.CASCADE,
                 related_name='items')
    product  = models.ForeignKey(     # ForeignKey #5
                 Product,
                 on_delete=models.SET_NULL,
                 null=True,
                 related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    price    = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product} x {self.quantity}"
