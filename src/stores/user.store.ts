// stores/auth.store.ts
import { UserResponse } from '@/interfaces/user.interface';
// import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';

type UserState = {
  user: UserResponse | null;
  //   user: any | null;
  setUser: (user: UserResponse | null) => Promise<void>;
  reset: () => Promise<void>;
};

export const useUserState = create<UserState>(set => ({
  user: null,
  //   user: null,

  setUser: async user => {
    // await SecureStore.setItemAsync("user", user);
    set({ user });
  },

  reset: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ user: null });
  },
}));
