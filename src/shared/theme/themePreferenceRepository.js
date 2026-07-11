import storageClient from '../../infrastructure/storage/storageClient';
import { STORAGE_KEYS } from '../../infrastructure/storage/storageKeys';

export async function getThemePreference() {
  const value = await storageClient.getItem(STORAGE_KEYS.themePreference);
  return value === null ? null : value === 'true';
}

export function saveThemePreference(isDark) {
  return storageClient.setItem(
    STORAGE_KEYS.themePreference,
    String(Boolean(isDark))
  );
}
