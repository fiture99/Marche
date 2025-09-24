import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { vendorsAPI, categoriesAPI } from '../../services/api';
import Swal from 'sweetalert2';

interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  is_active?: boolean;
}

interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  category_id?: number;
  is_active: boolean;
  image?: string; // Changed from images[] to image for single image
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    description: product?.description || '',
    category: product?.category || '',
    is_active: product?.is_active ?? true,
  });

  // Fetch categories from backend and set initial image preview
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getCategories();
        console.log('Fetched categories:', response);
        
        const categoriesData = response.categories || response;
        setCategories(Array.isArray(categoriesData) ? categoriesData : [categoriesData]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load categories',
          timer: 3000,
        });
      }
    };

    // Set initial image preview if editing a product
    if (product?.image) {
      const fixedImagePath = product.image.replace(/\\/g, "/");
      setImagePreview(fixedImagePath);
    }

    fetchCategories();
  }, [product]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid File',
        text: 'Please select an image file',
        timer: 3000,
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: 'Image size should be less than 5MB',
        timer: 3000,
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Product name is required',
        timer: 3000,
      });
      return false;
    }
    if (formData.price <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Price',
        text: 'Price must be greater than 0',
        timer: 3000,
      });
      return false;
    }
    if (formData.stock < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Stock',
        text: 'Stock cannot be negative',
        timer: 3000,
      });
      return false;
    }
    if (!formData.category) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Category',
        text: 'Category is required',
        timer: 3000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formDataToSubmit = new FormData();
      
      // Append basic form data
      formDataToSubmit.append('name', formData.name.trim());
      formDataToSubmit.append('price', formData.price.toString());
      formDataToSubmit.append('stock', formData.stock.toString());
      formDataToSubmit.append('description', formData.description.trim());
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('is_active', formData.is_active.toString());

      // Append single image if selected
      if (imageFile) {
        formDataToSubmit.append('image', imageFile); // Single image field
      }

      if (product?.id) {
        await vendorsAPI.updateVendorProduct(product.id, formDataToSubmit);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product updated successfully',
          timer: 3000,
        });
      } else {
        await vendorsAPI.createVendorProduct(formDataToSubmit);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product created successfully',
          timer: 3000,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      
      if (error.message && error.message.includes('_sa_instance_state')) {
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Please check the product data format',
          timer: 5000,
        });
      } else if (error.message && error.message.includes('Validation failed')) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: error.message,
          timer: 5000,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to save product. Please try again.',
          timer: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    if (type === 'number') parsedValue = value === '' ? 0 : parseFloat(value);
    else if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-xl font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Single Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex flex-col items-center space-y-3">
              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
                className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {imagePreview ? 'Change Image' : 'Select Image'}
              </label>

              <p className="text-xs text-gray-500 text-center">
                Supported formats: JPG, PNG, GIF, WEBP<br />
                Max size: 5MB
              </p>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter product name"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (GMD) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter product description"
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;