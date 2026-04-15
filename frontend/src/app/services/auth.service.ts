import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8000/api/auth';

  private currentUser$ = new BehaviorSubject<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ─────────────────────────────────────────────
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login/`, { username, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  // ── Register ──────────────────────────────────────────
  register(username: string, email: string, password: string, password2: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API}/register/`, { username, email, password, password2 })
      .pipe(tap(res => this.saveSession(res)));
  }

  // ── Logout ────────────────────────────────────────────
  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      this.http.post(`${this.API}/logout/`, { refresh }).subscribe();
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers ───────────────────────────────────────────
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUser(): User | null {
    return this.currentUser$.getValue();
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('access_token',  res.tokens.access);
    localStorage.setItem('refresh_token', res.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
