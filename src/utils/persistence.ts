import { DATAGRID_CONSTANTS } from '../constants';

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const usePersistence = <T>(
  persistenceKey: string | undefined,
  key: string,
  defaultValue: T
) => {
  const storageKey = persistenceKey
    ? `${DATAGRID_CONSTANTS.STORAGE_KEY_PREFIX}${persistenceKey}:${key}`
    : null;

  const load = (): T => {
    if (!storageKey || !canUseLocalStorage()) return defaultValue;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch (e) {
      console.error(`Error loading persistence for ${key}:`, e);
      return defaultValue;
    }
  };

  const save = (value: T) => {
    if (!storageKey || !canUseLocalStorage()) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving persistence for ${key}:`, e);
    }
  };

  return { load, save };
};
