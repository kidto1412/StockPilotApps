import { secureStorage } from "@/utils/secureStore";
import { StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export function createSecurePersist<T>(
  initializer: StateCreator<T>,
  name: string
) {
  return persist<T>(initializer, {
    name,
    storage: createJSONStorage(() => secureStorage),
  });
}
