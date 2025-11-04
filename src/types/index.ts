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

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}



export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}