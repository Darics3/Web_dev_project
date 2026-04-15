import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/products.component').then(m => m.ProductsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [authGuard],
  },
  { path: '',        redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**',      redirectTo: 'dashboard' },
];
