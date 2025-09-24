// components/product/AddToCartButton.tsx
import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { Product } from '../../types';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  variant = 'default',
  size = 'md'
}) => {
  const { addItem, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isInCart = items.some(item => item.product.id === product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock === 0}
      variant={variant}
      size={size}
      className="relative"
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : showSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added!
        </>
      ) : isInCart ? (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add More
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
};