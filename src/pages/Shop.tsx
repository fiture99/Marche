import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { productsAPI} from '../services/api';

interface Vendor {
  id: number;
  name: string;
  business_name: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: Category;
  vendor: Vendor;
  created_at: string;
  images: string[];
  rating?: number;
}

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12); // Initial number of products to show

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productsResponse = await productsAPI.getAllProducts();
        // console.log("API products response:", productsResponse);

        // Normalize API response
        let productsData: Product[] = [];
        if (Array.isArray(productsResponse)) {
          productsData = productsResponse;
        } else if (productsResponse.products && Array.isArray(productsResponse.products)) {
          productsData = productsResponse.products;
        } else {
          console.warn("Unexpected products API shape:", productsResponse);
        }

        setProducts(productsData);

        // Extract unique categories
        const uniqueCategories: Category[] = [];
        const categoryMap = new Map();
        productsData.forEach((product: Product) => {
          if (product.category && !categoryMap.has(product.category.id)) {
            categoryMap.set(product.category.id, true);
            uniqueCategories.push(product.category);
          }
        });
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    // console.log("🔍 Filtering products...");
    // console.log("📋 Total products:", products.length);
    
    let filtered = products.filter((product) => {
      const matchesSearch =
        (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor?.business_name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || product.category?.name === selectedCategory;

      const matchesPrice =
        typeof product.price === "number"
          ? product.price >= priceRange[0] && product.price <= priceRange[1]
          : true;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // console.log("✅ Products after filtering:", filtered.length);

    // Apply sorting based on sortBy state
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || "").getTime() || 0;
          const dateB = new Date(b.created_at || "").getTime() || 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, priceRange, sortBy, products]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  // Products to display (limited by visibleCount)
  const productsToShow = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Check if there are more products to load
  const hasMoreProducts = visibleCount < filteredProducts.length;

  // Load more products
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 12); // Load 12 more products
  };

  // Format price function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GM').format(price);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-lg text-gray-600">
            Discover amazing products from local vendors
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div
            className={`mt-6 border-t pt-6 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: GMD {formatPrice(priceRange[0])} - GMD {formatPrice(priceRange[1])}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>GMD 0</span>
                  <span>GMD {formatPrice(2000000)}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                      !selectedCategory
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        selectedCategory === cat.name
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {productsToShow.length} of {filteredProducts.length} products
            {filteredProducts.length > productsToShow.length && (
              <span className="text-emerald-600 font-medium">
                {' '}({filteredProducts.length - productsToShow.length} more available)
              </span>
            )}
          </p>
        </div>

        {/* Product Grid */}
        {productsToShow.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsToShow.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="px-8 py-3 text-lg"
                >
                  Load More Products 
                  <span className="ml-2 text-emerald-600">
                    ({filteredProducts.length - visibleCount} remaining)
                  </span>
                </Button>
                <p className="text-gray-500 text-sm mt-2">
                  Showing {productsToShow.length} of {filteredProducts.length} products
                </p>
              </div>
            )}

            {/* All products loaded message */}
            {!hasMoreProducts && filteredProducts.length > 12 && (
              <div className="text-center mt-8">
                <p className="text-gray-500 italic">
                  🎉 All {filteredProducts.length} products loaded
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange([0, 2000000]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};