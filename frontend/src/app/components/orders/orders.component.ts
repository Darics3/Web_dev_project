import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Order, Product } from '../../models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>🛒 Orders</h1>
        <button class="btn btn-primary" (click)="openModal()">+ New Order</button>
      </div>

      @if (error) { <div class="alert alert-error">{{ error }}</div> }

      <!-- Filter by status -->
      <div class="search-bar">
        <select [(ngModel)]="statusFilter" name="statusFilter" (change)="loadOrders()">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      @if (loading) {
        <div class="loading">Loading orders…</div>
      } @else {
        <div class="card">
          @if (orders.length === 0) {
            <div class="empty-state"><p>No orders found.</p></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders; track order.id) {
                    <tr>
                      <td>#{{ order.id }}</td>
                      <td><strong>{{ order.customer_name }}</strong></td>
                      <td>{{ order.customer_phone || '—' }}</td>
                      <td>
                        <span class="badge badge-{{ order.status }}">
                          {{ order.status_display }}
                        </span>
                      </td>
                      <td>{{ order.items.length }}</td>
                      <td><strong>{{ order.total_price | number:'1.0-0' }} ₸</strong></td>
                      <td>{{ order.created_at | date:'dd MMM, HH:mm' }}</td>
                      <td>
                        <button class="btn btn-warning btn-sm" (click)="openStatusModal(order)">
                          Status
                        </button>
                        <button class="btn btn-danger btn-sm" style="margin-left:6px"
                                (click)="deleteOrder(order.id)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>

    <!-- New Order Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>New Order</h3>

          @if (modalError) { <div class="alert alert-error">{{ modalError }}</div> }

          <div class="form-group">
            <label>Customer Name *</label>
            <input type="text" [(ngModel)]="form.customer_name" name="customer_name"
                   placeholder="e.g. Aigerim Bekova" />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="form.customer_phone" name="customer_phone"
                   placeholder="+7 (777) 123-45-67" />
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="form.notes" name="notes" rows="2"
                      placeholder="Delivery notes…"></textarea>
          </div>

          <!-- Add product to order -->
          <div style="margin-bottom:16px">
            <h4 style="font-size:.9rem; font-weight:700; margin-bottom:10px; color:#555">
              Order Items
            </h4>
            <div style="display:flex; gap:8px; margin-bottom:10px">
              <select [(ngModel)]="selectedProductId" name="selProd"
                      style="flex:1; padding:8px; border:1.5px solid #dde1e7; border-radius:8px;">
                <option [value]="0">— Select product —</option>
                @for (p of products; track p.id) {
                  <option [value]="p.id">{{ p.name }} ({{ p.price | number:'1.0-0' }} ₸)</option>
                }
              </select>
              <input type="number" [(ngModel)]="selectedQty" name="selQty"
                     min="1" style="width:80px; padding:8px; border:1.5px solid #dde1e7; border-radius:8px;" />
              <button class="btn btn-success btn-sm" (click)="addItem()">Add</button>
            </div>

            @for (item of orderItems; track $index) {
              <div style="display:flex; justify-content:space-between; align-items:center;
                          background:#f9f9f9; border-radius:8px; padding:8px 12px; margin-bottom:6px;">
                <span>{{ item.name }}</span>
                <span style="color:#888">x{{ item.qty }}</span>
                <span><strong>{{ item.price * item.qty | number:'1.0-0' }} ₸</strong></span>
                <button class="btn btn-danger btn-sm" (click)="removeItem($index)">✕</button>
              </div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="createOrder()" [disabled]="saving">
              {{ saving ? 'Creating…' : 'Create Order' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Update Status Modal -->
    @if (showStatusModal && editingOrder) {
      <div class="modal-overlay" (click)="closeStatusModal()">
        <div class="modal" style="max-width:380px" (click)="$event.stopPropagation()">
          <h3>Update Status — Order #{{ editingOrder.id }}</h3>
          <div class="form-group">
            <label>New Status</label>
            <select [(ngModel)]="newStatus" name="newStatus">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeStatusModal()">Cancel</button>
            <button class="btn btn-primary" (click)="updateStatus()" [disabled]="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[]   = [];
  products: Product[] = [];
  loading       = true;
  error         = '';
  modalError    = '';
  showModal     = false;
  showStatusModal = false;
  saving        = false;
  statusFilter  = '';
  editingOrder: Order | null = null;
  newStatus    = 'pending';

  form = { customer_name: '', customer_phone: '', notes: '' };
  orderItems: { productId: number; name: string; qty: number; price: number }[] = [];
  selectedProductId = 0;
  selectedQty       = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.api.getProducts().subscribe({ next: p => this.products = p, error: () => {} });
  }

  loadOrders(): void {
    this.loading = true; this.error = '';
    this.api.getOrders(this.statusFilter).subscribe({
      next: orders => { this.orders = orders; this.loading = false; },
      error: err   => {
        this.error   = err.error?.detail || 'Failed to load orders.';
        this.loading = false;
      },
    });
  }

  openModal(): void {
    this.showModal  = true;
    this.modalError = '';
    this.orderItems = [];
    this.form       = { customer_name: '', customer_phone: '', notes: '' };
  }

  closeModal(): void { this.showModal = false; }

  addItem(): void {
    if (!this.selectedProductId) return;
    const product = this.products.find(p => p.id === +this.selectedProductId);
    if (!product) return;
    const existing = this.orderItems.find(i => i.productId === product.id);
    if (existing) { existing.qty += this.selectedQty; }
    else {
      this.orderItems.push({
        productId: product.id, name: product.name,
        qty: this.selectedQty, price: +product.price,
      });
    }
    this.selectedProductId = 0; this.selectedQty = 1;
  }

  removeItem(index: number): void { this.orderItems.splice(index, 1); }

  createOrder(): void {
    if (!this.form.customer_name.trim()) { this.modalError = 'Customer name is required.'; return; }
    this.saving = true; this.modalError = '';
    const payload = {
      ...this.form,
      items: this.orderItems.map(i => ({ product: i.productId, quantity: i.qty })),
    };
    this.api.createOrder(payload).subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadOrders(); },
      error: err => {
        const errs = err.error;
        this.modalError = typeof errs === 'object'
          ? Object.values(errs).flat().join(' ')
          : 'Failed to create order.';
        this.saving = false;
      },
    });
  }

  openStatusModal(order: Order): void {
    this.editingOrder    = order;
    this.newStatus       = order.status;
    this.showStatusModal = true;
  }

  closeStatusModal(): void { this.showStatusModal = false; }

  updateStatus(): void {
    if (!this.editingOrder) return;
    this.saving = true;
    this.api.updateOrder(this.editingOrder.id, { status: this.newStatus as any }).subscribe({
      next: () => { this.saving = false; this.closeStatusModal(); this.loadOrders(); },
      error: () => { this.saving = false; },
    });
  }

  deleteOrder(id: number): void {
    if (!confirm('Delete this order?')) return;
    this.api.deleteOrder(id).subscribe({
      next: () => this.loadOrders(),
      error: () => this.error = 'Failed to delete order.',
    });
  }
}
