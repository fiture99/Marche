import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { vendorsAPI } from '../../services/api';
import { Upload, Camera, Save, Building, Mail, Phone, MapPin, FileText, X } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: string;
}

interface VendorProfileProps {
  vendor: Vendor | null;
  onUpdate: () => void;
}

const VendorProfile: React.FC<VendorProfileProps> = ({ vendor, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
    banner: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Initialize form data when vendor changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        description: vendor.description || '',
        logo: vendor.logo || '',
        banner: vendor.banner || ''
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append text fields
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('description', formData.description);
      
      // Append files if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }

      await vendorsAPI.updateMyVendor(submitData);
      toast.success('Profile updated successfully');
      onUpdate();
      
      // Reset file states after successful upload
      setLogoFile(null);
      setBannerFile(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
    setUploading(type);
    
    try {
      // You might want to upload to a separate endpoint first, then get the URL
      // For now, we'll store the file and upload with the form
      if (type === 'logo') {
        setLogoFile(file);
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, logo: previewUrl }));
      } else {
        setBannerFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, banner: previewUrl }));
      }
      
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} selected successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (type: 'logo' | 'banner') => {
    if (type === 'logo') {
      setLogoFile(null);
      setFormData(prev => ({ ...prev, logo: vendor?.logo || '' }));
    } else {
      setBannerFile(null);
      setFormData(prev => ({ ...prev, banner: vendor?.banner || '' }));
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
    if (imagePath.startsWith('/')) return `https://marche-yzzm.onrender.com${imagePath}`;
    return `https://marche-yzzm.onrender.com/uploads/${imagePath}`;
  };

  if (!vendor) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">Vendor profile not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Vendor Information</h3>
        </div>
        <p className="text-sm text-gray-600 ml-13">Update your business details and contact information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center mr-2">
              <Building className="w-3 h-3 text-emerald-600" />
            </div>
            Business Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Describe your business..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2">
              <Mail className="w-3 h-3 text-blue-600" />
            </div>
            Contact Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="business@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="+220 XXX XXXX"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter full business address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Uploads */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2">
              <Camera className="w-3 h-3 text-purple-600" />
            </div>
            Media & Branding
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors flex items-center justify-center space-x-2">
                      {uploading === 'logo' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </div>
                  </label>
                </div>
                
                {(formData.logo || vendor.logo) && (
                  <div className="relative inline-block">
                    <img 
                      src={getImageUrl(formData.logo)} 
                      alt="Logo preview" 
                      className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('logo')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {logoFile && (
                      <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-xs px-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Banner
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'banner');
                      }}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors flex items-center justify-center space-x-2">
                      {uploading === 'banner' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {uploading === 'banner' ? 'Uploading...' : 'Upload Banner'}
                      </span>
                    </div>
                  </label>
                </div>
                
                {(formData.banner || vendor.banner) && (
                  <div className="relative">
                    <img 
                      src={getImageUrl(formData.banner)} 
                      alt="Banner preview" 
                      className="w-full h-20 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('banner')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {bannerFile && (
                      <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;