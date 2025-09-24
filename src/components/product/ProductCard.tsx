import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Loader, LogIn, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

// Define types
export interface Vendor {
  id: number;
  name: string;
  business_name?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured?: boolean;
  category: Category;
  vendor: Vendor;
  created_at: string;
  images: string[];
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default' 
}) => {
  const { addItem, items, requiresAuth, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  
  // State management
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [imageLoadTime, setImageLoadTime] = useState(0);

  // Check if product is already in cart
  const cartItem = items.find(item => item.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  // Handle product card click
  const handleCardClick = () => {
    console.log('🖱️ Clicked product:', product.id, product.name);
    navigate(`/products/${product.id}`, { 
      state: { product }
    });
  };

  // Handle add to cart with proper error handling
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUnavailable) return;
    
    console.log('🛒 Adding to cart:', product.id);
    setIsAddingToCart(true);
    setLocalError(null);

    try {
      await addItem(product);
      setShowAdded(true);
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setShowAdded(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      if (error.response?.status === 401) {
        setLocalError('Please login to add items to cart');
      } else {
        setLocalError(error.response?.data?.message || 'Failed to add to cart. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/login', { state: { returnUrl: window.location.pathname } });
  };

  // Handle quick view
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('👀 Quick view:', product.id);
    // You can implement a modal or quick view feature here
    navigate(`/products/${product.id}`, { 
      state: { product, quickView: true }
    });
  };

  // Optimized image URL handling
  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '/placeholder-product.jpg';

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }

    // Handle different image path formats
    const filename = imagePath.split(/[\\/]/).pop() || imagePath;
    
    // Check if it's already a full URL
    if (filename.includes('localhost') || filename.includes('http')) {
      return filename;
    }
    
    return `http://localhost:5000/uploads/products/${filename}`;
  };

  // Preload and handle images
  useEffect(() => {
    const url = getImageUrl(product.images?.[0]);
    setCurrentImageUrl(url);
    setImageLoaded(false);
    setImageError(false);

    const startTime = performance.now();
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      setImageLoadTime(loadTime);
      setImageLoaded(true);
      setImageError(false);
      
      if (loadTime > 1000) {
        console.warn('⚠️ Slow image load detected:', {
          url,
          loadTime: `${loadTime.toFixed(2)}ms`,
          productId: product.id
        });
      }
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [product.images, product.id]);

  // Image error handler
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Check availability
  const isUnavailable = !product.is_active || product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  // Format price in GMD
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GM', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate discount percentage (example - you can modify based on your data)
  const hasDiscount = product.price > 1000; // Example condition
  const originalPrice = hasDiscount ? product.price * 1.2 : product.price; // Example calculation

  // Compact variant styling
  if (variant === 'compact') {
    return (
      <div
        className="group bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-emerald-100 cursor-pointer"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="flex items-center space-x-3 p-3">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
              onError={handleImageError}
            />
            {isInCart && (
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartQuantity}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {product.name}
            </h3>
            <p className="text-emerald-600 font-semibold text-sm">
              GMD {formatPrice(product.price)}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {product.vendor.business_name || product.vendor.name}
            </p>
          </div>

          {/* Action */}
          <Button
            size="sm"
            onClick={requiresAuth ? handleLoginRedirect : handleAddToCart}
            disabled={isUnavailable || isAddingToCart || cartLoading}
            className="flex-shrink-0"
          >
            {requiresAuth ? (
              <LogIn className="w-3 h-3" />
            ) : isAddingToCart ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : showAdded ? (
              <Check className="w-3 h-3" />
            ) : (
              <ShoppingCart className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`group bg-white rounded-xl shadow-md transition-all duration-300 transform ${
        isUnavailable ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${product.name} - GMD ${formatPrice(product.price)}`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-50">
        {/* Loading indicator */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center rounded-t-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-2"></div>
              <span className="text-gray-500 text-xs">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-xl">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📷</span>
              </div>
              <span className="text-gray-600 text-sm block">Image not available</span>
            </div>
          </div>
        )}
        
        {/* Product image */}
        <img
          src={currentImageUrl}
          alt={product.name}
          className={`w-full h-48 object-cover transition-all duration-500 ${
            imageLoaded && !imageError
              ? 'opacity-100 group-hover:scale-110' 
              : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
        />
        
        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handleQuickView}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
              title="Quick view"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              🔥 Sale
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              ⚡ Low Stock
            </span>
          )}
        </div>

        {/* Cart Badge */}
        {isInCart && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            In Cart ({cartQuantity})
          </div>
        )}
        
        {/* Out of stock overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center rounded-t-xl">
            <span className="text-white font-semibold text-sm bg-gray-800 bg-opacity-80 px-3 py-2 rounded-lg">
              {product.stock === 0 ? 'Out of Stock' : 'Unavailable'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Vendor and Rating */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500 truncate max-w-[60%]" title={product.vendor.business_name || product.vendor.name}>
            {product.vendor.business_name || product.vendor.name}
          </p>
          <div className="flex items-center space-x-1">
            {product.rating !== undefined && (
              <>
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.floor(product.rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {product.rating?.toFixed(1)}
                </span>
                {product.reviews !== undefined && (
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200 leading-tight">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-emerald-600">
                GMD {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  GMD {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <p className={`text-xs font-medium ${
              isUnavailable ? 'text-red-500' : 
              isLowStock ? 'text-orange-500' : 
              'text-gray-500'
            }`}>
              {isUnavailable ? 'Out of stock' : `${product.stock} available`}
            </p>
          </div>

          {/* Add to Cart Button */}
          <div className="relative">
            {requiresAuth ? (
              <Button
                size="sm"
                onClick={handleLoginRedirect}
                disabled={isUnavailable}
                className="bg-blue-500 hover:bg-blue-600 opacity-100 transform scale-105 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isUnavailable || isAddingToCart || cartLoading}
                className={`transition-all duration-200 min-w-[100px] shadow-lg ${
                  isUnavailable 
                    ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                    : showAdded 
                      ? 'bg-green-500 hover:bg-green-600 opacity-100'
                      : isInCart
                        ? 'bg-blue-500 hover:bg-blue-600 opacity-100'
                        : 'bg-emerald-500 hover:bg-emerald-600 opacity-100 lg:opacity-90 lg:group-hover:opacity-100 transform lg:group-hover:scale-105'
                }`}
              >
                {isAddingToCart ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : showAdded ? (
                  <Check className="w-4 h-4" />
                ) : isInCart ? (
                  <ShoppingCart className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span className="ml-1 font-medium">
                  {isAddingToCart ? 'Adding...' : 
                   showAdded ? 'Added!' : 
                   isInCart ? `+ 1` : 'Add'}
                </span>
              </Button>
              
            )}
          </div>
        </div>

        {/* Error message */}
        {localError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {localError}
          </div>
        )}

        {/* Performance indicator (dev only) */}
        {/* {process.env.NODE_ENV === 'development' && imageLoadTime > 0 && (
          <div className="mt-1 text-xs text-gray-400">
            Image loaded in {imageLoadTime.toFixed(0)}ms
          </div>
        )} */}
      </div>
    </div>
  );
};