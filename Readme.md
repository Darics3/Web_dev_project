# 🛍 Baibol — Store Management Platform

> **Web Development Project** | Angular + Django | KBTU

## 👥 Group Members

| Name | Role | GitHub |
|------|------|--------|
| Member 1 | Backend (Django) | AbdrakhmanYeskendir |
| Member 2 | Frontend (Angular) | KainarSuleiman|
| Member 3 | Integration & Docs | Izbasarov Darkhan |

---

## 📋 Project Description

**Baibol** is a store management platform that allows shop owners to manage products,
track orders, and organize inventory categories — all in one place.

**Tech Stack:**
- **Frontend:** Angular 17 (standalone components, reactive forms, HTTP interceptors)
- **Backend:** Django 4.2 + Django REST Framework + JWT Auth
- **Database:** SQLite (development) / PostgreSQL (production)

---

## ✅ Requirements Checklist

### Front-End (Angular)
- [x] Interfaces and services to interact with back-end APIs (`ApiService`, `AuthService`)
- [x] 4+ click events that trigger API requests (Login, Register, Save Product, Delete, Update Status, Add to Order…)
- [x] 4+ `[(ngModel)]` form controls (Login form: username, password; Register form: username, email, password, confirm; Product form; Order form)
- [x] Basic CSS styling applied to all components (`styles.css`)
- [x] Routing module with 5 named routes: `/login`, `/dashboard`, `/products`, `/orders`, `/categories`
- [x] `@for` to loop over data, `@if` for conditional rendering (Angular 17 syntax)
- [x] JWT authentication: HTTP interceptor (`auth.interceptor.ts`), login page, logout functionality
- [x] Angular Service using `HttpClient` for all API communication (`ApiService`)
- [x] API errors handled gracefully (error messages shown on failed requests)

### Back-End (Django + DRF)
- [x] 4 models: `Category`, `Product`, `Order`, `OrderItem`
- [x] 1 custom model manager: `ActiveProductManager` (returns in-stock products)
- [x] 2+ ForeignKey relationships (Product→Category, Product→User, Order→User, OrderItem→Order, OrderItem→Product)
- [x] 2 `serializers.Serializer`: `LoginSerializer`, `RegisterSerializer`
- [x] 2 `serializers.ModelSerializer`: `ProductSerializer`, `OrderSerializer` (+ `CategorySerializer`)
- [x] 2 FBV with DRF decorators: `register_view`, `login_view` / `logout_view` / `current_user_view`
- [x] 2+ CBV using `APIView`: `ProductListCreateView`, `ProductDetailView`, `OrderListCreateView`, `OrderDetailView`, `CategoryListCreateView`, `CategoryDetailView`
- [x] Token-based authentication (JWT via `djangorestframework-simplejwt`)
- [x] Full CRUD for `Product` model (GET list, GET detail, POST, PUT, PATCH, DELETE)
- [x] Objects linked to authenticated user (`created_by=request.user`)
- [x] CORS configured via `django-cors-headers` (allows `http://localhost:4200`)
- [x] Postman collection committed to repo (`postman_collection.json`)

---

## 🚀 Setup & Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: `http://localhost:4200`

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | ❌ | Register new user |
| POST | `/api/auth/login/` | ❌ | Login, get JWT tokens |
| POST | `/api/auth/logout/` | ✅ | Blacklist refresh token |
| GET | `/api/auth/me/` | ✅ | Get current user |
| GET | `/api/products/` | ✅ | List products (search, filter) |
| POST | `/api/products/` | ✅ | Create product |
| GET | `/api/products/{id}/` | ✅ | Get product detail |
| PUT | `/api/products/{id}/` | ✅ | Update product |
| DELETE | `/api/products/{id}/` | ✅ | Delete product |
| GET | `/api/orders/` | ✅ | List orders (filter by status) |
| POST | `/api/orders/` | ✅ | Create order |
| PATCH | `/api/orders/{id}/` | ✅ | Update order status |
| DELETE | `/api/orders/{id}/` | ✅ | Delete order |
| GET | `/api/categories/` | ✅ | List categories |
| POST | `/api/categories/` | ✅ | Create category |
| PUT | `/api/categories/{id}/` | ✅ | Update category |
| DELETE | `/api/categories/{id}/` | ✅ | Delete category |

---

## 📁 Project Structure

```
baibol/
├── backend/
│   ├── api/
│   │   ├── models.py        # 4 models + custom manager
│   │   ├── serializers.py   # 2x Serializer + 2x ModelSerializer
│   │   ├── views.py         # 2 FBV + 4 CBV
│   │   └── urls.py
│   ├── baibol_backend/
│   │   ├── settings.py      # CORS, JWT, DRF config
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── components/
│       │   ├── login/       # Login & Register
│       │   ├── dashboard/   # Stats overview
│       │   ├── products/    # Product CRUD
│       │   ├── orders/      # Order management
│       │   ├── categories/  # Category CRUD
│       │   └── navbar/      # Navigation
│       ├── services/
│       │   ├── auth.service.ts   # Auth (login/logout/register)
│       │   └── api.service.ts    # All API calls via HttpClient
│       ├── interceptors/
│       │   └── auth.interceptor.ts  # JWT token injector
│       ├── guards/
│       │   └── auth.guard.ts     # Route protection
│       ├── models/
│       │   └── models.ts         # TypeScript interfaces
│       └── app.routes.ts         # 5 named routes
└── postman_collection.json
```
