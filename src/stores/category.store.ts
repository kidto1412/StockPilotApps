// stores/auth.store.ts
import {
  CategoryResponse,
  CreateCategory,
} from '@/interfaces/category.interface';
import { ProfileResponse, UserResponse } from '@/interfaces/user.interface';
// import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';

type UserState = {
  category: CategoryResponse | null;

  //   user: any | null;
  setCategory: (category: CategoryResponse | null) => Promise<void>;
  reset: () => Promise<void>;
};

export const useCategoryStore = create<UserState>(set => ({
  category: null,

  setCategory: async category => {
    // await SecureStore.setItemAsync("user", user);
    set({ category });
  },

  reset: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ category: null });
  },
}));
