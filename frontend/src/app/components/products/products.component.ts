import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product, Category } from '../../models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>📦 Products</h1>
        <!-- Click event #3: open add modal -->
        <button class="btn btn-primary" (click)="openModal()">+ Add Product</button>
      </div>

      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      <!-- Search & filter bar -->
      <div class="search-bar">
        <input type="text" placeholder="Search products…"
               [(ngModel)]="searchQuery" name="search"
               (input)="onSearch()" />
        <select [(ngModel)]="selectedCategory" name="category" (change)="onSearch()">
          <option value="">All Categories</option>
          @for (cat of categories; track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
      </div>

      @if (loading) {
        <div class="loading">Loading products…</div>
      } @else {
        <div class="card">
          @if (products.length === 0) {
            <div class="empty-state"><p>No products found.</p></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of products; track product.id) {
                    <tr>
                      <td>{{ product.id }}</td>
                      <td>
                        <strong>{{ product.name }}</strong>
                        @if (product.description) {
                          <div style="font-size:.8rem; color:#999; margin-top:2px">
                            {{ product.description | slice:0:60 }}…
                          </div>
                        }
                      </td>
                      <td>{{ product.category_name || '—' }}</td>
                      <td><strong>{{ product.price | number:'1.0-0' }} ₸</strong></td>
                      <td>
                        @if (product.stock < 5) {
                          <span style="color:#e74c3c; font-weight:700">{{ product.stock }} ⚠️</span>
                        } @else {
                          <span>{{ product.stock }}</span>
                        }
                      </td>
                      <td>
                        <!-- Click event #4: edit product -->
                        <button class="btn btn-warning btn-sm" (click)="openModal(product)">Edit</button>
                        <!-- Click event #5: delete product -->
                        <button class="btn btn-danger btn-sm"
                                style="margin-left:6px"
                                (click)="deleteProduct(product.id)">Delete</button>
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

    <!-- Add/Edit Modal -->
    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h3>

          @if (modalError) {
            <div class="alert alert-error">{{ modalError }}</div>
          }

          <div class="form-group">
            <label>Product Name *</label>
            <input type="text" [(ngModel)]="form.name" name="name"
                   placeholder="e.g. Nike Air Max" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" name="description"
                      rows="3" placeholder="Product description…"></textarea>
          </div>
          <div class="form-group">
            <label>Price (₸) *</label>
            <input type="number" [(ngModel)]="form.price" name="price"
                   placeholder="0" min="0" />
          </div>
          <div class="form-group">
            <label>Stock Quantity *</label>
            <input type="number" [(ngModel)]="form.stock" name="stock"
                   placeholder="0" min="0" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select [(ngModel)]="form.category" name="category">
              <option [value]="null">No Category</option>
              @for (cat of categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <!-- Click event #6: save product -->
            <button class="btn btn-primary" (click)="saveProduct()" [disabled]="saving">
              {{ saving ? 'Saving…' : (editingProduct ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductsComponent implements OnInit {
  products:   Product[]  = [];
  categories: Category[] = [];
  loading       = true;
  error         = '';
  modalError    = '';
  showModal     = false;
  saving        = false;
  editingProduct: Product | null = null;
  searchQuery    = '';
  selectedCategory: any = '';

  form = { name: '', description: '', price: 0, stock: 0, category: null as number | null };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.api.getCategories().subscribe({
      next: cats => this.categories = cats,
      error: () => {},
    });
  }

  loadData(): void {
    this.loading = true; this.error = '';
    this.api.getProducts(this.searchQuery, this.selectedCategory || undefined).subscribe({
      next: products => { this.products = products; this.loading = false; },
      error: err => {
        // Graceful error handling
        this.error   = err.error?.detail || 'Failed to load products. Please try again.';
        this.loading = false;
      },
    });
  }

  onSearch(): void { this.loadData(); }

  openModal(product?: Product): void {
    this.editingProduct = product || null;
    this.modalError = '';
    if (product) {
      this.form = {
        name: product.name, description: product.description,
        price: +product.price, stock: product.stock,
        category: product.category,
      };
    } else {
      this.form = { name: '', description: '', price: 0, stock: 0, category: null };
    }
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveProduct(): void {
    if (!this.form.name.trim()) { this.modalError = 'Product name is required.'; return; }
    this.saving = true; this.modalError = '';

    const obs = this.editingProduct
      ? this.api.updateProduct(this.editingProduct.id, this.form)
      : this.api.createProduct(this.form);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadData(); },
      error: err => {
        const errs = err.error;
        if (typeof errs === 'object') {
          this.modalError = Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join(' | ');
        } else {
          this.modalError = 'Failed to save product.';
        }
        this.saving = false;
      },
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.api.deleteProduct(id).subscribe({
      next: () => this.loadData(),
      error: () => this.error = 'Failed to delete product.',
    });
  }
}
