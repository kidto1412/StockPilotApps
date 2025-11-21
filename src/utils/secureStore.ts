import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value;
  },

  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },

  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};
