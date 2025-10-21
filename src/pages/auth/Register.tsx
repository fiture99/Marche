import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Swal from 'sweetalert2';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer', // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Check password match
  if (formData.password !== formData.confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Password Mismatch',
      text: 'Passwords do not match!',
    });
    setLoading(false);
    return;
  }

  try {
    // Format data to match backend expectations
    const registrationData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone || undefined,
      role: formData.role
    };

    console.log('📤 Sending registration data:', registrationData);

    // Call register API
    const response = await register(registrationData);
    console.log('✅ Registration successful:', response);

    // Show appropriate success message
    if (formData.role === 'vendor') {
      Swal.fire({
        icon: 'success',
        title: 'Registration Submitted',
        text: response?.info || 'Your vendor account is pending approval by admin.',
        confirmButtonText: 'Continue',
      }).then(() => {
        navigate('/Marche/login');
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: response?.message || 'Your account has been created successfully!',
        confirmButtonText: 'Continue',
      }).then(() => {
        navigate('/Marche/');
      });
    }

  } catch (err: any) {
    console.error('❌ Registration error:', err);
    console.error('❌ Error message:', err.message);
    
    const errorMessage = err.message || 'Something went wrong. Please try again.';
    
    setError(errorMessage);
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: errorMessage,
    });
  } finally {
    setLoading(false);
  }
};
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 font-bold text-3xl text-emerald-600 mb-8">
            <span className="text-4xl">🏪</span>
            <span>Marché</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Join Marché</h2>
          <p className="mt-2 text-gray-600">Create your account and start shopping</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
                icon={<User className="w-5 h-5" />}
              />

              <Input
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
                icon={<User className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+220 123 4567"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              required
              icon={<Mail className="w-5 h-5" />}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                required
                icon={<Lock className="w-5 h-5" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                style={{ marginTop: '32px' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
              icon={<Lock className="w-5 h-5" />}
            />

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Customer */}
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors duration-200">
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === 'customer'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData.role === 'customer' 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.role === 'customer' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Customer</p>
                    <p className="text-sm text-gray-500">Shop and buy products</p>
                  </div>
                </label>

                {/* Vendor */}
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors duration-200">
                  <input
                    type="radio"
                    name="role"
                    value="vendor"
                    checked={formData.role === 'vendor'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData.role === 'vendor' 
                      ? 'border-emerald-500 bg-emerald-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.role === 'vendor' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Vendor</p>
                    <p className="text-sm text-gray-500">Sell your products</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
