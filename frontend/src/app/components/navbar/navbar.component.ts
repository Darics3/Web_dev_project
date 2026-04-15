import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <a class="brand" routerLink="/dashboard">🛍 Baibol</a>

      <nav>
        <a routerLink="/dashboard"   routerLinkActive="active">Dashboard</a>
        <a routerLink="/products"    routerLinkActive="active">Products</a>
        <a routerLink="/orders"      routerLinkActive="active">Orders</a>
        <a routerLink="/categories"  routerLinkActive="active">Categories</a>
        <span style="color:#888; font-size:.85rem; margin: 0 8px;">
          {{ auth.getUser()?.username }}
        </span>
        <button class="btn-logout" (click)="auth.logout()">Logout</button>
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
