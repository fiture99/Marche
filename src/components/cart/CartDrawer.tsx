// components/cart/CartDrawer.tsx
import React from 'react';
import { X, Plus, Minus, ShoppingBag, RefreshCw, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    total, 
    loading,
    error,
    requiresAuth 
  } = useCart();

  const { isAuthenticated, user } = useAuth();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = '/login?returnUrl=/checkout';
      return;
    }
    toggleCart();
    // Navigate to checkout will be handled by the Link component
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleCart} />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 border-b">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                  {user && (
                    <p className="text-sm text-gray-500">{user.first_name}'s Cart</p>
                  )}
                </div>
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />}
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authentication Warning */}
            {requiresAuth && (
              <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-700 text-sm">
                    Please log in to save your cart and checkout
                  </p>
                </div>
                <Link 
                  to="/login" 
                  onClick={toggleCart}
                  className="block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Sign in now →
                </Link>
              </div>
            )}

            {/* Error Message */}
            {error && !requiresAuth && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-center text-gray-400">Add some items to get started!</p>
                  {requiresAuth && (
                    <Link 
                      to="/shop" 
                      onClick={toggleCart}
                      className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Continue Shopping
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.product.images[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">{item.product.vendor?.name}</p>
                        <p className="font-semibold text-emerald-600">
                          GMD {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          GMD {item.product.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-4 py-6 border-t bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    GMD {total.toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {isAuthenticated ? (
                    <Link to="/checkout" onClick={toggleCart}>
                      <Button className="w-full" size="lg" disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Checkout'}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loading ? 'Processing...' : 'Login to Checkout'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                      }
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
                
                {!isAuthenticated && (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Your cart will be saved when you log in
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};