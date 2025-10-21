import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Heart, Share, Truck, Shield, CheckCircle, AlertCircle, ChevronRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { productsAPI } from '../services/api';
import { Product } from '../components/product/ProductCard';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (location.state?.product) {
      return;
    }

    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productsAPI.getProduct(id);
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

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
        
        setProduct(productData);
        
      } catch (err: any) {
        console.error('Error fetching product:', err);
        
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
    if (imagePath.startsWith('https') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    let cleanPath = imagePath.replace(/\\/g, '/');
    
    if (cleanPath.includes('marche-yzzm.onrender.com')) {
      const urlParts = cleanPath.split('marche-yzzm.onrender.com');
      return `'https://marche-yzzm.onrender.com${urlParts[1]}`;
    }
    
    const filename = cleanPath.split('/').pop() || cleanPath;
    return `'https://marche-yzzm.onrender.com/uploads/products/${filename}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          
          <Button onClick={() => navigate('/Marche/shop')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const vendorName = product.vendor?.business_name || product.vendor?.name || 'Unknown Vendor';
  const categoryName = product.category?.name || 'Uncategorized';
  const productImages = product.images || [];
  const productRating = product.rating || 0;
  const productReviews = product.reviews || 0;
  const isUnavailable = !product.is_active || product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/Marche/')} className="hover:text-emerald-600 transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate('/Marche/shop')} className="hover:text-emerald-600 transition-colors">Shop</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate(`/Marche/categories/${product.category?.id}`)} className="hover:text-emerald-600 transition-colors">
            {categoryName}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
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
                      className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-emerald-500' 
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.png';
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
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {categoryName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isLiked 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-1.5 rounded-full bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <div className="flex space-x-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(productRating) 
                              ? 'text-yellow-400 fill-current' 
                              : productRating > i 
                                ? 'text-yellow-400 fill-current opacity-50' 
                                : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {productRating.toFixed(1)} ({productReviews} reviews)
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Sold by: <span className="font-medium text-emerald-600">{vendorName}</span>
                  </span>
                </div>
              </div>

              {/* Price and Stock */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                {product.stock > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {product.stock > 10 ? 'In Stock' : `${product.stock} left`}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              {!isUnavailable && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Quantity</h3>
                  <div className="flex items-center space-x-3">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">
                      Max: {product.stock} available
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isUnavailable}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed py-2"
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Add to Cart
                </Button>
              </div>

              {/* Out of Stock Message */}
              {isUnavailable && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-medium text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Currently Unavailable'}
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    This product is not available for purchase at the moment.
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">Over GMD 500</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Quality Checked</p>
                    <p className="text-xs text-gray-500">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h3>
                <dl className="space-y-2 text-sm">
                  {[
                    { label: 'Product Name', value: product.name },
                    { label: 'Category', value: categoryName },
                    { label: 'Vendor', value: vendorName },
                    { label: 'Status', value: product.is_active ? 'Active' : 'Inactive' },
                    { label: 'Added On', value: new Date(product.created_at).toLocaleDateString() }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                      <dt className="text-gray-600">{item.label}</dt>
                      <dd className="text-gray-900 font-medium">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Information</h3>
                <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-800 font-bold text-sm">
                        {vendorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{vendorName}</p>
                      <p className="text-xs text-gray-500">Verified Seller</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    {product.vendor?.address && (
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        {product.vendor.address}
                      </p>
                    )}
                    {product.vendor?.phone && (
                      <p className="text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1.5" />
                        {product.vendor.phone}
                      </p>
                    )}
                    {product.vendor?.email && (
                      <p className="text-gray-600 flex items-center">
                        <Mail className="w-3 h-3 mr-1.5" />
                        {product.vendor.email}
                      </p>
                    )}
                    <p className="text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1.5" />
                      Member since: {new Date(product.vendor?.created_at || product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;