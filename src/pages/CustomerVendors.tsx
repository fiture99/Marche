import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Package, Clock, CheckCircle, Users } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { vendorsAPI } from '../services/api';

interface Vendor {
  id: number;
  name: string;
  description?: string;
  banner?: string;
  logo?: string;
  status: 'approved' | 'pending' | 'suspended';
  rating?: number;
  total_sales?: number;
  address?: string;
  total_products?: number;
  product_count?: number;
  items_count?: number;
  created_at: string;
}

export const CustomerVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vendorsAPI.getVendors();
      // console.log('Vendors API Response:', response); // Debug log

      // Handle different response structures
      let vendorsData: Vendor[] = [];

      if (response && typeof response === 'object') {
        if (response.data) {
          // Case 1: Response has data property
          vendorsData = response.data.vendors || response.data.rows || response.data.items || response.data || [];
        } else if (response.vendors) {
          // Case 2: Direct response with vendors array
          vendorsData = response.vendors;
        } else if (Array.isArray(response)) {
          // Case 3: Response is directly an array
          vendorsData = response;
        } else {
          // Case 4: Try to extract vendors from root object
          vendorsData = response.rows || response.items || [];
        }
      }

      // Map vendors to ensure consistent property names
      const formattedVendors = vendorsData.map(vendor => ({
        ...vendor,
        // Handle different property names for product count
        total_products: vendor.total_products || vendor.product_count || vendor.items_count || vendor.total_products || 0
      }));

      setVendors(formattedVendors);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setError('Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-500', text: 'Verified', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-500', text: 'Pending', icon: Clock };
      default:
        return { color: 'bg-red-500', text: 'Suspended', icon: Clock };
    }
  };

  const getProductCount = (vendor: Vendor) => {
    // Try multiple possible property names
    return vendor.total_products || vendor.product_count || vendor.items_count || vendor.total_products || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchVendors}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Users className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Vendors</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing local businesses across The Gambia
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search vendors by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Vendors Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        </div>

        {/* Vendors Grid */}
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor) => {
              const statusBadge = getStatusBadge(vendor.status);
              const StatusIcon = statusBadge.icon;
              const productCount = getProductCount(vendor);

              return (
                <Link
                  key={vendor.id}
                  to={`/vendors/${vendor.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                    {vendor.banner ? (
                      <img
                        src={getImageUrl(vendor.banner)}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center space-x-1 ${statusBadge.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.text}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {/* Vendor Logo */}
                      <div className="relative">
                        {vendor.logo ? (
                          <img
                            src={getImageUrl(vendor.logo)}
                            alt={vendor.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg -mt-8 bg-white"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/64x64?text=LOGO';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg -mt-8 bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 mt-2">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {vendor.rating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({vendor.total_sales || 0} sales)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {vendor.description || 'No description available.'}
                    </p>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-gray-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{vendor.address || 'Location not specified'}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">
                          {productCount} {productCount === 1 ? 'product' : 'products'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Member since</p>
                        <p className="text-sm font-medium text-gray-700">
                          {vendor.created_at
                            ? new Date(vendor.created_at).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : 'N/A'}

                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-lg border">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No vendors found' : 'No vendors available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Check back later for new vendors'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};