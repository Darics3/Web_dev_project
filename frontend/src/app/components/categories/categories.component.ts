import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>🏷 Categories</h1>
        <button class="btn btn-primary" (click)="openModal()">+ Add Category</button>
      </div>

      @if (error) { <div class="alert alert-error">{{ error }}</div> }
      @if (success) { <div class="alert alert-success">{{ success }}</div> }

      @if (loading) {
        <div class="loading">Loading categories…</div>
      } @else {
        <div class="card">
          @if (categories.length === 0) {
            <div class="empty-state"><p>No categories yet.</p></div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (cat of categories; track cat.id) {
                    <tr>
                      <td>{{ cat.id }}</td>
                      <td><strong>{{ cat.name }}</strong></td>
                      <td>{{ cat.description || '—' }}</td>
                      <td>{{ cat.product_count }}</td>
                      <td>
                        <button class="btn btn-warning btn-sm" (click)="openModal(cat)">Edit</button>
                        <button class="btn btn-danger btn-sm" style="margin-left:6px"
                                (click)="deleteCategory(cat.id)">Delete</button>
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

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" style="max-width:440px" (click)="$event.stopPropagation()">
          <h3>{{ editingCat ? 'Edit Category' : 'Add Category' }}</h3>

          @if (modalError) { <div class="alert alert-error">{{ modalError }}</div> }

          <div class="form-group">
            <label>Category Name *</label>
            <input type="text" [(ngModel)]="form.name" name="name"
                   placeholder="e.g. Electronics" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" name="description"
                      rows="3" placeholder="Optional description…"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveCategory()" [disabled]="saving">
              {{ saving ? 'Saving…' : (editingCat ? 'Update' : 'Create') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading    = true;
  error      = '';
  success    = '';
  modalError = '';
  showModal  = false;
  saving     = false;
  editingCat: Category | null = null;

  form = { name: '', description: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.loading = true; this.error = '';
    this.api.getCategories().subscribe({
      next: cats => { this.categories = cats; this.loading = false; },
      error: err  => {
        this.error   = err.error?.detail || 'Failed to load categories.';
        this.loading = false;
      },
    });
  }

  openModal(cat?: Category): void {
    this.editingCat = cat || null;
    this.modalError = '';
    this.form = cat ? { name: cat.name, description: cat.description } : { name: '', description: '' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveCategory(): void {
    if (!this.form.name.trim()) { this.modalError = 'Category name is required.'; return; }
    this.saving = true; this.modalError = '';

    const obs = this.editingCat
      ? this.api.updateCategory(this.editingCat.id, this.form)
      : this.api.createCategory(this.form);

    obs.subscribe({
      next: () => {
        this.saving  = false;
        this.success = this.editingCat ? 'Category updated!' : 'Category created!';
        setTimeout(() => this.success = '', 3000);
        this.closeModal();
        this.loadCategories();
      },
      error: err => {
        const errs = err.error;
        this.modalError = typeof errs === 'object'
          ? Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join(' ')
          : 'Failed to save category.';
        this.saving = false;
      },
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.api.deleteCategory(id).subscribe({
      next: () => { this.success = 'Category deleted.'; setTimeout(() => this.success = '', 3000); this.loadCategories(); },
      error: () => this.error = 'Failed to delete category.',
    });
  }
}
