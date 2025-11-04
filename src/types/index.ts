// types/index.ts
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  
  // Computed properties for backward compatibility
  firstName?: string;
  lastName?: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalProducts: number;
  totalSales: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendorId: string;
  vendor: Vendor;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// Base Order interface for customer orders
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    phone: string;
  };
  createdAt: string;
}

// Vendor-specific order interface
export interface VendorOrder {
  id: string;
  vendor_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  customer_name: string;
  customer_email: string;
  items_count: number;
  order_number?: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  items: VendorOrderItem[];
  shipping_address: {
    full_name: string;
    street: string;
    city: string;
    region: string;
    phone: string;
    country?: string;
    postal_code?: string;
  };
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
}

export interface VendorOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant?: {
    size?: string;
    color?: string;
    weight?: string;
  };
}

export interface VendorOrdersResponse {
  orders: VendorOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// Add this to your types/index.ts
export interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueChange?: number;
  orderChange?: number;
}