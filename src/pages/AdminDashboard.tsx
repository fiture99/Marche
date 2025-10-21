// src/pages/AdminDashboard.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import AdminStats from '../components/admin/AdminStats';
import VendorApplicationModal from '../components/admin/VendorApplicationModal';

interface VendorApplication {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}
interface Order {
  id: number;
  order_number: string;
  payment_method: string;
  status: string;
  total_amount: number;
  items: any[];
  created_at: string;
  customerName?: string;
  vendorName?: string;
  user_id?: number;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  business_name?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: Category;
  vendor: Vendor;
  created_at: string;
  description?: string;
  images: string[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  // Product filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  
  // User filters
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  
  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Editing states
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newUserStatus, setNewUserStatus] = useState(false);

  // Order status options
  const orderStatusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ];

  // Memoized stats calculation
  const stats = useMemo(() => ({
    totalVendors: applications.filter(app => app.status === 'approved').length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    monthlyGrowth: {
      vendors: 12,
      orders: 8,
      revenue: 15,
      products: 6,
    },
  }), [applications, products, orders]);

  // Improved data fetching with error handling
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setUsersLoading(true);
    try {
      // console.log('🚀 Starting dashboard data fetch...');
      
      const results = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.getUsers(),
        adminAPI.getVendors({ status: 'pending' }),
        adminAPI.getProducts({ include_inactive: true })
      ]);

      const [dashboardResult, usersResult, vendorsResult, productsResult] = results;

      const dashboardData = dashboardResult.status === 'fulfilled' ? 
        dashboardResult.value : { stats: {}, recent_orders: [] };
      
      const usersData = usersResult.status === 'fulfilled' ? 
        usersResult.value : { users: [] };
      
      const vendorsData = vendorsResult.status === 'fulfilled' ? 
        vendorsResult.value : { vendors: [] };
      
      const productsData = productsResult.status === 'fulfilled' ? 
        productsResult.value : { products: [] };

      console.log('📊 Dashboard data loaded successfully');
      
      setApplications(vendorsData.vendors || vendorsData || []);
      setOrders(dashboardData.recent_orders || []);
      setProducts(productsData.products || productsData || []);
      setFilteredProducts(productsData.products || productsData || []);
      setUsers(usersData.users || usersData || []);
      
    } catch (error) {
      console.error('💥 Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter(order => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Real-time updates for vendors tab
  useEffect(() => {
    if (activeTab === 'vendors') {
      const interval = setInterval(() => {
        adminAPI.getVendors({ status: 'pending' })
          .then(data => setApplications(data.vendors || []))
          .catch(console.error);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Get unique categories and vendors for filters
  const categories = useMemo(() => 
    Array.from(new Set(products.map((product) => product.category.name))), 
    [products]
  );

  const vendors = useMemo(() => 
    Array.from(new Set(products.map((product) => product.vendor.business_name || product.vendor.name))), 
    [products]
  );

  // Apply filters and search for products
  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.id.toString().toLowerCase().includes(searchTerm.toLowerCase())||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((product) =>
        statusFilter === "active" ? product.is_active : !product.is_active
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (product) => product.category.name === categoryFilter
      );
    }

    if (vendorFilter !== "all") {
      result = result.filter(
        (product) => (product.vendor.business_name || product.vendor.name) === vendorFilter
      );
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, statusFilter, categoryFilter, vendorFilter]);

  // Filter users
  const filteredUsers = useMemo(() => 
    users.filter(user => {
      const matchesSearch = user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                             user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
      
      const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || 
                            (userStatusFilter === 'active' && user.is_active) ||
                            (userStatusFilter === 'inactive' && !user.is_active);
      
      return matchesSearch && matchesRole && matchesStatus;
    }), 
    [users, userSearchTerm, userRoleFilter, userStatusFilter]
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
      <div className="text-sm text-gray-700">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} results
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Update Order Status Function
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const result = await Swal.fire({
        title: 'Update Order Status?',
        text: `Are you sure you want to change this order's status to "${newStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus} successfully`);

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      setEditingOrderId(null);
      setNewOrderStatus('');

    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Update User Status Function
  const updateUserStatus = async (userId: number, newStatus: boolean) => {
    try {
      const action = newStatus ? 'activate' : 'deactivate';
      const result = await Swal.fire({
        title: `${newStatus ? 'Activate' : 'Deactivate'} User?`,
        text: `Are you sure you want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus ? '#22c55e' : '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`User ${action}d successfully`);

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active: newStatus }
            : user
        )
      );

      setEditingUserId(null);
      setNewUserStatus(false);

    } catch (error: any) {
      console.error('Failed to update user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Start editing order status
  const startEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setNewOrderStatus(order.status);
  };

  // Start editing user status
  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setNewUserStatus(user.is_active);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingOrderId(null);
    setEditingUserId(null);
    setNewOrderStatus('');
    setNewUserStatus(false);
  };

  // Data export functionality
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${data.length} records successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Improved image URL handler
  const getImageUrl = useCallback((imagePath: string | undefined): string => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    const cleanPath = imagePath.replace(/^[\\/]+/, '');
    if (process.env.NODE_ENV === 'development') {
      return `'https://marche-yzzm.onrender.com/uploads/products/${cleanPath}`;
    }
    return `/uploads/products/${cleanPath}`;
  }, []);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await adminAPI.getProducts({ include_inactive: true });
      const productsData = data.products || data;
      setProducts(productsData);
      setFilteredProducts(productsData);
      toast.success('Products refreshed successfully');
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await adminAPI.getUsers();
      const usersData = data.users || data;
      setUsers(usersData);
      toast.success('Users refreshed successfully');
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getDashboard();
      setOrders(data.recent_orders || []);
      toast.success('Orders refreshed successfully');
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    if (product.is_active) {
      const result = await Swal.fire({
        title: 'Deactivate Product?',
        text: `Are you sure you want to deactivate "${product.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, deactivate it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });
      if (!result.isConfirmed) return;
    }

    try {
      await adminAPI.toggleProductActive(product.id);
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, is_active: !product.is_active }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to update product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleApplicationAction = async (id: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      let response;
      if (action === 'approve') {
        response = await adminAPI.approveVendor(id);
      } else {
        response = await adminAPI.rejectVendor(id, reason || 'Application rejected by admin');
      }

      toast.success(response.message || `Vendor ${action}d successfully`);
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === id 
            ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
            : app
        )
      );

      setTimeout(async () => {
        try {
          const updatedVendors = await adminAPI.getVendors({ status: 'pending' });
          setApplications(updatedVendors.vendors || []);
        } catch (error) {
          console.error('Failed to refresh vendor list:', error);
        }
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Failed to update application:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update application';
      toast.error(errorMessage);
    }
  };

  const handleViewApplication = (application: VendorApplication) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GM', {
      style: 'currency',
      currency: 'GMD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const clearProductFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setVendorFilter("all");
  };

  const clearUserFilters = () => {
    setUserSearchTerm("");
    setUserRoleFilter("all");
    setUserStatusFilter("all");
  };

  const clearOrderFilters = () => {
    setOrderStatusFilter("all");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'vendors', name: 'Vendor Applications', icon: BuildingStorefrontIcon },
    { id: 'products', name: 'Product Management', icon: ShoppingBagIcon },
    { id: 'orders', name: 'Order Monitoring', icon: CurrencyDollarIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
  ];

  // Loading skeletons
  const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 mb-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2 flex lg:flex-col overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-max flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-auto">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <AdminStats stats={stats} />
            </motion.div>
          )}

          {activeTab === 'vendors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Vendor Applications</h2>
                <button
                  onClick={() => {
                    setLoading(true);
                    adminAPI.getVendors({ status: 'pending' })
                      .then(data => setApplications(data.vendors || []))
                      .catch(error => console.error(error))
                      .finally(() => setLoading(false));
                  }}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading vendor applications...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.length === 0 && !loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No pending vendor applications</p>
                            <p className="text-sm">All applications have been processed or no new applications available.</p>
                          </td>
                        </tr>
                      ) : (
                        applications.map(app => (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{app.name}</td>
                            <td className="px-6 py-4">{app.email}</td>
                            <td className="px-6 py-4">{app.phone}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              {app.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApplicationAction(app.id, 'approve')}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Enter reason for rejection:');
                                      if (reason !== null) {
                                        handleApplicationAction(app.id, 'reject', reason);
                                      }
                                    }}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500 capitalize">{app.status}</span>
                              )}
                              <button 
                                onClick={() => handleViewApplication(app)} 
                                className="text-blue-600 hover:text-blue-900 ml-2"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <button
                  onClick={loadProducts}
                  disabled={productsLoading}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              {/* Filters for Products */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search products or vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor
                    </label>
                    <select
                      value={vendorFilter}
                      onChange={(e) => setVendorFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Vendors</option>
                      {vendors.map((vendor) => (
                        <option key={vendor} value={vendor}>
                          {vendor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={clearProductFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {productsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                              <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No products found</p>
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                #{product.id.toString().padStart(4, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {product.images && product.images.length > 0 ? (
                                      <img
                                        src={getImageUrl(product.images[0])} // <-- pick the first image
                                        alt={product.name}
                                        className="h-10 w-10 object-cover rounded-md mr-3"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}

                                  <div>
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">
                                      {product.description || 'No description'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.vendor.business_name || product.vendor.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatPrice(product.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.stock > 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : product.stock > 0 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock} in stock
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">
                                    {product.category?.icon}
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {product.category?.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => toggleProductStatus(product)}
                                    className={product.is_active 
                                      ? "text-yellow-600 hover:text-yellow-900 p-1" 
                                      : "text-green-600 hover:text-green-900 p-1"
                                    }
                                    title={product.is_active ? 'Deactivate product' : 'Activate product'}
                                  >
                                    {product.is_active ? (
                                      <EyeSlashIcon className="w-4 h-4" />
                                    ) : (
                                      <EyeIcon className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Monitoring</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToCSV(orders, 'orders')}
                    disabled={orders.length === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={loadOrders}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Order Filters */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Order Filters</h3>
                  </div>
                  <button
                    onClick={clearOrderFilters}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    Clear Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status
                    </label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      {orderStatusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-8">
                    <TableSkeleton rows={5} columns={6} />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th> {/* NEW COLUMN */}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th> {/* NEW COLUMN */}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                              <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No orders found.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{order.order_number}</td>

                              {/* Products Column */}
                              <td className="px-6 py-4">
                                <div className="space-y-2 max-w-xs">
                                  {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                      <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-3 flex-1">


                                          {/* Product Details */}
                                          <div className="flex-1 min-w-0">

                                            <div className="text-xs text-gray-500">
                                              ID: #{item.product_id} 
                                            </div>
                                          </div>
                                        </div>


                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">No products</span>
                                  )}


                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-2 max-w-xs">
                                  {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                      <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-3 flex-1">


                                          {/* Product Details */}
                                          <div className="flex-1 min-w-0">

                                            <div className="text-xs text-gray-500">
                                              Qty: {item.quantity}
                                            </div>
                                          </div>
                                        </div>


                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">No products</span>
                                  )}


                                </div>
                              </td>
                                
                              <td className="px-6 py-4 font-semibold text-gray-900">
                                {formatPrice(order.total_amount)}
                              </td>
                              <td className="px-6 py-4">
                                {editingOrderId === order.id ? (
                                  <select
                                    value={newOrderStatus}
                                    onChange={(e) => setNewOrderStatus(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    {orderStatusOptions.map(status => (
                                      <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 capitalize">{order.payment_method}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                {editingOrderId === order.id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => updateOrderStatus(order.id, newOrderStatus)}
                                      className="p-1 text-green-600 hover:text-green-900"
                                      title="Save"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="p-1 text-red-600 hover:text-red-900"
                                      title="Cancel"
                                    >
                                      <XCircleIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditOrder(order)}
                                    className="p-1 text-blue-600 hover:text-blue-900"
                                    title="Edit Status"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToCSV(users, 'users')}
                    disabled={users.length === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={loadUsers}
                    disabled={usersLoading}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* User Filters */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">User Filters</h3>
                  </div>
                  <button
                    onClick={clearUserFilters}
                    className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    Clear Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">User</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {usersLoading ? (
                  <div className="p-8">
                    <TableSkeleton rows={5} columns={5} />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No users found matching the filters.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                              <td className="px-6 py-4 text-gray-500">{u.email}</td>
                              <td className="px-6 py-4 capitalize">{u.role}</td>
                              <td className="px-6 py-4">
                                {editingUserId === u.id ? (
                                  <select
                                    value={newUserStatus ? "true" : "false"}
                                    onChange={(e) => setNewUserStatus(e.target.value === "true")}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                ) : (
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {u.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingUserId === u.id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => updateUserStatus(u.id, newUserStatus)}
                                      className="p-1 text-green-600 hover:text-green-900"
                                      title="Save"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="p-1 text-red-600 hover:text-red-900"
                                      title="Cancel"
                                    >
                                      <XCircleIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditUser(u)}
                                    className="p-1 text-blue-600 hover:text-blue-900"
                                    title="Edit Status"
                                    disabled={u.role === 'admin' && user?.id !== u.id}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Vendor Application Modal */}
          {selectedApplication && (
            <VendorApplicationModal
              application={selectedApplication}
              onClose={() => setShowApplicationModal(false)}
              onApprove={() => handleApplicationAction(selectedApplication.id, 'approve')}
              onReject={(reason) => handleApplicationAction(selectedApplication.id, 'reject', reason)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;