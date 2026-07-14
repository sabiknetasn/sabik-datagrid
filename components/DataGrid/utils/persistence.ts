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

export const exportToCSV = (data: Record<string, unknown>[], columns: { header?: unknown; id?: string; accessorKey?: string }[]) => {
  const header = columns.map(col => String(col.header || col.id)).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const key = col.accessorKey as string | undefined;
      const value = key ? row[key] ?? '' : '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  if (typeof document === 'undefined') return;

  const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
