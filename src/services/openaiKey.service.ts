import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore: any = null;
try {
  // Optional dependency; used on native for secure storage.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

const STORAGE_KEY = 'openai_api_key_v1';

export const OpenAIKeyService = {
  async get(): Promise<string | null> {
    try {
      if (SecureStore?.getItemAsync && Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(STORAGE_KEY);
      }
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  async set(key: string): Promise<void> {
    const trimmed = key.trim();
    if (!trimmed) {
      await this.clear();
      return;
    }

    if (SecureStore?.setItemAsync && Platform.OS !== 'web') {
      await SecureStore.setItemAsync(STORAGE_KEY, trimmed);
      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
  },

  async clear(): Promise<void> {
    try {
      if (SecureStore?.deleteItemAsync && Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        return;
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  },
};
