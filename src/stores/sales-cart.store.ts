import { ProductResponse } from '@/interfaces/product.interface';
import { create } from 'zustand';

export type SalesCartItem = ProductResponse & {
  qty: number;
};

type SalesCartState = {
  items: SalesCartItem[];
  addItem: (product: ProductResponse) => boolean;
  increaseQty: (productId: string) => boolean;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
  getQty: (productId: string) => number;
};

export const useSalesCartStore = create<SalesCartState>((set, get) => ({
  items: [],
  addItem: product => {
    const existing = get().items.find(item => item.id === product.id);

    if (existing) {
      if (existing.qty >= existing.stock) {
        return false;
      }

      set(state => ({
        items: state.items.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      }));
      return true;
    }

    if (product.stock <= 0) {
      return false;
    }

    set(state => ({
      items: [...state.items, { ...product, qty: 1 }],
    }));
    return true;
  },
  increaseQty: productId => {
    const existing = get().items.find(item => item.id === productId);
    if (!existing) return false;

    if (existing.qty >= existing.stock) {
      return false;
    }

    set(state => ({
      items: state.items.map(item =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      ),
    }));
    return true;
  },
  decreaseQty: productId =>
    set(state => ({
      items: state.items
        .map(item =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter(item => item.qty > 0),
    })),
  clearCart: () => set({ items: [] }),
  getQty: productId =>
    get().items.find(item => item.id === productId)?.qty ?? 0,
}));
