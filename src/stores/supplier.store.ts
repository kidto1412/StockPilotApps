// stores/auth.store.ts
import {
  CategoryResponse,
  CreateCategory,
} from '@/interfaces/category.interface';
import { SupplierResponse } from '@/interfaces/supplier.interface';
import { ProfileResponse, UserResponse } from '@/interfaces/user.interface';
// import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';

type UserState = {
  supplier: SupplierResponse | null;

  //   user: any | null;
  setSupplier: (supplier: SupplierResponse | null) => Promise<void>;
  reset: () => Promise<void>;
};

export const useSupplierStore = create<UserState>(set => ({
  supplier: null,

  setSupplier: async supplier => {
    // await SecureStore.setItemAsync("user", user);
    set({ supplier });
  },

  reset: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ supplier: null });
  },
}));
