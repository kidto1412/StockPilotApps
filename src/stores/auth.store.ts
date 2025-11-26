// stores/auth.store.ts
import { create } from 'zustand';
import { createSecurePersist } from './index.store';

type AuthState = {
  token: string | null;
  userId: string | null;
  //   user: any | null;
  setAuth: (token: string) => Promise<void>;
  setUserId: (id: string) => Promise<void>;

  logout: () => Promise<void>;
  getToken: () => string | null;
};

export const useAuthStore = create<AuthState>()(
  createSecurePersist<AuthState>(
    (set, get) => ({
      token: null,
      userId: null,

      setUserId: async (id: string) => {
        set({ userId: id });
      },
      setAuth: async (token: string) => {
        set({ token });
      },
      getToken: () => get().token,

      logout: async () => {
        set({ token: null });
      },
    }),
    'auth-token',
  ),
);
