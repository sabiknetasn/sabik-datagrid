import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
} from '@tanstack/react-table';
import type {
  DataGridAppearance,
  DataGridContextValue,
  DataGridThemeTokens,
  Density,
} from './types';
import { DATAGRID_CONSTANTS, resolveThemeVars } from './constants';
import { usePersistence } from './utils/persistence';

export const DataGridContext = createContext<DataGridContextValue | null>(null);

export function DataGridProvider({
  children,
  persistenceKey,
  initialState,
  density: densityProp,
  appearance = {},
  theme,
}: {
  children: ReactNode;
  persistenceKey?: string;
  initialState?: Partial<DataGridContextValue['state']>;
  density?: Density;
  appearance?: DataGridAppearance;
  theme?: DataGridThemeTokens;
}) {
  const sortingPersist = usePersistence<SortingState>(persistenceKey, 'sorting', []);
  const filterPersist = usePersistence<ColumnFiltersState>(persistenceKey, 'filters', []);
  const visibilityPersist = usePersistence<VisibilityState>(persistenceKey, 'visibility', {});
  const paginationPersist = usePersistence<PaginationState>(persistenceKey, 'pagination', {
    pageIndex: 0,
    pageSize: DATAGRID_CONSTANTS.DEFAULT_PAGE_SIZE,
  });

  const [sorting, setSorting] = useState<SortingState>(() =>
    persistenceKey ? sortingPersist.load() : initialState?.sorting || []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    persistenceKey ? filterPersist.load() : initialState?.columnFilters || []
  );
  const [globalFilter, setGlobalFilter] = useState<string>(initialState?.globalFilter || '');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    persistenceKey ? visibilityPersist.load() : initialState?.columnVisibility || {}
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState?.rowSelection || {}
  );
  const [pagination, setPagination] = useState<PaginationState>(() =>
    persistenceKey
      ? paginationPersist.load()
      : initialState?.pagination || {
          pageIndex: 0,
          pageSize: DATAGRID_CONSTANTS.DEFAULT_PAGE_SIZE,
        }
  );
  const [density, setDensity] = useState<Density>(densityProp ?? 'comfortable');

  useEffect(() => {
    if (densityProp) setDensity(densityProp);
  }, [densityProp]);

  useEffect(() => {
    if (!persistenceKey) return;
    sortingPersist.save(sorting);
    filterPersist.save(columnFilters);
    visibilityPersist.save(columnVisibility);
    paginationPersist.save(pagination);
  }, [sorting, columnFilters, columnVisibility, pagination, persistenceKey]);

  const themeStyle = useMemo(() => resolveThemeVars(theme), [theme]);

  const value = useMemo(
    () => ({
      state: {
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        rowSelection,
        pagination,
      },
      setSorting: (s: SortingState) => setSorting(s),
      setColumnFilters: (f: ColumnFiltersState) => setColumnFilters(f),
      setGlobalFilter: (f: string) => setGlobalFilter(f),
      setColumnVisibility: (v: VisibilityState) => setColumnVisibility(v),
      setRowSelection: (s: RowSelectionState) => setRowSelection(s),
      setPagination: (p: PaginationState) => setPagination(p),
      density,
      setDensity,
      appearance,
      themeStyle,
    }),
    [
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination,
      density,
      appearance,
      themeStyle,
    ]
  );

  return <DataGridContext.Provider value={value}>{children}</DataGridContext.Provider>;
}

export function useDataGridContext() {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGridContext must be used within a DataGridProvider');
  }
  return context;
}
