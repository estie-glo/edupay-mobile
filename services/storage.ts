import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store n'est pas disponible sur le web : on retombe sur
// localStorage pour ne pas planter le build web (utilisé pour le dev sur PC).
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // stockage indisponible (navigation privée...) : on ignore
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // stockage indisponible : on ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
