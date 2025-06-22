'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const fetchCart = async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error",
        description: "Could not load your cart.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Add cart update event listener
    window.addEventListener('cartUpdate', fetchCart);
    return () => window.removeEventListener('cartUpdate', fetchCart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const addItem = async (productId: string, quantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) throw new Error('Failed to add item to cart');
      
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdate'));
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove item from cart');
      
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdate'));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) throw new Error('Failed to update quantity');
      
      await fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdate'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to clear cart');
      
      setItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdate'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + (subtotal > 0 ? 5.99 : 0); // Add shipping if cart not empty
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      total,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};