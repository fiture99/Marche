// src/pages/AboutUs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, Users, Globe, Award, ShoppingBag, Shield, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import background from '../images/background.jpg';

export const AboutUs: React.FC = () => {
  const stats = [
    { number: "50+", label: "Local Vendors" },
    { number: "1,000+", label: "Products" },
    { number: "5,000+", label: "Happy Customers" },
    { number: "90%", label: "Satisfaction Rate" }
  ];

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8 text-emerald-600" />,
      title: "Easy Shopping Experience",
      description: "User-friendly platform designed for seamless browsing and purchasing"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure Payments",
      description: "Multiple payment options including Bank Transfer or Wave"
    },
    {
      icon: <Truck className="w-8 h-8 text-purple-600" />,
      title: "Reliable Delivery",
      description: "Fast and dependable delivery services across The Gambia"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Vendor Support",
      description: "Comprehensive tools and support for local businesses to thrive"
    }
  ];

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
          minHeight: "60vh",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-yellow-300">Marché</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The Gambia's Digital Marketplace Revolution
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Connecting local vendors with customers through innovative technology and trusted commerce.
          </p>
        </div>
      </section>

      {/* What is Marché Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Marché?</h2>
              <p className="text-lg text-gray-600 mb-6">
                Marché is The Gambia's premier multi-vendor e-commerce platform, designed to bridge the gap 
                between local businesses and customers. Our name, meaning "market" in French, reflects our 
                mission to create a vibrant digital marketplace that celebrates and supports local commerce.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We provide a comprehensive platform where vendors can showcase their products to a wider 
                audience, while customers enjoy convenient access to authentic local goods from the comfort 
                of their homes.
              </p>
              <p className="text-lg text-gray-600">
                Built specifically for The Gambian market, we understand local needs and have integrated 
                popular payment methods like QCell Money and Africell Money to ensure seamless transactions 
                for everyone.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Local marketplace"
                className="rounded-lg shadow-md w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
            <p className="text-lg text-gray-600">Growing together with the Gambian business community</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-lg text-gray-600">Designed for both vendors and customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower local Gambian businesses by providing them with a digital platform to reach 
                more customers, increase sales, and grow sustainably. We're committed to making 
                e-commerce accessible and beneficial for all Gambians.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become the leading e-commerce ecosystem in The Gambia, where every local vendor 
                has equal opportunity to succeed and every customer can easily discover and purchase 
                quality local products that support their community's economy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide our platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
              <p className="text-gray-600">
                We prioritize the growth and well-being of the Gambian business community, 
                creating positive economic impact through every transaction.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously evolve our platform to meet the unique needs of the Gambian market, 
                incorporating local payment methods and user preferences.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
              <p className="text-gray-600">
                We maintain the highest standards of security and transparency, ensuring safe 
                transactions and building trust between vendors and customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-6">Be Part of Our Story</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of vendors and customers who are already experiencing the future 
            of commerce in The Gambia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Marche/shop">
              <Button size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600">
                Start Shopping
              </Button>
            </Link>
            <Link to="/Marche/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;