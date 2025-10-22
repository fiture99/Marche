import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
// import logo from '../../images/logo.png'; // PNG version


export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            {/* <div className="flex items-center space-x-2 font-bold text-2xl mb-4">
              <span className="text-3xl">🏪</span>
              <span>Marché</span>
            </div> */}
            <div className="relative">
              {/* Image Logo */}
              <img 
                src={logo} 
                alt="Marché - Your Local Market"
                className="w-20 h-18 object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // You can add a fallback element here if needed
                }}
              />
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <p className="text-gray-300 mb-6">
              The Gambia's premier multi-vendor marketplace. Connect with local businesses and discover amazing products.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/Marche/shop" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/Marche/vendors" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Vendors
                </Link>
              </li>
              <li>
                <Link to="/Marche/about" className="text-gray-300 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/Marche/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/Marche/register" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/Marche/login" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Vendor Login
                </Link>
              </li>
              <li>
                <Link to="/vendor/support" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Vendor Support
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">Banjul, The Gambia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">+220 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-300">info@marche.gm</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Payment Methods</h4>
              <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                <span className="bg-gray-800 px-2 py-1 rounded">Wave Money</span>
                <span className="bg-gray-800 px-2 py-1 rounded">Bank Account Transfer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Nyakoi Services. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};