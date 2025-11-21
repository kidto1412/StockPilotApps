// stores/auth.store.ts
import { create } from "zustand";
import { createSecurePersist } from "./index.store";

type AuthState = {
  token: string | null;
  //   user: any | null;
  setAuth: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  createSecurePersist<AuthState>(
    (set) => ({
      token: null,

      setAuth: async (token: string) => {
        set({ token });
      },

      logout: async () => {
        set({ token: null });
      },
    }),
    "auth-token"
  )
);
