// stores/auth.store.ts
import { ProfileResponse, UserResponse } from '@/interfaces/user.interface';
// import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';

type UserState = {
  user: UserResponse | null;
  profile: ProfileResponse | null;
  //   user: any | null;
  setUser: (user: UserResponse | null) => Promise<void>;
  reset: () => Promise<void>;
  setProfile: (user: ProfileResponse | null) => Promise<void>;
  resetProfile: () => Promise<void>;
};

export const useUserState = create<UserState>(set => ({
  user: null,
  profile: null,
  //   user: null,

  setUser: async user => {
    // await SecureStore.setItemAsync("user", user);
    set({ user });
  },
  setProfile: async profile => {
    // await SecureStore.setItemAsync("user", user);
    set({ profile });
  },

  reset: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ user: null });
  },
  resetProfile: async () => {
    // await SecureStore.deleteItemAsync("user");
    set({ profile: null });
  },
}));
