// src/pages/CustomerOrder.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import type { Order, OrdersResponse } from '../types';

// Custom hook to debounce a value
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Reusable component for the status badge
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (s: string): string => {
    switch (s) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Reusable component for the status icon
const OrderStatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Clock className="text-yellow-500" size={20} />;
    case 'confirmed':
      return <CheckCircle className="text-blue-500" size={20} />;
    case 'processing':
      return <Package className="text-orange-500" size={20} />;
    case 'shipped':
      return <Truck className="text-purple-500" size={20} />;
    case 'delivered':
      return <CheckCircle className="text-green-500" size={20} />;
    case 'cancelled':
      return <CheckCircle className="text-red-500" size={20} />;
    default:
      return <Clock className="text-gray-500" size={20} />;
  }
};

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Error component
const ErrorMessage: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
      <div className="text-red-500 text-2xl mb-4">Error</div>
      <div className="text-gray-600 mb-4">{error}</div>
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const CustomerOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Add this function to handle image URL formatting
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend your API base URL
    if (imagePath.startsWith('/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // For other cases, you might need to adjust this logic
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ordersAPI.getMyOrders({
        page: currentPage,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearchTerm || undefined,
        sort_by: 'created_at:desc',
      });

    //   console.log('API Response:', response); // Debug log

      // Handle the API response structure correctly
      // The response is directly the data object, not wrapped in response.data
      if (response && response.orders) {
        // The orders are in response.orders, and pagination in response.pagination
        setOrders(response.orders || []);
        setTotalPages(response.pagination?.pages || 1);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array (fallback)
        setOrders(response);
        setTotalPages(1);
      } else {
        // Fallback for unexpected response structure
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err); // Debug log
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      // The order is directly in the response, not in response.data
      setSelectedOrder(response || response.data);
    } catch (err) {
      setError('Failed to fetch order details');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersAPI.cancelOrder(orderId);
        await fetchOrders();
        setSelectedOrder(null);
      } catch (err) {
        setError('Failed to cancel order');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIndex = (status: string): number => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(status);
  };

  // Only filter by search term client-side if API doesn't support search
  // Remove this if your API supports search filtering
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    order.items.some(item => 
      item.product_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && orders.length === 0) {
    return <ErrorMessage error={error} onRetry={fetchOrders} />;
  }

  if (selectedOrder) {
    return (
      <OrderDetailsView
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onCancelOrder={handleCancelOrder}
        formatDate={formatDate}
        getStatusIndex={getStatusIndex}
        getImageUrl={getImageUrl}
      />
    );
  }

  return (
    <OrdersListView
      orders={filteredOrders}
      loading={loading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      onOrderSelect={fetchOrderDetails}
      formatDate={formatDate}
      getImageUrl={getImageUrl}
    />
  );
};

// Order Details View Component
const OrderDetailsView: React.FC<{
  order: Order;
  onBack: () => void;
  onCancelOrder: (orderId: string) => void;
  formatDate: (date: string) => string;
  getStatusIndex: (status: string) => number;
  getImageUrl: (imagePath: string) => string;
}> = ({ order, onBack, onCancelOrder, formatDate, getStatusIndex, getImageUrl }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <OrderStatusBadge status={order.status} />
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <Download size={16} className="mr-1" />
              Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsSection order={order} getImageUrl={getImageUrl} />
          <ShippingAddressSection order={order} />
        </div>
        
        <OrderTimelineSection 
          order={order} 
          onCancelOrder={onCancelOrder}
          getStatusIndex={getStatusIndex}
        />
      </div>
    </div>
  </div>
);

// Sub-components for better organization
const OrderItemsSection: React.FC<{ order: Order; getImageUrl: (imagePath: string) => string }> = ({ order, getImageUrl }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
    <div className="space-y-4">
      {order.items.map((item) => (
        <div key={item.id} className="flex items-center space-x-4 py-4 border-b">
          {item.product_image ? (
            <img
              src={getImageUrl(item.product_image)}
              alt={item.product_name}
              className="w-20 h-20 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
              }}
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{item.product_name}</h3>
            <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
            <p className="text-gray-600 text-sm">${item.unit_price} each</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${(item.unit_price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 pt-6 border-t">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${order.total_amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">${order.shipping_amount?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${order.tax_amount?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold mt-2">
          <span>Total</span>
          <span>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
);

const ShippingAddressSection: React.FC<{ order: Order }> = ({ order }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
    <div className="text-gray-600">
      <p>{order.shipping_address.name}</p>
      <p>{order.shipping_address.street}</p>
      <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
      <p>{order.shipping_address.country}</p>
      <p className="mt-2">{order.shipping_address.phone}</p>
    </div>
  </div>
);

const OrderTimelineSection: React.FC<{
  order: Order;
  onCancelOrder: (orderId: string) => void;
  getStatusIndex: (status: string) => number;
}> = ({ order, onCancelOrder, getStatusIndex }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
    <div className="space-y-4">
      {[
        { status: 'pending', label: 'Order Placed', description: 'Your order has been received' },
        { status: 'confirmed', label: 'Order Confirmed', description: 'Payment confirmed and processing' },
        { status: 'processing', label: 'Processing', description: 'Preparing your order for shipment' },
        { status: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
        { status: 'delivered', label: 'Delivered', description: 'Order delivered successfully' }
      ].map((step, index) => (
        <div key={step.status} className="flex items-start space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            getStatusIndex(order.status) >= index ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {getStatusIndex(order.status) >= index && (
              <CheckCircle size={14} className="text-white" />
            )}
          </div>
          <div>
            <p className={`font-medium ${
              getStatusIndex(order.status) >= index ? 'text-green-700' : 'text-gray-500'
            }`}>
              {step.label}
            </p>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>

    {order.status === 'pending' && (
      <button
        onClick={() => onCancelOrder(order.id)}
        className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Cancel Order
      </button>
    )}
  </div>
);

// Orders List View Component
const OrdersListView: React.FC<{
  orders: Order[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderSelect: (orderId: string) => void;
  formatDate: (date: string) => string;
  getImageUrl: (imagePath: string) => string;
}> = ({
  orders, loading, searchTerm, onSearchChange, statusFilter, onStatusFilterChange,
  currentPage, totalPages, onPageChange, onOrderSelect, formatDate, getImageUrl
}) => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">View and manage your orders</p>
      </div>

      <SearchAndFilterSection
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      {loading && <div className="text-center py-8">Loading orders...</div>}

      <OrdersList
        orders={orders}
        onOrderSelect={onOrderSelect}
        formatDate={formatDate}
        getImageUrl={getImageUrl}
      />

      <PaginationSection
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  </div>
);

// More sub-components...
const SearchAndFilterSection: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
}> = ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search orders or products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Filter size={20} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  </div>
);

const OrdersList: React.FC<{
  orders: Order[];
  onOrderSelect: (orderId: string) => void;
  formatDate: (date: string) => string;
  getImageUrl: (imagePath: string) => string;
}> = ({ orders, onOrderSelect, formatDate, getImageUrl }) => {
//   console.log('Orders in list:', orders); // Debug log
  
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <EmptyOrdersState />
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOrderSelect={onOrderSelect}
            formatDate={formatDate}
            getImageUrl={getImageUrl}
          />
        ))
      )}
    </div>
  );
};

const EmptyOrdersState: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
    <Package size={64} className="mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
    <p className="text-gray-600">
      You haven't placed any orders yet.
    </p>
  </div>
);

const OrderCard: React.FC<{
  order: Order;
  onOrderSelect: (orderId: string) => void;
  formatDate: (date: string) => string;
  getImageUrl: (imagePath: string) => string;
}> = ({ order, onOrderSelect, formatDate, getImageUrl }) => (
  <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <OrderStatusIcon status={order.status} />
          <div>
            <h3 className="font-semibold text-gray-900">
              Order #{order.order_number}
            </h3>
            <p className="text-gray-600 text-sm">
              {formatDate(order.created_at)} • {order.items.length} items
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${order.total_amount.toFixed(2)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
          {/* <button
            onClick={() => onOrderSelect(order.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button> */}
        </div>
      </div>
      <OrderItemsPreview items={order.items} getImageUrl={getImageUrl} />
    </div>
  </div>
);

const OrderItemsPreview: React.FC<{ items: Order['items']; getImageUrl: (imagePath: string) => string }> = ({ items, getImageUrl }) => (
  <div className="mt-4 flex space-x-2 overflow-x-auto">
    {items.slice(0, 4).map((item, index) => (
      item.product_image ? (
        <img
          key={index}
          src={getImageUrl(item.product_image)}
          alt={item.product_name}
          className="w-15 h-15 object-cover rounded border"
          title={item.product_name}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/60x60?text=No+Img';
          }}
        />
      ) : (
        <div key={index} className="w-15 h-15 bg-gray-100 rounded border flex items-center justify-center">
          <ShoppingBag className="h-6 w-6 text-gray-400" />
        </div>
      )
    ))}
    {items.length > 4 && (
      <div className="w-15 h-15 bg-gray-100 rounded border flex items-center justify-center">
        <span className="text-gray-600 text-sm">+{items.length - 4}</span>
      </div>
    )}
  </div>
);

const PaginationSection: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
  totalPages > 1 && (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
);

export default CustomerOrder;