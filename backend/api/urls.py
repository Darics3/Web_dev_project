from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ── Auth (FBV) ────────────────────────────────────────────
    path('auth/register/', views.register_view,     name='register'),
    path('auth/login/',    views.login_view,         name='login'),
    path('auth/logout/',   views.logout_view,        name='logout'),
    path('auth/me/',       views.current_user_view,  name='current-user'),
    path('auth/refresh/',  TokenRefreshView.as_view(), name='token-refresh'),

    # ── Products (CBV) ────────────────────────────────────────
    path('products/',      views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),

    # ── Orders (CBV) ─────────────────────────────────────────
    path('orders/',        views.OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(),  name='order-detail'),

    # ── Categories (CBV) ──────────────────────────────────────
    path('categories/',    views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
]
