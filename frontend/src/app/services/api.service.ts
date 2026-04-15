import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product, Order } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ══════════════════════════════════════════════════════
  //  CATEGORIES
  // ══════════════════════════════════════════════════════
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories/`);
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.BASE}/categories/`, data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.BASE}/categories/${id}/`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/categories/${id}/`);
  }

  // ══════════════════════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════════════════════
  getProducts(search = '', categoryId?: number): Observable<Product[]> {
    let params = new HttpParams();
    if (search)      params = params.set('search', search);
    if (categoryId)  params = params.set('category', categoryId.toString());
    return this.http.get<Product[]>(`${this.BASE}/products/`, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.BASE}/products/${id}/`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.BASE}/products/`, data);
  }

  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.BASE}/products/${id}/`, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/products/${id}/`);
  }

  // ══════════════════════════════════════════════════════
  //  ORDERS
  // ══════════════════════════════════════════════════════
  getOrders(statusFilter = ''): Observable<Order[]> {
    let params = new HttpParams();
    if (statusFilter) params = params.set('status', statusFilter);
    return this.http.get<Order[]>(`${this.BASE}/orders/`, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.BASE}/orders/${id}/`);
  }

  createOrder(data: any): Observable<Order> {
    return this.http.post<Order>(`${this.BASE}/orders/`, data);
  }

  updateOrder(id: number, data: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.BASE}/orders/${id}/`, data);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/orders/${id}/`);
  }
}
