import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product, Order, Category } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>👋 Welcome, {{ auth.getUser()?.username }}!</h1>
      </div>

      @if (loading) {
        <div class="loading">Loading dashboard…</div>
      } @else {
        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="value">{{ products.length }}</div>
            <div class="label">Total Products</div>
          </div>
          <div class="stat-card">
            <div class="value">{{ orders.length }}</div>
            <div class="label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="value">{{ categories.length }}</div>
            <div class="label">Categories</div>
          </div>
          <div class="stat-card">
            <div class="value">{{ pendingOrders }}</div>
            <div class="label">Pending Orders</div>
          </div>
          <div class="stat-card">
            <div class="value">{{ totalRevenue | number:'1.0-0' }} ₸</div>
            <div class="label">Total Revenue</div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card">
          <div class="page-header" style="margin-bottom:16px">
            <h2 style="font-size:1.1rem; font-weight:700">Recent Orders</h2>
            <a routerLink="/orders" class="btn btn-secondary btn-sm">View All</a>
          </div>

          @if (recentOrders.length === 0) {
            <div class="empty-state"><p>No orders yet.</p></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of recentOrders; track order.id) {
                    <tr>
                      <td>#{{ order.id }}</td>
                      <td>{{ order.customer_name }}</td>
                      <td>
                        <span class="badge badge-{{ order.status }}">
                          {{ order.status_display }}
                        </span>
                      </td>
                      <td>{{ order.total_price | number:'1.0-0' }} ₸</td>
                      <td>{{ order.created_at | date:'dd MMM, HH:mm' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Low Stock Products -->
        <div class="card">
          <h2 style="font-size:1.1rem; font-weight:700; margin-bottom:16px">
            ⚠️ Low Stock Products
          </h2>
          @if (lowStock.length === 0) {
            <div class="empty-state"><p>All products are well stocked!</p></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th></tr>
                </thead>
                <tbody>
                  @for (p of lowStock; track p.id) {
                    <tr>
                      <td>{{ p.name }}</td>
                      <td>{{ p.category_name || '—' }}</td>
                      <td style="color:#e74c3c; font-weight:700">{{ p.stock }}</td>
                      <td>{{ p.price | number:'1.0-0' }} ₸</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  products: Product[]  = [];
  orders:   Order[]    = [];
  categories: Category[] = [];
  loading = true;
  error   = '';

  get pendingOrders()  { return this.orders.filter(o => o.status === 'pending').length; }
  get totalRevenue()   { return this.orders.filter(o => o.status === 'completed').reduce((s, o) => s + +o.total_price, 0); }
  get recentOrders()   { return this.orders.slice(0, 5); }
  get lowStock()       { return this.products.filter(p => p.stock < 5); }

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    Promise.all([
      this.api.getProducts().toPromise(),
      this.api.getOrders().toPromise(),
      this.api.getCategories().toPromise(),
    ]).then(([products, orders, categories]) => {
      this.products   = products   || [];
      this.orders     = orders     || [];
      this.categories = categories || [];
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }
}
