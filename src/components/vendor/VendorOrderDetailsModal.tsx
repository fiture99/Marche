// components/vendor/VendorOrderDetailsModal.tsx
import React from 'react';
import { 
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CreditCardIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { VendorOrder } from '../../types';

interface VendorOrderDetailsModalProps {
  order: VendorOrder;
  isOpen: boolean;
  onClose: () => void;
}

const VendorOrderDetailsModal: React.FC<VendorOrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number || `ORD-${order.id.slice(-6)}`}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {formatDate(order.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2" />
                Order Items
              </h3>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                          {item.variant && Object.keys(item.variant).length > 0 && (
                            <p className="text-sm text-gray-600">
                              {Object.values(item.variant).filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.total_price)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unit_price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="space-y-2">
                  <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getPaymentStatusColor(order.payment_status)}`}>
                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{order.customer.full_name}</p>
                  <p className="text-gray-600">{order.customer.email}</p>
                  {order.customer.phone && (
                    <p className="text-gray-600">📞 {order.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{order.shipping_address.full_name}</p>
                  <p className="text-gray-600">{order.shipping_address.street}</p>
                  <p className="text-gray-600">
                    {order.shipping_address.city}, {order.shipping_address.region}
                  </p>
                  {order.shipping_address.country && (
                    <p className="text-gray-600">{order.shipping_address.country}</p>
                  )}
                  {order.shipping_address.postal_code && (
                    <p className="text-gray-600">{order.shipping_address.postal_code}</p>
                  )}
                  <p className="text-gray-600 mt-2">📞 {order.shipping_address.phone}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 capitalize">
                    {order.payment_method ? order.payment_method.replace(/_/g, ' ') : 'Credit Card'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetailsModal;