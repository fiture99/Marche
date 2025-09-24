// contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  isOpen: boolean;
  toggleCart: () => void;
  loading: boolean;
  error: string | null;
  requiresAuth: boolean;
  syncCartWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, user } = useAuth();
  const requiresAuth = !isAuthenticated;

  // Load appropriate cart based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromAPI();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, user?.id]);

  // Listen for auth events
  useEffect(() => {
    const handleAuthLogin = (event: CustomEvent) => {
      // console.log('🔄 Auth login detected, syncing cart...');
      loadCartFromAPI();
    };

    const handleAuthLogout = () => {
      // console.log('🔄 Auth logout detected, clearing cart...');
      setItems([]);
      localStorage.removeItem('cart');
      setError('Please log in to access your cart');
    };

    window.addEventListener('authLogin', handleAuthLogin as EventListener);
    window.addEventListener('authLogout', handleAuthLogout);

    return () => {
      window.removeEventListener('authLogin', handleAuthLogin as EventListener);
      window.removeEventListener('authLogout', handleAuthLogout);
    };
  }, []);

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const localItems = JSON.parse(savedCart);
        // console.log('📦 Loaded cart from local storage:', localItems.length, 'items');
        setItems(localItems);
        setError(null);
      } else {
        setItems([]);
        setError(isAuthenticated ? 'Failed to load cart' : 'Please log in to sync your cart');
      }
    } catch (localError) {
      console.error('❌ Error loading from local storage:', localError);
      setItems([]);
      setError('Error loading cart data');
    }
  };

  const loadCartFromAPI = async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      loadCartFromLocalStorage();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // console.log('🔄 Loading cart from API...');
      
      const response = await ordersAPI.getCart();
      // console.log('📦 Cart API response:', response);

      // Handle different response structures
      let apiItems = [];
      
      if (response?.data?.items && Array.isArray(response.data.items)) {
        apiItems = response.data.items;
      } else if (Array.isArray(response?.data)) {
        apiItems = response.data;
      } else if (response?.data?.cart && Array.isArray(response.data.cart)) {
        apiItems = response.data.cart;
      } else if (Array.isArray(response)) {
        apiItems = response;
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        apiItems = [];
      }

      // console.log('🔍 Processed cart items:', apiItems);
      
      // Transform API response to CartItem structure
      const transformedItems: CartItem[] = apiItems.map((apiItem: any) => {
        const itemId = apiItem.id || apiItem.item_id || `api-${Date.now()}-${Math.random()}`;
        const productData = apiItem.product || apiItem;
        const quantity = apiItem.quantity || 1;

        return {
          id: itemId.toString(),
          product: {
            id: productData.id || productData.product_id || 0,
            name: productData.name || 'Unknown Product',
            price: productData.price || 0,
            images: productData.images || [],
            vendor: productData.vendor || { id: 0, name: 'Unknown Vendor' },
            description: productData.description || '',
            stock: productData.stock || 0,
            is_active: productData.is_active !== false,
            category: productData.category || { id: 0, name: 'Uncategorized', is_active: true },
            created_at: productData.created_at || new Date().toISOString()
          },
          quantity: quantity
        };
      });

      // console.log('✅ Transformed cart items:', transformedItems.length, 'items');
      setItems(transformedItems);
      
      // Sync with local storage
      localStorage.setItem('cart', JSON.stringify(transformedItems));
      setError(null);

    } catch (err: any) {
      console.error('❌ Error loading cart from API:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in to access your cart');
      } else {
        setError('Failed to load cart from server');
      }
      
      // Fallback to local storage
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithServer = async () => {
    if (!isAuthenticated) {
      // console.log('🔒 Cannot sync cart: user not authenticated');
      return;
    }
    await loadCartFromAPI();
  };

  const addItem = async (product: Product, quantity = 1) => {
    // Check authentication
    if (!isAuthenticated) {
      const errorMsg = 'Please log in to add items to cart';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (user?.role !== 'customer') {
    const errorMsg = 'Only customers can add items to the cart';
    setError(errorMsg);
    throw new Error(errorMsg);
  }

    try {
      setError(null);
      setLoading(true);
      // console.log('🛒 Adding to cart via API:', { productId: product.id, quantity });
      
      // API call to add item
      const response = await ordersAPI.addToCart(product.id, quantity);
      // console.log('✅ API response:', response);

      // Process response
      let addedItem;
      if (response?.data?.item) {
        addedItem = response.data.item;
      } else if (response?.data) {
        addedItem = response.data;
      } else {
        addedItem = response;
      }

      // Update local state
      setItems(prev => {
        const existingIndex = prev.findIndex(item => item.product.id === product.id);
        let newItems;

        if (existingIndex !== -1) {
          newItems = prev.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity, id: addedItem.id || item.id }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: addedItem.id || `server-${Date.now()}-${product.id}`,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images || [],
              vendor: product.vendor || { id: 0, name: 'Unknown Vendor' },
              description: product.description || '',
              stock: product.stock || 0,
              is_active: product.is_active !== false,
              category: product.category || { id: 0, name: 'Uncategorized', is_active: true },
              created_at: product.created_at || new Date().toISOString()
            },
            quantity: addedItem.quantity || quantity
          };
          newItems = [...prev, newItem];
        }

        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });

      setError(null);

    } catch (error: any) {
      console.error('❌ Error adding to cart via API:', error);
      
      if (error.response?.status === 401) {
        setError('Please log in to add items to cart');
      } else {
        setError(error.response?.data?.message || 'Failed to add item to cart');
      }
      
      // Fallback: add to local storage only
      setItems(prev => {
        const existingIndex = prev.findIndex(item => item.product.id === product.id);
        let newItems;

        if (existingIndex !== -1) {
          newItems = prev.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: `local-${Date.now()}-${product.id}`,
            product: {
              ...product,
              images: product.images || [],
              vendor: product.vendor || { id: 0, name: 'Unknown Vendor' }
            },
            quantity
          };
          newItems = [...prev, newItem];
        }

        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) {
      setError('Please log in to modify your cart');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      // console.log('🗑️ Removing item from cart:', itemId);
      
      await ordersAPI.removeFromCart(itemId);
      
      setItems(prev => {
        const newItems = prev.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });

    } catch (err: any) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart');
      
      // Fallback to local storage
      setItems(prev => {
        const newItems = prev.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      setError('Please log in to update cart quantities');
      return;
    }

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await ordersAPI.updateCartItem(itemId, quantity);
      
      setItems(prev => {
        const newItems = prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0);
        
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });

    } catch (err: any) {
      console.error('Error updating item quantity:', err);
      setError('Failed to update quantity');
      
      // Fallback to local storage
      setItems(prev => {
        const newItems = prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ).filter(item => item.quantity > 0);
        
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setError('Please log in to clear your cart');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      await ordersAPI.clearCart();
      
      setItems([]);
      localStorage.removeItem('cart');
      setError(null);

    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
      
      // Fallback to local storage
      setItems([]);
      localStorage.removeItem('cart');
    } finally {
      setLoading(false);
    }
  };

  const toggleCart = () => {
    setIsOpen(prev => !prev);
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      isOpen,
      toggleCart,
      loading,
      error,
      requiresAuth,
      syncCartWithServer
    }}>
      {children}
    </CartContext.Provider>
  );
};