import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../../data/products';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('wishlist_db');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed parsing wishlist', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('wishlist_db', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (!prev.find(p => p.id === product.id)) {
        toast.success(`${product.name} dimasukkan ke Wishlist!`);
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => {
      const p = prev.find(item => item.id === productId);
      if (p) toast.info(`${p.name} dihapus dari Wishlist.`);
      return prev.filter(item => item.id !== productId);
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(product => product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
