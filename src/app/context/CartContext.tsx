import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: any;
  name: string;
  price: number;
  priceRaw: number;
  image: string;
  size: string;
  quantity: number;
  inventory?: any;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, size: string) => void;
  removeFromCart: (id: any, size: string) => void;
  updateQuantity: (id: any, size: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from local storage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('gakha_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('gakha_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size: string) => {
    const priceRaw = typeof product.price === 'string' 
      ? parseInt(product.price.replace(/[^0-9]/g, '')) 
      : product.price;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      
      // Check stock
      const stock = product.inventory?.[size] ?? 99; // Default 99 if not set
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > stock) {
        toast.error(`Maaf, stok ukuran ${size} hanya tersisa ${stock} pcs`);
        return prev;
      }

      if (existing) {
        toast.success(`Jumlah ${product.name} diperbarui di keranjang`);
        return prev.map(item => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }

      toast.success(`${product.name} (Size ${size}) ditambahkan ke keranjang`);
      return [...prev, {
        id: product.id,
        name: product.name,
        price: priceRaw,
        priceRaw: priceRaw,
        image: product.image,
        size: size,
        quantity: 1,
        inventory: product.inventory
      }];
    });
  };

  const removeFromCart = (id: any, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
    toast.info('Produk dihapus dari keranjang');
  };

  const updateQuantity = (id: any, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + delta;
        const stock = item.inventory?.[size] ?? 99;

        if (newQty < 1) return item;
        if (newQty > stock) {
          toast.error(`Maksimal stok tersedia: ${stock} pcs`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gakha_cart');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
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
