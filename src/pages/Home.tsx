// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Shield, Truck, Clock } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { vendorsAPI, productsAPI, categoriesAPI } from '../services/api';
import background from '../images/background.jpg';

interface Vendor {
  id: number;
  name: string;
  banner?: string;
  logo?: string;
  address?: string;
  description?: string;
  totalProducts?: number;
  rating?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  featured?: boolean;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  icon?: React.ReactNode;
  count?: number;
}

export const Home: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch vendors
      const venRes = await vendorsAPI.getVendors({ page: 1 });
      const vendorData = Array.isArray(venRes) ? venRes : venRes?.data ?? venRes?.vendors ?? [];
      setVendors(vendorData);

      // Fetch recent products (limit to 8 most recent)
      const prodRes = await productsAPI.getProducts({ page: 1, limit: 1000 }); // fetch enough to calculate counts
      const productData = Array.isArray(prodRes) ? prodRes : prodRes?.data ?? prodRes?.products ?? [];

      // Sort by date
      const sortedProducts = productData.sort((a: Product, b: Product) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setRecentProducts(sortedProducts.slice(0, 8));

      // Fetch categories
      const catRes = await categoriesAPI.getCategories();
      const categoryData = Array.isArray(catRes) ? catRes : catRes?.data ?? catRes?.categories ?? [];

      // 🔹 Compute product count per category
      const categoriesWithCount = categoryData.map((cat: any) => {
        const count = productData.filter((p: any) => p.category?.id === cat.id).length;
        return { ...cat, count };
      });

      setCategories(categoriesWithCount);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-r from-emerald-600/90 to-blue-600/90 text-white"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-yellow-300">Marché</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The Gambia's Premier Multi-Vendor Marketplace
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Discover amazing products from local vendors, support your community,
            and enjoy seamless shopping with mobile money integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" variant="outline" className=" text-emerald-600 hover:bg-gray-100">
                Start Shopping
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-emerald-600"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Marché?</h2>
            <p className="text-lg text-gray-600">Built for The Gambian market with local payment methods</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-gray-600">Browse thousands of products from trusted local vendors</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Vendors</h3>
              <p className="text-gray-600">Support local businesses and discover unique products</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Pay with QCell Money, Africell Money, or international cards</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick delivery across The Gambia and neighboring regions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-emerald-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <p className="text-lg text-gray-600">Discover our latest products from local vendors</p>
          </div>
          
          {recentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/shop">
                  <Button size="lg" variant="outline">
                    View All Products
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recent products available. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Browse products by category</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  {/* <ShoppingBag className="w-6 h-6 text-emerald-600" /> */}
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-center text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.count || 0} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Vendors</h2>
            <p className="text-lg text-gray-600">Trusted local businesses serving The Gambia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {vendors.slice(0, 3).map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendors/${vendor.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {vendor.banner && (
                  <img
                    src={vendor.banner}
                    alt={vendor.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    {vendor.logo && (
                      <img
                        src={vendor.logo}
                        alt={vendor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-xs text-gray-500">{vendor.address}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vendor.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {vendor.totalProducts ?? 0} products
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-xs font-medium">{vendor.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/vendors">
              <Button size="lg" variant="outline">View All Vendors</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start shopping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who shop with Marché
          </p>
          <Link to="/shop">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              Shop Now
            </Button>
          </Link>
        </div>
      </section> */}
    </div>
  );
};

export default Home;