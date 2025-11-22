import EncryptedStorage from 'react-native-encrypted-storage';

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error getting secure storage item:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting secure storage item:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing secure storage item:', error);
    }
  },

  // Opsional: clear all storage
  clear: async (): Promise<void> => {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  },
};
