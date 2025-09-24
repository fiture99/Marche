import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, Package, Store, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setSearchQuery('');
    setShowSearchInput(false);
    setShowUserMenu(false);
    setIsMenuOpen(false);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchInput(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getUserInitials = () => {
    if (user?.first_name || user?.firstName) {
      return `${user.first_name?.[0] || user.firstName?.[0]}${user.last_name?.[0] || user.lastName?.[0] || ''}`;
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/Marche/" 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105">
                🏪
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                Marché
              </span>
              <div className="text-xs text-gray-500 -mt-1">Your Local Market</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Search - Shows input when clicked */}
            <div className="relative">
              {showSearchInput ? (
                <form 
                  onSubmit={handleSearchSubmit}
                  className="flex items-center space-x-2 bg-white border border-emerald-300 rounded-lg pl-3 pr-2 py-1 shadow-sm"
                >
                  <Search className="w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="outline-none text-sm w-48"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-3 text-gray-600 hover:text-emerald-600 transition-all duration-200 rounded-lg hover:bg-emerald-50 group"
                >
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
            
            <Link 
              to="/Marche/shop" 
              className="group relative px-4 py-2 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-sm font-medium rounded-lg hover:bg-emerald-50"
            >
              Products
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
            </Link>
            <Link 
              to="/Marche/vendors" 
              className="group relative px-4 py-2 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-sm font-medium rounded-lg hover:bg-emerald-50"
            >
              Shops
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
            </Link>
            
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-3 text-gray-600 hover:text-emerald-600 transition-all duration-200 rounded-lg hover:bg-emerald-50 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                {/* User Button */}
                <button
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-emerald-600 transition-all duration-200 rounded-lg hover:bg-emerald-50"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg transition-all duration-300 group-hover:scale-105">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-emerald-700">
                      {user.first_name || user.firstName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </button>
                          
                {/* Submenu (shows on hover) */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-2 z-50
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {user.first_name || user.firstName || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full capitalize font-medium">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                          
                  <div className="py-2">
                    <Link
                      to="/Marche/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      My Profile
                    </Link>
                    <Link
                      to="/Marche/orders"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-200"
                    >
                      <Package className="w-4 h-4 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      My Orders
                    </Link>
                    {user.role === 'vendor' && (
                      <Link
                        to="/Marche/vendor/dashboard"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-200"
                      >
                        <Store className="w-4 h-4 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/Marche/admin"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all duration-200"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link to="/Marche/login">
                  <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/Marche/register">
                  <Button size="sm" className="font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-4 pb-6 space-y-2">
              {/* Mobile Search */}
              <form 
                onSubmit={handleSearchSubmit}
                className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mx-2"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="outline-none text-sm bg-transparent flex-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              
              <Link
                to="/Marche/shop"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-100 transition-colors">
                  📦
                </div>
                Products
              </Link>
              
              <Link
                to="/Marche/vendors"
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-100 transition-colors">
                  🏪
                </div>
                Shops
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/Marche/profile"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    My Profile
                  </Link>
                  <Link
                    to="/Marche/orders"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    My Orders
                  </Link>
                  {user.role === 'vendor' && (
                    <Link
                      to="/Marche/vendor/dashboard"
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Store className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      Dashboard
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                    >
                      <LogOut className="w-5 h-5 mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-2 pt-4 border-t border-gray-100">
                  <Link to="/Marche/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full font-medium">Sign In</Button>
                  </Link>
                  <Link to="/Marche/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full font-medium bg-gradient-to-r from-emerald-500 to-emerald-600">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};