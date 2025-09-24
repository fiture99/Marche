import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart, Share, Truck, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { productsAPI } from '../../services/api';
import { Product } from './ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // If we already have product data from navigation state, skip fetching
    if (location.state?.product) {
      console.log('✅ Using product data from navigation state');
      return;
    }

    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('🔄 Fetching product with ID:', id);
        
        const response = await productsAPI.getProduct(id);
        console.log('✅ API response received:', response);
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        // Handle different response structures
        let productData;
        
        if (response.data.product) {
          productData = response.data.product;
        } else if (response.data.data) {
          productData = response.data.data;
        } else {
          productData = response.data;
        }
        
        if (!productData || Object.keys(productData).length === 0) {
          throw new Error('Product data is empty');
        }
        
        console.log('📊 Product data loaded successfully:', productData);
        setProduct(productData);
        
      } catch (err: any) {
        console.error('❌ Error fetching product:', err);
        
        if (err.response?.status === 404) {
          setError('Product not found on server');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response?.data?.message || 'Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, location.state]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Handle Windows paths and different formats
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    // If it already contains the base URL but with wrong formatting
    if (cleanPath.includes('localhost:5000')) {
      const urlParts = cleanPath.split('localhost:5000');
      return `http://localhost:5000${urlParts[1]}`;
    }
    
    // Extract filename and construct URL
    const filename = cleanPath.split('/').pop() || cleanPath;
    return `http://localhost:5000/uploads/products/${filename}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GM', {
      style: 'currency',
      currency: 'GMD',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
              <li>Check if the product exists in the database</li>
              <li>The product may be temporarily unavailable</li>
              <li>The vendor account may be under review</li>
            </ul>
          </div>
          
          <Button onClick={() => navigate('/shop')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  // Safe access to nested properties
  const vendorName = product.vendor?.business_name || product.vendor?.name || 'Unknown Vendor';
  const categoryName = product.category?.name || 'Uncategorized';
  const categoryIcon = product.category?.icon || '📦';
  const productImages = product.images || [];
  const productRating = product.rating || 0;
  const productReviews = product.reviews || 0;

  const isUnavailable = !product.is_active || product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={getImageUrl(productImages[selectedImage])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('placeholder.png')) {
                      e.currentTarget.src = '/placeholder.png';
                    }
                  }}
                />
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 ${
                        selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (!e.currentTarget.src.includes('placeholder.png')) {
                            e.currentTarget.src = '/placeholder.png';
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < productRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {productRating} ({productReviews} reviews)
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Sold by: {vendorName}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
                {product.stock > 0 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{categoryIcon}</span>
                  <span className="text-gray-600">{categoryName}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isUnavailable && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-500">
                      Max: {product.stock} available
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isUnavailable}
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Share className="w-5 h-5" />
                </Button>
              </div>

              {/* Out of Stock Message */}
              {isUnavailable && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">
                    {product.stock === 0 ? 'Out of Stock' : 'Currently Unavailable'}
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    This product is not available for purchase at the moment.
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Truck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Free Shipping</p>
                    <p className="text-sm text-gray-500">On orders over GMD 500</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-sm text-gray-500">100% secure payment</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Quality Guarantee</p>
                    <p className="text-sm text-gray-500">Quality checked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Product ID</dt>
                  <dd className="text-gray-900">{product.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category</dt>
                  <dd className="text-gray-900">{categoryName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Vendor</dt>
                  <dd className="text-gray-900">{vendorName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status</dt>
                  <dd className="text-gray-900 capitalize">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Added On</dt>
                  <dd className="text-gray-900">
                    {new Date(product.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Business:</strong> {vendorName}
                </p>
                <p className="text-gray-600">
                  <strong>Contact:</strong> {product.vendor?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;