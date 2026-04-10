import { ProductResponse } from '@/interfaces/product.interface';
import { create } from 'zustand';

export type PurchaseCartItem = ProductResponse & {
  qty: number;
};

type PurchaseCartState = {
  items: PurchaseCartItem[];
  addItem: (product: ProductResponse) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const usePurchaseCartStore = create<PurchaseCartState>(set => ({
  items: [],
  addItem: product =>
    set(state => {
      const existing = state.items.find(item => item.id === product.id);

      if (existing) {
        return {
          items: state.items.map(item =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
          ),
        };
      }

      return {
        items: [...state.items, { ...product, qty: 1 }],
      };
    }),
  increaseQty: productId =>
    set(state => ({
      items: state.items.map(item =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      ),
    })),
  decreaseQty: productId =>
    set(state => ({
      items: state.items
        .map(item =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter(item => item.qty > 0),
    })),
  removeItem: productId =>
    set(state => ({
      items: state.items.filter(item => item.id !== productId),
    })),
  clearCart: () => set({ items: [] }),
}));
