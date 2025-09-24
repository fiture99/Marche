// src/pages/AdminProductsList.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from "../../services/api";

interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  product_count?: number;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  business_name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: Category;
  vendor: Vendor;
  created_at: string;
  description?: string;
  images: string[];
}

const AdminProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    console.log("🔄 Component mounted, fetching products...");
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Making API call...");
      const response = await adminAPI.getAllProducts();
      console.log("📦 Full API Response:", response);
      
      // Enhanced debugging for API response
      if (!response) {
        console.error("❌ API returned null or undefined response");
        throw new Error("No response from API");
      }
      
      console.log("🔍 Response keys:", Object.keys(response));
      console.log("📊 Response.products exists:", response.products !== undefined);
      console.log("📊 Response.products is array:", Array.isArray(response.products));
      
      // More robust data extraction
      const productsData = response?.products || [];
      
      console.log("✅ Extracted products data:", productsData);
      console.log("🔢 Products array length:", productsData.length);
      
      if (productsData.length > 0) {
        console.log("🆔 First product ID:", productsData[0].id);
        console.log("📝 First product name:", productsData[0].name);
        console.log("🔍 First product structure:", productsData[0]);
      } else {
        console.warn("⚠️ No products found in response");
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      console.log("✅ State updated successfully");
      
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      console.log("🏁 Loading set to false");
    }
  };

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("📊 Products state updated:", products.length, "products");
    console.log("📊 Filtered products updated:", filteredProducts.length, "products");
  }, [products, filteredProducts]);

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((product) => product.category.name))
  );

  // Get unique vendors for filter
  const vendors = Array.from(
    new Set(products.map((product) => product.vendor.business_name || product.vendor.name))
  );

  // Apply filters and search
  useEffect(() => {
    console.log("🔍 Applying filters...");
    let result = products;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((product) =>
        statusFilter === "active" ? product.is_active : !product.is_active
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (product) => product.category.name === categoryFilter
      );
    }

    // Apply vendor filter
    if (vendorFilter !== "all") {
      result = result.filter(
        (product) => (product.vendor.business_name || product.vendor.name) === vendorFilter
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "stock") {
        return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock;
      } else if (sortBy === "vendor") {
        const vendorA = a.vendor.business_name || a.vendor.name;
        const vendorB = b.vendor.business_name || b.vendor.name;
        return sortOrder === "asc"
          ? vendorA.localeCompare(vendorB)
          : vendorB.localeCompare(vendorA);
      } else if (sortBy === "id") {
        return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
      }
      return 0;
    });

    console.log("✅ Filtered results:", result.length, "products");
    setFilteredProducts(result);
  }, [products, searchTerm, statusFilter, categoryFilter, vendorFilter, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setVendorFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  const toggleProductStatus = async (product: Product) => {
    // If deactivating, show SweetAlert confirmation
    if (product.is_active) {
      const result = await Swal.fire({
        title: 'Deactivate Product?',
        text: `Are you sure you want to deactivate "${product.name}"? This product will no longer be visible to customers.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, deactivate it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });
      
      if (!result.isConfirmed) {
        return; // User cancelled the operation
      }
    }

    try {
      await adminAPI.updateProductStatus(product.id, !product.is_active);
      toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id 
            ? { ...p, is_active: !product.is_active }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to update product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Format price in GMD with thousand separators
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GM', {
      style: 'currency',
      currency: 'GMD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Fix image path by replacing backslashes with forward slashes
  const fixImagePath = (path: string) => {
    if (!path) return '';
    return path.replace(/\\/g, "/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-600">Manage all products in the system</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <button
              onClick={fetchProducts}
              className="flex items-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium text-yellow-800">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <p className="text-sm text-yellow-700">
                <strong>Products in state:</strong> {products.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-yellow-700">
                <strong>Filtered products:</strong> {filteredProducts.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-yellow-700">
                <strong>First product ID:</strong> {products[0]?.id ? `#${products[0].id.toString().padStart(4, '0')}` : 'No ID'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search products or vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setSortBy(sortBy);
                  setSortOrder(sortOrder as "asc" | "desc");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="id-asc">ID (Low to High)</option>
                <option value="id-desc">ID (High to Low)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
                <option value="vendor-asc">Vendor (A-Z)</option>
                <option value="vendor-desc">Vendor (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {products.length === 0
                ? "No products available in the system."
                : "Try adjusting your search or filter criteria."}
            </p>
            {(searchTerm || statusFilter !== "all" || categoryFilter !== "all" || vendorFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Product ID
                        {sortBy === 'id' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => {
                    console.log(`📋 Rendering product ${index}:`, product.id, product.name);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono border-r border-gray-200">
                          {product.id ? `#${product.id.toString().padStart(4, '0')}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={fixImagePath(product.images[0])}
                                  alt={product.name}
                                  className="h-12 w-12 object-cover rounded-md"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                  <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                {product.description || "No description available"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.vendor.business_name || product.vendor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">
                              {product.category?.icon}
                            </span>
                            <span className="text-sm text-gray-900">
                              {product.category?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleProductStatus(product)}
                              className={product.is_active ? "text-yellow-600 hover:text-yellow-900 p-1" : "text-green-600 hover:text-green-900 p-1"}
                              title={product.is_active ? "Deactivate product" : "Activate product"}
                            >
                              {product.is_active ? (
                                <EyeSlashIcon className="w-4 h-4" />
                              ) : (
                                <EyeIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsList;