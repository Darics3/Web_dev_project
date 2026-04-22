# Baibol - Store Management Platform

Web Development Project (KBTU): Angular + Django/DRF + JWT.

## Team Members

- Abdrakhman Yeskendir - Backend (Django, DRF, JWT)
- Kainar Suleiman - Frontend (Angular, UI, guards)
- Izbassarov Darkhan - Integration, testing, documentation

## Project Description

Baibol is a store management platform where users can manage products, categories, and orders.
The project supports role-based access:

- `admin` - full access
- `manager` - can manage products/categories and moderate orders
- `customer` - can browse products/categories and create own orders

| Name | Role | GitHub |
|------|------|--------|
| Abdrakhman Yeskendir| Backend (Django) | AbdrakhmanYeskendir |
| Kainar Suleiman | Frontend (Angular) | KainarSuleiman|
| Izbasarov Darkhan | Integration & Docs | Darics3 |

- Frontend: Angular 17, TypeScript, HttpClient, standalone components
- Backend: Django 4.2, Django REST Framework, SimpleJWT
- Database: SQLite (dev)

## Implemented Requirements Checklist

### Frontend (Angular)

- API services and interfaces: `frontend/src/app/services/`, `frontend/src/app/models/`
- 4+ click events with API calls: login/register/create/update/delete/status actions
- 4+ `ngModel` controls across login/products/orders/categories forms
- Angular 17 `@if` and `@for` templates
- Routes: `/login`, `/dashboard`, `/products`, `/orders`, `/categories`
- JWT interceptor for Bearer token
- API error handling in UI (alerts/messages on failed requests)

### Backend (Django + DRF)

- 4 models: `Category`, `Product`, `Order`, `OrderItem`
- Custom manager: `ActiveProductManager`
- 2+ ForeignKey relations (implemented 5+)
- Plain serializers: `LoginSerializer`, `RegisterSerializer`
- Model serializers: `CategorySerializer`, `ProductSerializer`, `OrderSerializer`
- FBV auth endpoints: register/login/logout/me
- CBV APIView endpoints: products/orders/categories
- JWT authentication via `djangorestframework-simplejwt`
- Full Product CRUD
- Object ownership on create (`created_by=request.user`)
- CORS for Angular dev host
- Postman collection included

## Role-Based Access

- Backend checks role via `UserProfile` model and DRF permissions.
- Frontend shows/hides management actions by role.
- Navbar and dashboard show current user role.

## API Endpoints

### Auth

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `POST /api/auth/refresh/`

### Products

- `GET /api/products/`
- `POST /api/products/` (admin/manager)
- `GET /api/products/{id}/`
- `PUT/PATCH /api/products/{id}/` (admin/manager)
- `DELETE /api/products/{id}/` (admin/manager)

### Orders

- `GET /api/orders/` (customer sees own orders; admin/manager sees all)
- `POST /api/orders/`
- `GET /api/orders/{id}/`
- `PATCH /api/orders/{id}/`
- `DELETE /api/orders/{id}/`

### Categories

- `GET /api/categories/`
- `POST /api/categories/` (admin/manager)
- `GET /api/categories/{id}/`
- `PUT /api/categories/{id}/` (admin/manager)
- `DELETE /api/categories/{id}/` (admin/manager)

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

## Demo Accounts (example)

- admin: full permissions
- manager: content management permissions
- customer: read + order creation only

Use Django admin to adjust roles if needed.
