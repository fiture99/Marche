import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { vendorsAPI, ordersAPI } from '../services/api';
import ProductList from '../components/vendor/ProductList';
import VendorProfile from '../components/vendor/VendorProfile';
import ProductForm from '../components/vendor/ProductForm';
import VendorOrderList from '../components/vendor/VendorOrderList';

// Define VendorOrder interface to fix the type error
interface VendorOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  items_count: number;
  order_number?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  // Add vendor-specific fields
  vendor_id?: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  shipping_address?: {
    full_name: string;
    street: string;
    city: string;
    region: string;
    phone: string;
    country?: string;
    postal_code?: string;
  };
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  description?: string;
  logo?: string;
  banner?: string;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: any;
  created_at: string;
  images?: string[];
  description?: string;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  items_count: number;
  order_number?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueChange?: number;
  orderChange?: number;
}

interface VendorStatsProps {
  stats: Stats;
  loading?: boolean;
}

const VendorStats: React.FC<VendorStatsProps> = ({ stats, loading = false }) => {
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      change: null
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: ChartBarIcon,
      color: 'bg-green-500',
      change: null
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      change: stats.orderChange
    },
    {
      title: 'Total Revenue',
      value: `GMD ${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: stats.revenueChange
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-200"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            {stat.change !== null && (
              <div className={`flex items-center ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {stat.change !== undefined ? `${Math.abs(stat.change)}%` : 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Calculate stats
  const stats: Stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, order) => sum + order.total_amount, 0),
    revenueChange: 12.5, // You would calculate this from historical data
    orderChange: -3.2    // You would calculate this from historical data
  };

  // Load vendor data
  const loadVendorData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch vendor details
      const vendorResponse = await vendorsAPI.getMyVendor();
      const vendorData = vendorResponse.vendor || vendorResponse;
      setVendor(vendorData);
      
      // Check if vendor is approved before fetching products and orders
      if (vendorData.status !== 'approved') {
        toast.error('Your vendor account is not yet approved');
        setProducts([]);
        setOrders([]);
        return;
      }
      
      // Fetch products and orders in parallel
      const [productsResponse, ordersResponse] = await Promise.allSettled([
        vendorsAPI.getMyProducts().catch(error => {
          console.error('Failed to fetch products:', error);
          throw error;
        }),
        ordersAPI.getMyOrders().catch(error => {
          console.error('Failed to fetch orders:', error);
          throw error;
        }),
      ]);
      
      // Handle products response
      if (productsResponse.status === 'fulfilled') {
        const productsData = productsResponse.value.products || productsResponse.value;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        console.error('Failed to fetch products:', productsResponse.reason);
        toast.error('Failed to load products');
        setProducts([]);
      }
      
      // Handle orders response
      if (ordersResponse.status === 'fulfilled') {
        const ordersData = ordersResponse.value.orders || ordersResponse.value;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        console.error('Failed to fetch orders:', ordersResponse.reason);
        toast.error('Failed to load orders');
        setOrders([]);
      }
      
    } catch (error: any) {
      console.error('Failed to load vendor data:', error);
      if (error.response?.status === 404) {
        toast.error('Vendor profile not found. Please complete your vendor application.');
      } else {
        toast.error(error.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleRefresh = async () => {
    await loadVendorData();
    toast.success('Data refreshed successfully');
  };

  const handleProductCreated = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadVendorData();
    toast.success('Product operation completed successfully');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Refresh data when switching to certain tabs
    if (tabId === 'orders' || tabId === 'products') {
      loadVendorData();
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'products', name: 'Products', icon: ShoppingBagIcon },
    { id: 'orders', name: 'Orders', icon: CurrencyDollarIcon },
    { id: 'profile', name: 'Profile', icon: UserGroupIcon },
  ];

  // Access control
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Vendor dashboard is only accessible to vendors.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {vendor?.name || 'Vendor'}! Manage your products and orders here.
            </p>
            {vendor?.status !== 'approved' && (
              <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Your vendor account is <span className="font-medium capitalize">{vendor?.status}</span>. 
                  {vendor?.status === 'pending' && ' You will gain full access once approved.'}
                  {vendor?.status === 'suspended' && ' Please contact support for more information.'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-x-auto">
          <nav className="flex space-x-8 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VendorStats stats={stats} loading={refreshing} />
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                  <p className="text-gray-600 mb-4">Manage your product catalog</p>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={vendor?.status !== 'approved'}
                  >
                    View Products
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders</h3>
                  <p className="text-gray-600 mb-4">View and manage orders</p>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={vendor?.status !== 'approved'}
                  >
                    View Orders
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                  <p className="text-gray-600 mb-4">Update your vendor information</p>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {vendor?.status !== 'approved' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <ShoppingBagIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Vendor Account Not Approved</h3>
                  <p className="text-yellow-700">
                    You need to have an approved vendor account to manage products.
                  </p>
                </div>
              ) : (
                <ProductList 
                  products={products} 
                  onEdit={handleEditProduct}
                  onRefresh={loadVendorData}
                  loading={refreshing}
                />
              )}
            </motion.div>
          )}

          {/* Fixed orders section - removed comment and fixed type */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customer Orders</h2>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {vendor?.status !== 'approved' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <CurrencyDollarIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Vendor Account Not Approved</h3>
                  <p className="text-yellow-700">
                    You need to have an approved vendor account to view orders.
                  </p>
                </div>
              ) : (
                <VendorOrderList 
                  orders={orders} 
                  loading={refreshing}
                  onRefresh={loadVendorData}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Profile</h2>
              <VendorProfile 
                vendor={vendor} 
                onUpdate={loadVendorData}
                loading={refreshing}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleProductCreated}
        />
      )}
    </div>
  );
};

export default VendorDashboard;