import { ProductResponse } from '@/interfaces/product.interface';

import { create } from 'zustand';

type UserState = {
  product: ProductResponse | null;

  //   user: any | null;
  setProduct: (product: ProductResponse | null) => Promise<void>;
  reset: () => Promise<void>;
};

export const useProductStore = create<UserState>(set => ({
  product: null,

  setProduct: async product => {
    // await SecureStore.setItemAsync("user", user);
    set({ product });
  },

  reset: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ product: null });
  },
}));
