export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: { access: string; refresh: string };
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  product_count: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: number | null;
  category_name: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  status_display: string;
  total_price: number;
  notes: string;
  items: OrderItem[];
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}
