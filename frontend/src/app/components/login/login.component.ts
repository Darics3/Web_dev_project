import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h2>🛍 Baibol</h2>
        <p>Store Management Platform</p>

        <!-- Tab switcher -->
        <div style="display:flex; gap:8px; margin-bottom:24px;">
          <button class="btn" [class.btn-primary]="mode==='login'"
            [class.btn-secondary]="mode!=='login'"
            (click)="mode='login'; error=''">
            Login
          </button>
          <button class="btn" [class.btn-primary]="mode==='register'"
            [class.btn-secondary]="mode!=='register'"
            (click)="mode='register'; error=''">
            Register
          </button>
        </div>

        <!-- Error alert -->
        @if (error) {
          <div class="alert alert-error">{{ error }}</div>
        }
        @if (success) {
          <div class="alert alert-success">{{ success }}</div>
        }

        <!-- LOGIN FORM -->
        @if (mode === 'login') {
          <form (ngSubmit)="onLogin()">
            <div class="form-group">
              <label>Username</label>
              <!-- ngModel #1 -->
              <input type="text" [(ngModel)]="loginForm.username"
                     name="username" placeholder="Enter username" required />
            </div>
            <div class="form-group">
              <label>Password</label>
              <!-- ngModel #2 -->
              <input type="password" [(ngModel)]="loginForm.password"
                     name="password" placeholder="Enter password" required />
            </div>
            <button class="btn btn-primary" style="width:100%" type="submit"
                    [disabled]="loading">
              {{ loading ? 'Logging in…' : 'Login' }}
            </button>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (mode === 'register') {
          <form (ngSubmit)="onRegister()">
            <div class="form-group">
              <label>Username</label>
              <!-- ngModel #3 -->
              <input type="text" [(ngModel)]="registerForm.username"
                     name="username" placeholder="Choose a username" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <!-- ngModel #4 -->
              <input type="email" [(ngModel)]="registerForm.email"
                     name="email" placeholder="your@email.com" required />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="registerForm.password"
                     name="password" placeholder="Min 6 characters" required />
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input type="password" [(ngModel)]="registerForm.password2"
                     name="password2" placeholder="Repeat password" required />
            </div>
            <button class="btn btn-primary" style="width:100%" type="submit"
                    [disabled]="loading">
              {{ loading ? 'Creating account…' : 'Register' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  loading = false;
  error   = '';
  success = '';

  loginForm    = { username: '', password: '' };
  registerForm = { username: '', email: '', password: '', password2: '' };

  constructor(private auth: AuthService, private router: Router) {}

  // ── Click event #1: Login ──────────────────────────────
  onLogin(): void {
    this.error = ''; this.loading = true;
    this.auth.login(this.loginForm.username, this.loginForm.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        // Handle API errors gracefully
        this.error = err.error?.error || err.error?.detail || 'Login failed. Check your credentials.';
        this.loading = false;
      },
    });
  }

  // ── Click event #2: Register ───────────────────────────
  onRegister(): void {
    this.error = ''; this.loading = true;
    const { username, email, password, password2 } = this.registerForm;
    this.auth.register(username, email, password, password2).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting…';
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: err => {
        const errs = err.error;
        if (typeof errs === 'object') {
          this.error = Object.values(errs).flat().join(' ');
        } else {
          this.error = 'Registration failed.';
        }
        this.loading = false;
      },
    });
  }
}
