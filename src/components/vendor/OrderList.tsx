import React from 'react';
import { ClockIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  items_count: number;
  shipping_address?: {
    city: string;
    country: string;
  };
}

interface OrderListProps {
  orders: Order[];
}

 export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <TruckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500">Orders will appear here when customers purchase your products.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div>
                  <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p>{order.customer_name} • {order.items_count} items</p>
              {order.shipping_address && (
                <p>{order.shipping_address.city}, {order.shipping_address.country}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;