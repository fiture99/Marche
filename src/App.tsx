// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CustomerVendors } from './pages/CustomerVendors';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Checkout } from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import CustomerOrder from './pages/CustomerOrder';
import AboutUs from './pages/AbountUs';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Marche/shop" element={<Shop />} />
                <Route path="/Marche/products/:id" element={<ProductDetail />} />
                <Route path="/Marche/vendors" element={<CustomerVendors />} />
                <Route path="/Marche/login" element={<Login />} />
                <Route path="/Marche/register" element={<Register />} />
                <Route path="/Marche/checkout" element={<Checkout />} />
                <Route path="/Marche/admin" element={<AdminDashboard />} />
                <Route path="/Marche/admin/*" element={<AdminDashboard />} />
                <Route path="/Marche/vendor/*" element={<VendorDashboard />} />
                <Route path="/Marche/orders" element={<CustomerOrder />} />
                <Route path="/Marche/about" element={<AboutUs />} />
                <Route path="/Marche/contact" element={<ContactUs />} />

                
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;