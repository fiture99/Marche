// pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Copy, ShoppingBag, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ordersAPI } from '../services/api';


interface PaymentDetails {
  referenceNumber: string;
  amount: number;
  expiresAt: string;
  paymentOptions: {
    wave: {
      number: string;
      accountName: string;
    };
    trustBank: {
      accountNumber: string;
      accountName: string;
      branch?: string;
    };
  };
}

export const Checkout: React.FC = () => {
  const { items, total, clearCart, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wave' | 'trustBank'>('wave');
  

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
      console.log('🔍 useEffect triggered:', { 
        isAuthenticated, 
        itemsLength: items.length, 
        orderCreated 
      });
      
      if (!isAuthenticated) {
        console.log('🚫 Not authenticated, redirecting to login');
        navigate('/Marche/login');
        return;
      }
      
      if (items.length === 0 && !orderCreated) {
        console.log('🛒 Cart empty with no order, redirecting to shop');
        navigate('/Marche/shop');
        return;
      }
      
      console.log('✅ Conditions met, staying on checkout page');
    }, [isAuthenticated, items.length, navigate, orderCreated]);

  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MARCHE-${timestamp}-${random}`;
  };

  const createOrder = async () => {
  if (!user) return;

  setLoading(true);
  try {
    // Generate payment details
    const referenceNumber = generateReferenceNumber();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // ✅ FIX: Map frontend payment methods to backend enum values
    const paymentMethodMap = {
      'wave': 'wave',      // Map 'wave' to 'qcell_money'
      'trustBank': 'trustBank' // Map 'trustBank' to 'africell_money'
    };

    const backendPaymentMethod = paymentMethodMap[selectedPaymentMethod];

    const paymentDetails: PaymentDetails = {
      referenceNumber: referenceNumber,
      amount: total,
      expiresAt: expiresAt.toISOString(),
      paymentOptions: {
        wave: {
          number: '+220 123 4567',
          accountName: 'Marché Business'
        },
        trustBank: {
          accountNumber: '11212212201',
          accountName: 'Marché Enterprises',
          branch: 'Banjul Main Branch'
        }
      }
    };

    // ✅ FIX: Use the mapped payment method
    const orderData = {
      items: items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      })),
      payment_method: backendPaymentMethod, // Use the mapped value
      payment_reference: referenceNumber,
      total_amount: total,
      status: 'pending_payment',
      notes: `Payment reference: ${referenceNumber}`,
      shipping_address: {
        street: user.address?.street || 'Not specified',
        city: user.address?.city || 'Banjul',
        country: user.address?.country || 'Gambia',
        zip_code: user.address?.zip_code || '0000',
        phone: user.phone || 'Not specified'
      }
    };

    console.log('📦 Sending order data:', orderData);
    console.log('🔍 Payment method mapping:', {
      frontend: selectedPaymentMethod,
      backend: backendPaymentMethod
    });

    const response = await ordersAPI.createOrder(orderData);
    console.log('✅ Order created:', response);

    setPaymentDetails(paymentDetails);
    setOrderCreated(true);
    clearCart();

  } catch (error) {
    console.error('❌ Error creating order:', error);
    alert('Failed to create order. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const formatExpiry = (expiresAt: string) => {
    return new Date(expiresAt).toLocaleString('en-GM', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Your cart is empty. Redirecting to shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout & Payment</h1>
          <p className="text-gray-600 mt-2">Complete your purchase with bank transfer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Order Summary ({itemCount} items)
            </h2>
            
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-500">{item.product.vendor?.name}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    GMD {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-emerald-600">GMD {total.toLocaleString()}</span>
              </div>
            </div>

            {!orderCreated && (
              <div className="mt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedPaymentMethod('wave')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        selectedPaymentMethod === 'wave'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium">Wave Mobile Money</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('trustBank')}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        selectedPaymentMethod === 'trustBank'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium">Trust Bank Transfer</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={createOrder}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Creating Order...' : 'Generate Payment Details'}
                </Button>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {!orderCreated ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Instructions
                </h3>
                <p className="text-gray-600">
                  Select payment method and click "Generate Payment Details" to get your unique reference number
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Instructions
                  </h2>
                  <p className="text-gray-600">
                    Transfer the exact amount using the details below
                  </p>
                </div>

                {/* Reference Number - Most Important */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-900 mb-3 flex items-center">
                    🔑 YOUR REFERENCE NUMBER
                  </h3>
                  <DetailItem
                    label="Reference Number"
                    value={paymentDetails!.referenceNumber}
                    onCopy={() => copyToClipboard(paymentDetails!.referenceNumber, 'reference')}
                    copied={copiedField === 'reference'}
                    important
                  />
                  <p className="text-sm text-red-700 mt-2">
                    ⚠️ You MUST include this reference in your transfer description
                  </p>
                </div>

                {/* Payment Amount */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-3">
                    💰 Amount to Pay
                  </h3>
                  <DetailItem
                    label="Total Amount"
                    value={`GMD ${paymentDetails!.amount.toLocaleString()}`}
                    onCopy={() => copyToClipboard(paymentDetails!.amount.toString(), 'amount')}
                    copied={copiedField === 'amount'}
                    important
                  />
                </div>

                {/* Payment Method Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    {selectedPaymentMethod === 'wave' ? '📱 Wave Payment Details' : '🏦 Trust Bank Details'}
                  </h3>
                  
                  {selectedPaymentMethod === 'wave' ? (
                    <>
                      <DetailItem
                        label="Wave Number"
                        value={paymentDetails!.paymentOptions.wave.number}
                        onCopy={() => copyToClipboard(paymentDetails!.paymentOptions.wave.number, 'waveNumber')}
                        copied={copiedField === 'waveNumber'}
                      />
                      <DetailItem
                        label="Account Name"
                        value={paymentDetails!.paymentOptions.wave.accountName}
                        onCopy={() => copyToClipboard(paymentDetails!.paymentOptions.wave.accountName, 'waveName')}
                        copied={copiedField === 'waveName'}
                      />
                    </>
                  ) : (
                    <>
                      <DetailItem
                        label="Account Number"
                        value={paymentDetails!.paymentOptions.trustBank.accountNumber}
                        onCopy={() => copyToClipboard(paymentDetails!.paymentOptions.trustBank.accountNumber, 'accountNumber')}
                        copied={copiedField === 'accountNumber'}
                      />
                      <DetailItem
                        label="Account Name"
                        value={paymentDetails!.paymentOptions.trustBank.accountName}
                        onCopy={() => copyToClipboard(paymentDetails!.paymentOptions.trustBank.accountName, 'accountName')}
                        copied={copiedField === 'accountName'}
                      />
                      <DetailItem
                        label="Branch"
                        value={paymentDetails!.paymentOptions.trustBank.branch || 'Main Branch'}
                        onCopy={() => copyToClipboard(paymentDetails!.paymentOptions.trustBank.branch || 'Main Branch', 'branch')}
                        copied={copiedField === 'branch'}
                      />
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">📋 How to Pay:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                    <li>
                      <strong>Go to your {selectedPaymentMethod === 'wave' ? 'Wave app' : 'bank app'}</strong>
                    </li>
                    <li>
                      <strong>Send money to the {selectedPaymentMethod === 'wave' ? 'Wave number' : 'account number'} above</strong>
                    </li>
                    <li>
                      <strong className="text-red-600">INCLUDE THE REFERENCE NUMBER in the transfer description</strong>
                    </li>
                    <li>Send the <strong>exact amount</strong> shown above</li>
                    <li>Keep your transaction receipt</li>
                  </ol>
                </div>

                {/* Important Notes */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">⚠️ Important Notes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                    <li>Payment expires on: <strong>{formatExpiry(paymentDetails!.expiresAt)}</strong></li>
                    <li>Order will be processed after payment confirmation</li>
                    <li>Without the reference number, we cannot match your payment</li>
                    <li>Contact support if you have any issues</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => navigate('/shop')}
                    variant="outline"
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="flex-1"
                  >
                    Print Instructions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for payment details
interface DetailItemProps {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  important?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, onCopy, copied, important }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      <span className={`font-medium ${important ? 'text-red-600' : 'text-gray-700'}`}>
        {label}:
      </span>
      <span className={`ml-2 font-mono ${important ? 'font-bold text-red-600 text-lg' : 'font-semibold'}`}>
        {value}
      </span>
    </div>
    <button
      onClick={onCopy}
      className="p-2 hover:bg-gray-100 rounded transition-colors ml-2"
      title="Copy to clipboard"
    >
      <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-400'}`} />
    </button>
  </div>
);