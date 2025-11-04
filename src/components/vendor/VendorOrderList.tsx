// components/vendor/VendorOrderList.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  MapPinIcon,
  ShoppingBagIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Use your existing Order interface
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

interface VendorOrderListProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
}

const VendorOrderList: React.FC<VendorOrderListProps> = ({ 
  orders, 
  loading = false, 
  onRefresh 
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusConfig = (status: string) => {
    const config = {
      pending: {
        icon: <ClockIcon className="w-5 h-5 text-yellow-600" />,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending',
        bgColor: 'bg-yellow-50'
      },
      processing: {
        icon: <ClockIcon className="w-5 h-5 text-blue-600" />,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Processing',
        bgColor: 'bg-blue-50'
      },
      shipped: {
        icon: <TruckIcon className="w-5 h-5 text-purple-600" />,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'Shipped',
        bgColor: 'bg-purple-50'
      },
      delivered: {
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Delivered',
        bgColor: 'bg-green-50'
      },
      cancelled: {
        icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelled',
        bgColor: 'bg-red-50'
      },
      completed: {
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Completed',
        bgColor: 'bg-green-50'
      }
    };
    
    return config[status as keyof typeof config] || config.pending;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 border-b border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">
          Orders will appear here when customers purchase your products.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Orders
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Orders</h3>
            <p className="text-gray-600">
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(orders.map(order => order.status))).map((status) => {
                const config = getStatusConfig(status);
                const count = orders.filter(order => order.status === status).length;
                return (
                  <span
                    key={status}
                    className={`px-2 py-1 text-xs rounded-full border ${config.color}`}
                  >
                    {config.label} ({count})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                      {statusConfig.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Order #{order.order_number || `ORD-${order.id.toString().slice(-6)}`}
                        </h4>
                        <span 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-gray-500">Customer</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Placed on</p>
                          <p className="font-medium">{formatDate(order.created_at)}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Items</p>
                          <p className="font-medium">{order.items_count} products</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Total Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item, itemIndex) => (
                              <span
                                key={itemIndex}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                              >
                                {item.product_name} × {item.quantity}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="ml-4 flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Order Details"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Simple Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedOrder(null)} />
            
            <div className="relative inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.order_number || `ORD-${selectedOrder.id.toString().slice(-6)}`}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer</h3>
                  <p className="text-gray-900">{selectedOrder.customer_name}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Status</h3>
                  <span className={`px-3 py-2 text-sm font-medium rounded-full ${getStatusConfig(selectedOrder.status).color}`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Amount</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedOrder.total_amount)}
                  </p>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrderList;