 export   const API_BASE_URL = 'http://localhost:5000/api';

// API client configuration
const apiClient = {
  get: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    // console.log('🌐 API GET Request:', url);
    // console.log('🔑 Token exists:', !!token);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      
      // console.log('📨 API Response Status:', response.status);
      // console.log('📨 API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('❌ API Error Text:', text);
          errorData = { error: text || 'Request failed' };
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      // console.log('✅ API Success Response:', data);
      return data;
      
    } catch (error) {
      console.error('💥 API Request Failed:', error);
      throw error;
    }
  },

  // In your api.ts file
  post: async (endpoint: string, data: any, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}${endpoint}`;

  // Detect if the data is FormData
  const isFormData =
    data instanceof FormData ||
    (typeof FormData !== 'undefined' && data?.constructor?.name === 'FormData');

  // console.log('📤 API POST Request:', url);
  // console.log('📦 Request Data Type:', isFormData ? 'FormData' : 'JSON');

  try {
    // Build headers
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type if not FormData
    if (!isFormData) headers['Content-Type'] = 'application/json';
    else if ('Content-Type' in headers) delete headers['Content-Type'];

    const body = isFormData ? data : JSON.stringify(data);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      ...options,
    });

    // console.log('📨 Response Status:', response.status);

    // Read body safely
    const responseText = await response.text();
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      // Handle backend validation errors
      let errorMessage = `Request failed with status ${response.status}`;
      if (responseData) {
        if (responseData.messages) {
          const validationErrors = Object.entries(responseData.messages)
            .map(([field, errors]) =>
              `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
            )
            .join('; ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.raw) {
          errorMessage = responseData.raw;
        }
      }
      console.error('❌ API Error Response:', responseData);
      throw new Error(errorMessage);
    }

    // console.log('✅ API Success Response:', responseData);
    return responseData;

  } catch (error) {
    console.error('💥 API Request Failed:', error);
    throw error;
  }
},


  put: async (endpoint: string, data: any, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}${endpoint}`;
  
  const isFormData = data instanceof FormData;
  
  // console.log('📤 API PUT Request:', url);
  // console.log('📦 Request Data:', data);
  // console.log('📋 Is FormData:', isFormData);
  
  try {
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
    
    // console.log('📨 Response Status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        
        if (errorData.messages) {
          const validationErrors = Object.entries(errorData.messages)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          throw new Error(`Validation failed: ${validationErrors}`);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }
        const text = await response.text();
        console.error('❌ API Error Text:', text);
        throw new Error(text || `Request failed with status ${response.status}`);
      }
    }
    
    const responseData = await response.json();
    // console.log('✅ API Success Response:', responseData);
    return responseData;
    
  } catch (error) {
    console.error('💥 API Request Failed:', error);
    throw error;
  }
},

//   post: async (endpoint: string, data: any, options: RequestInit = {}) => {
//     const token = localStorage.getItem('token');
//     const url = `${API_BASE_URL}${endpoint}`;
  
//     // Check if data is FormData
//     const isFormData = data instanceof FormData;
  
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           ...(token && { Authorization: `Bearer ${token}` }),
//           ...options.headers,
//           // Only set Content-Type if NOT FormData
//           ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
//         },
//         body: isFormData ? data : JSON.stringify(data),
//         ...options,
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
//         throw new Error(errorData.error || `Request failed with status ${response.status}`);
//       }
  
//       return response.json();
//     } catch (error) {
//       console.error('💥 API POST Failed:', error);
//       throw error;
//     }
//   },
  
//   put: async (endpoint: string, data: any, options: RequestInit = {}) => {
//     const token = localStorage.getItem('token');
//     const url = `${API_BASE_URL}${endpoint}`;
  
//     const isFormData = data instanceof FormData;
  
//     try {
//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           ...(token && { Authorization: `Bearer ${token}` }),
//           ...options.headers,
//           ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
//         },
//         body: isFormData ? data : JSON.stringify(data),
//         ...options,
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
//         throw new Error(errorData.error || `Request failed with status ${response.status}`);
//       }
  
//       return response.json();
//     } catch (error) {
//       console.error('💥 API PUT Failed:', error);
//       throw error;
//     }
//   },

  delete: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  },
};

// Auth API functions
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login', credentials);
    
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return apiClient.put('/auth/profile', profileData);
  },

  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
  }) => {
    return apiClient.put('/auth/change-password', passwordData);
  },
};

// Vendors API functions
export const vendorsAPI = {
  getVendors: async (params?: { page?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/vendors${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  getVendor: async (vendorId: string) => {
    return apiClient.get(`/vendors/${vendorId}`);
  },

  applyAsVendor: async (vendorData: {
    name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
    banner?: string;
  }) => {
    return apiClient.post('/vendors/apply', vendorData);
  },

  getMyVendor: async () => {
    return apiClient.get('/vendors/my-vendor');
  },

  updateMyVendor: async (vendorData: any) => {
    return apiClient.put('/vendors/my-vendor', vendorData);
  },


  // Vendor product management
  getMyProducts: async (params?: { page?: number; include_inactive?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.include_inactive) queryParams.append('include_inactive', 'true');

  const endpoint = `/vendors/products${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await apiClient.get(endpoint);

  // Inspect the raw response to see where the data actually is
  // console.log("Raw API Response:", response);

  // Axios usually returns { data, status, headers, ... }
  // Make sure to return response.data or response.data.data if wrapped
  return response?.data ?? response; // safe fallback
},



  createVendorProduct: async (productData: FormData) => {
    return apiClient.post('/vendors/products', productData);
  },

  updateVendorProduct: async (productId: number, productData: FormData) => {
    return apiClient.put(`/vendors/products/${productId}`, productData);
  },

  

  deleteVendorProduct: async (productId: number) => {
    return apiClient.delete(`/vendors/products/${productId}`);
  },
};

// Products API functions
export const productsAPI = {
  getProducts: async (params?: {
    page?: number;
    search?: string;
    category_id?: number;
    vendor_id?: number;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    featured?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  getProduct: async (productId: string) => {
    return apiClient.get(`/products/${productId}`);
  },

  createProduct: async (productData: any) => {
    return apiClient.post('/products', productData);
  },

  updateProduct: async (productId: string, productData: any) => {
    return apiClient.put(`/products/${productId}`, productData);
  },

  deleteProduct: async (productId: string) => {
    return apiClient.delete(`/products/${productId}`);
  },

  getMyProducts: async (params?: { page?: number; include_inactive?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.include_inactive) queryParams.append('include_inactive', 'true');
    
    const endpoint = `/products/my-products${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },
  getAllProducts: async () => {
    // console.log('📦 Fetching all products...');
    return apiClient.get('/products/all?include_inactive=false');
  },
};

// Categories API functions
export const categoriesAPI = {
  getCategories: async () => {
    return apiClient.get('/categories');
  },

  getCategory: async (categoryId: string) => {
    return apiClient.get(`/categories/${categoryId}`);
  },
};

// Orders API functions
// export const ordersAPI = {
//   createOrder: async (orderData: {
//     items: Array<{ product_id: number; quantity: number }>;
//     payment_method: string;
//     shipping_address: any;
//     notes?: string;
//   }) => {
//     return apiClient.post('/orders', orderData);
//   },

//   getMyOrders: async (params?: { page?: number; status?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.status) queryParams.append('status', params.status);
    
//     const endpoint = `/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
//     return apiClient.get(endpoint);
//   },

//   getOrder: async (orderId: string) => {
//     return apiClient.get(`/orders/${orderId}`);
//   },

//   cancelOrder: async (orderId: string) => {
//     return apiClient.put(`/orders/${orderId}/cancel`, {});
//   },

//   // Cart functions
//   getCart: async () => {
//     return apiClient.get('/orders/cart');
//   },

//   addToCart: async (productId: number, quantity: number = 1) => {
//     return apiClient.post('/orders/cart/add', { product_id: productId, quantity });
//   },

//   updateCartItem: async (itemId: string, quantity: number) => {
//     return apiClient.put(`/orders/cart/${itemId}`, { quantity });
//   },

//   removeFromCart: async (itemId: string) => {
//     return apiClient.delete(`/orders/cart/${itemId}`);
//   },

//   clearCart: async () => {
//     return apiClient.delete('/orders/cart/clear');
//   },
// };


// services/api.ts
export const ordersAPI = {
  // Create a new order with payment reference
  createOrder: async (orderData: {
    items: Array<{ product_id: number; quantity: number }>;
    payment_method: string;
    shipping_address: any; // This field is required
    notes?: string;
    // Remove the fields the backend calls "unknown": payment_reference, status, total_amount
  }) => {
    return apiClient.post('/orders', orderData);
  },

  // Get order by ID
  getOrder: async (orderId: string) => {
    return apiClient.get(`/orders/${orderId}`);
  },

  // Get customer's order history
  getMyOrders: async (params?: { 
    page?: number; 
    status?: string;
    sort_by?: string; // e.g., 'created_at:desc' :cite[7]
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Update order status (e.g., when payment is confirmed)
  updateOrderStatus: async (orderId: string, status: string, transaction_id?: string) => {
    return apiClient.put(`/orders/${orderId}/status`, { 
      status, 
      transaction_id 
    });
  },

  // Cancel an unpaid order :cite[8]
  cancelOrder: async (orderId: string) => {
    return apiClient.put(`/orders/${orderId}/cancel`, {});
  },

  // Check payment status
  checkPaymentStatus: async (orderId: string) => {
    return apiClient.get(`/orders/${orderId}/payment-status`);
  },

  // === CART MANAGEMENT ===
  getCart: async () => {
    return apiClient.get('/orders/cart');
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    return apiClient.post('/orders/cart/add', { 
      product_id: productId, 
      quantity 
    });
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    return apiClient.put(`/orders/cart/${itemId}`, { quantity });
  },

  removeFromCart: async (itemId: string) => {
    return apiClient.delete(`/orders/cart/${itemId}`);
  },

  clearCart: async () => {
    return apiClient.delete('/orders/cart/clear');
  },

  // === PAYMENT REFERENCE GENERATION ===
  generatePaymentReference: (prefix: string = 'MARCHE') => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  // === PAYMENT DETAILS TEMPLATE ===
  getPaymentDetails: (paymentMethod: 'wave' | 'trustBank') => {
    const baseDetails = {
      wave: {
        number: '+220 123 4567', // Your Wave number
        accountName: 'Marché Business',
        instructions: 'Send via Wave mobile app with reference number'
      },
      trustBank: {
        accountNumber: '1234567890', // Your Trust Bank account
        accountName: 'Marché Enterprises',
        branch: 'Banjul Main Branch',
        instructions: 'Transfer to bank account with reference number'
      }
    };
    
    return baseDetails[paymentMethod];
  }
};

// Admin API functions
// export const adminAPI = {
//   // Dashboard
//   getDashboard: async () => {
//     return apiClient.get('/admin/dashboard');
//   },

//   // Vendors
// //   getVendors: async (params?: { page?: number; status?: string }) => {
// //     const queryParams = new URLSearchParams();
// //     if (params?.page) queryParams.append('page', params.page.toString());
// //     if (params?.status) queryParams.append('status', params.status);

// //     const endpoint = `/admin/vendors${queryParams.toString() ? `?${queryParams}` : ''}`;
// //     return apiClient.get(endpoint);
// //   },
// // Update your adminAPI.getVendors function to handle errors better
//     getVendors: async (params?: { page?: number; status?: string }) => {
//       try {
//         const queryParams = new URLSearchParams();
//         if (params?.page) queryParams.append('page', params.page.toString());
//         if (params?.status) queryParams.append('status', params.status);

//         const endpoint = `/admin/vendors${queryParams.toString() ? `?${queryParams}` : ''}`;
//         const response = await apiClient.get(endpoint);
//         return response;
//       } catch (error) {
//         console.error('Failed to fetch vendors:', error);
//         throw error;
//       }
//     },

//   approveVendor: async (vendorId: number) => {
//     return apiClient.put(`/admin/vendors/${vendorId}/approve`, {});
//   },

//   rejectVendor: async (vendorId: number, reason: string) => {
//     return apiClient.put(`/admin/vendors/${vendorId}/reject`, { reason });
//   },

//   suspendVendor: async (vendorId: number) => {
//     return apiClient.put(`/admin/vendors/${vendorId}/suspend`, {});
//   },

//   // Orders
//   getOrders: async (params?: { page?: number; status?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.status) queryParams.append('status', params.status);

//     const endpoint = `/admin/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
//     return apiClient.get(endpoint);
//   },

//   updateOrderStatus: async (orderId: number, status: string) => {
//     return apiClient.put(`/admin/orders/${orderId}/status`, { status });
//   },

//   // Products
//   getProducts: async (params?: { page?: number; include_inactive?: boolean }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.include_inactive) queryParams.append('include_inactive', 'true');

//     const endpoint = `/admin/products${queryParams.toString() ? `?${queryParams}` : ''}`;
//     return apiClient.get(endpoint);
//   },

//   toggleProductActive: async (productId: number) => {
//     return apiClient.put(`/admin/products/${productId}/toggle-active`, {});
//   },

//   // Users
//   getUsers: async (params?: { page?: number; role?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.role) queryParams.append('role', params.role);

//     const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
//     return apiClient.get(endpoint);
//   },

  
// };

// Admin API functions
// export const adminAPI = {
//   // Dashboard
//   getDashboard: async () => {
//     console.log('📊 Fetching admin dashboard...');
//     return apiClient.get('/admin/dashboard');
//   },

//   // Vendors - Use the correct endpoint
//   getVendors: async (params?: { page?: number; status?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.status) queryParams.append('status', params.status);

//     const endpoint = `/admin/vendors${queryParams.toString() ? `?${queryParams}` : ''}`;
//     console.log('🔍 Fetching vendors from:', endpoint);
//     return apiClient.get(endpoint);
//   },

//   approveVendor: async (vendorId: number) => {
//     console.log('✅ Approving vendor:', vendorId);
//     return apiClient.put(`/admin/vendors/${vendorId}/approve`, {});
//   },

//   rejectVendor: async (vendorId: number, reason: string) => {
//     console.log('❌ Rejecting vendor:', vendorId, 'Reason:', reason);
//     return apiClient.put(`/admin/vendors/${vendorId}/reject`, { reason });
//   },

//   suspendVendor: async (vendorId: number) => {
//     console.log('⏸️ Suspending vendor:', vendorId);
//     return apiClient.put(`/admin/vendors/${vendorId}/suspend`, {});
//   },

//   // Orders
//   getOrders: async (params?: { page?: number; status?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.status) queryParams.append('status', params.status);

//     const endpoint = `/admin/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
//     console.log('📦 Fetching orders:', endpoint);
//     return apiClient.get(endpoint);
//   },

//   updateOrderStatus: async (orderId: number, status: string) => {
//     console.log('🔄 Updating order status:', orderId, 'to', status);
//     return apiClient.put(`/admin/orders/${orderId}/status`, { status });
//   },

//   // Products
//   getProducts: async (params?: { page?: number; include_inactive?: boolean }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.include_inactive) queryParams.append('include_inactive', 'true');

//     const endpoint = `/admin/products${queryParams.toString() ? `?${queryParams}` : ''}`;
//     console.log('📦 Fetching products:', endpoint);
//     return apiClient.get(endpoint);
//   },

//   toggleProductActive: async (productId: number) => {
//     console.log('🔘 Toggling product active status:', productId);
//     return apiClient.put(`/admin/products/${productId}/toggle-active`, {});
//   },

//   // Users
//   getUsers: async (params?: { page?: number; role?: string }) => {
//     const queryParams = new URLSearchParams();
//     if (params?.page) queryParams.append('page', params.page.toString());
//     if (params?.role) queryParams.append('role', params.role);

//     const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
//     console.log('👥 Fetching users:', endpoint);
//     return apiClient.get(endpoint);
//   },
// };

export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    // console.log('📊 Fetching admin dashboard...');
    return apiClient.get('/admin/dashboard');
  },

  // Vendors - Use the correct endpoint
  getVendors: async (params?: { page?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/admin/vendors${queryParams.toString() ? `?${queryParams}` : ''}`;
    // console.log('🔍 Fetching vendors from:', endpoint);
    return apiClient.get(endpoint);
  },

  approveVendor: async (vendorId: number) => {
    // console.log('✅ Approving vendor:', vendorId);
    return apiClient.put(`/admin/vendors/${vendorId}/approve`, {});
  },

  rejectVendor: async (vendorId: number, reason: string) => {
    // console.log('❌ Rejecting vendor:', vendorId, 'Reason:', reason);
    return apiClient.put(`/admin/vendors/${vendorId}/reject`, { reason });
  },

  suspendVendor: async (vendorId: number) => {
    // console.log('⏸️ Suspending vendor:', vendorId);
    return apiClient.put(`/admin/vendors/${vendorId}/suspend`, {});
  },

  // Orders
  getOrders: async (params?: { page?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/admin/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
    // console.log('📦 Fetching orders:', endpoint);
    return apiClient.get(endpoint);
  },

  updateOrderStatus: async (orderId: number, status: string) => {
    // console.log('🔄 Updating order status:', orderId, 'to', status);
    return apiClient.put(`/admin/orders/${orderId}/status`, { status });
  },

  // Products - ADD THESE METHODS

  getAllProducts: async () => {
    // console.log('📦 Fetching all products...');
    return apiClient.get('/admin/products?include_inactive=true');
  },
  getProducts: async (params?: { page?: number; include_inactive?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.include_inactive) queryParams.append('include_inactive', 'true');

    const endpoint = `/admin/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    // console.log('📦 Fetching products:', endpoint);
    return apiClient.get(endpoint);
  },

  

  //  getAllVendors: async () => {
  //   console.log('📦 Fetching all vendors...');
  //   return apiClient.get('/admin/vendors?include_inactive=true');
  // },

  toggleProductActive: async (productId: number) => {
    // console.log('🔘 Toggling product active status:', productId);
    return apiClient.put(`/admin/products/${productId}/toggle-active`, {});
  },

  // Add this method for updating product status
  updateProductStatus: async (productId: number, isActive: boolean) => {
    // console.log('🔘 Updating product status:', productId, 'to', isActive);
    return apiClient.put(`/admin/products/${productId}/status`, { is_active: isActive });
  },

  getCategories: async () => {
    return apiClient.get('/categories');
  },

  // Users
  getUsers: async (params?: { page?: number; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.role) queryParams.append('role', params.role);

    const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
    // console.log('👥 Fetching users:', endpoint);
    return apiClient.get(endpoint);
  },
  
};
export default apiClient;