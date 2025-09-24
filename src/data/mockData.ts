import { Product, Vendor, Category } from '../types';

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Banjul Electronics',
    description: 'Premium electronics and gadgets for modern living',
    logo: 'https://images.pexels.com/photos/163084/phone-mobile-smartphone-colorful-163084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    banner: 'https://images.pexels.com/photos/163084/phone-mobile-smartphone-colorful-163084.jpeg?auto=compress&cs=tinysrgb&w=800&h=300',
    owner: 'Fatou Ceesay',
    email: 'fatou@banjulelectronics.gm',
    phone: '+220 123 4567',
    address: 'Independence Drive, Banjul',
    status: 'approved',
    rating: 4.8,
    totalProducts: 45,
    totalSales: 250,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Serrekunda Fashion Hub',
    description: 'Traditional and modern African fashion',
    logo: 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    banner: 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=800&h=300',
    owner: 'Amadou Jallow',
    email: 'amadou@fashionhub.gm',
    phone: '+220 234 5678',
    address: 'Westfield Junction, Serrekunda',
    status: 'approved',
    rating: 4.6,
    totalProducts: 67,
    totalSales: 180,
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Kombos Fresh Market',
    description: 'Fresh local produce and organic foods',
    logo: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=100&h=100',
    banner: 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=800&h=300',
    owner: 'Awa Sanneh',
    email: 'awa@kombosfresh.gm',
    phone: '+220 345 6789',
    address: 'Sukuta Market, Western Region',
    status: 'approved',
    rating: 4.9,
    totalProducts: 32,
    totalSales: 320,
    createdAt: '2024-01-20'
  }
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', icon: '📱', count: 45 },
  { id: '2', name: 'Fashion', icon: '👕', count: 67 },
  { id: '3', name: 'Food & Beverages', icon: '🍎', count: 32 },
  { id: '4', name: 'Home & Garden', icon: '🏠', count: 23 },
  { id: '5', name: 'Beauty & Health', icon: '💄', count: 18 },
  { id: '6', name: 'Sports', icon: '⚽', count: 15 }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'Latest Apple iPhone with advanced camera system and A17 chip',
    price: 1299,
    images: [
      'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/163084/phone-mobile-smartphone-colorful-163084.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Electronics',
    vendorId: '1',
    vendor: mockVendors[0],
    stock: 15,
    rating: 4.8,
    reviews: 24,
    featured: true,
    createdAt: '2024-03-01'
  },
  {
    id: '2',
    name: 'Traditional Gambian Kaftan',
    description: 'Handwoven traditional Gambian kaftan with intricate embroidery',
    price: 85,
    images: [
      'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Fashion',
    vendorId: '2',
    vendor: mockVendors[1],
    stock: 8,
    rating: 4.9,
    reviews: 15,
    featured: true,
    createdAt: '2024-02-28'
  },
  {
    id: '3',
    name: 'Fresh Organic Mangoes',
    description: 'Sweet and juicy organic mangoes from local farms',
    price: 12,
    images: [
      'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=500',
      'https://images.pexels.com/photos/1093838/pexels-photo-1093838.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Food & Beverages',
    vendorId: '3',
    vendor: mockVendors[2],
    stock: 50,
    rating: 4.7,
    reviews: 32,
    featured: false,
    createdAt: '2024-03-05'
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and advanced photography',
    price: 1199,
    images: [
      'https://images.pexels.com/photos/163084/phone-mobile-smartphone-colorful-163084.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Electronics',
    vendorId: '1',
    vendor: mockVendors[0],
    stock: 12,
    rating: 4.6,
    reviews: 18,
    featured: true,
    createdAt: '2024-02-25'
  },
  {
    id: '5',
    name: 'Adidas Football Jersey',
    description: 'Official Gambia national team football jersey',
    price: 45,
    images: [
      'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Fashion',
    vendorId: '2',
    vendor: mockVendors[1],
    stock: 25,
    rating: 4.5,
    reviews: 12,
    featured: false,
    createdAt: '2024-03-02'
  },
  {
    id: '6',
    name: 'Local Honey Jar',
    description: 'Pure natural honey from local beekeepers',
    price: 18,
    images: [
      'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=500'
    ],
    category: 'Food & Beverages',
    vendorId: '3',
    vendor: mockVendors[2],
    stock: 30,
    rating: 4.8,
    reviews: 28,
    featured: false,
    createdAt: '2024-02-20'
  }
];