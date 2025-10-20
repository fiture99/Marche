import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Swal from 'sweetalert2';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt login (your login function should return user info or save it to localStorage)
      const user = await login(email, password);
      // ✅ Show success popup
      // Swal.fire({
      //   icon: 'success',
      //   title: 'Login Successful',
      //   text: 'Welcome back!',
      //   confirmButtonText: 'Continue',
      // }).then(() => {
        // ✅ Check user info after popup confirmation
        const storedUser = user || JSON.parse(localStorage.getItem('user') || '{}');

        // ✅ Redirect based on role
        if (storedUser?.role === 'admin') {
          navigate('/admin');
        } else if (storedUser?.role === 'vendor') {
          navigate('/vendor'); // remove the `/*` from your earlier code — React Router doesn’t need it here
        } else {
          navigate('/'); // fallback (customer or other)
        }
      ;
>>>>>>> 4531ef644db07164da7bfe1a61023780a603ded6
    } catch (err) {
      // ❌ Show error popup if login fails
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err instanceof Error ? err.message : 'Invalid email or password',
      });

      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };  


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 font-bold text-3xl text-emerald-600 mb-8"
          >
            <span className="text-4xl">🏪</span>
            <span>Marché</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              icon={<Mail className="w-5 h-5" />}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={<Lock className="w-5 h-5" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                style={{ marginTop: '32px' }}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Quick login for demo
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setEmail('customer@demo.com');
                  setPassword('password123');
                }}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                👤 Customer Account
              </button>
              <button
                onClick={() => {
                  setEmail('fatou@banjulelectronics.gm');
                  setPassword('password123');
                }}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                🏪 Vendor Account
              </button>
              <button
                onClick={() => {
                  setEmail('admin@marche.gm');
                  setPassword('admin123');
                }}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                ⚙️ Admin Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
