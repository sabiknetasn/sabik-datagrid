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
  ColumnOrderState,
  ColumnSizingState,
  ColumnPinningState,
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
  const orderPersist = usePersistence<ColumnOrderState>(persistenceKey, 'columnOrder', []);
  const sizingPersist = usePersistence<ColumnSizingState>(persistenceKey, 'columnSizing', {});
  const pinningPersist = usePersistence<ColumnPinningState>(persistenceKey, 'columnPinning', {});

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
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    persistenceKey ? orderPersist.load() : initialState?.columnOrder || []
  );
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() =>
    persistenceKey ? sizingPersist.load() : initialState?.columnSizing || {}
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() =>
    persistenceKey ? pinningPersist.load() : initialState?.columnPinning || {}
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
    orderPersist.save(columnOrder);
    sizingPersist.save(columnSizing);
    pinningPersist.save(columnPinning);
  }, [
    sorting,
    columnFilters,
    columnVisibility,
    pagination,
    columnOrder,
    columnSizing,
    columnPinning,
    persistenceKey,
  ]);

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
        columnOrder,
        columnSizing,
        columnPinning,
      },
      setSorting: (s: SortingState) => setSorting(s),
      setColumnFilters: (f: ColumnFiltersState) => setColumnFilters(f),
      setGlobalFilter: (f: string) => setGlobalFilter(f),
      setColumnVisibility: (v: VisibilityState) => setColumnVisibility(v),
      setRowSelection: (s: RowSelectionState) => setRowSelection(s),
      setPagination: (p: PaginationState) => setPagination(p),
      setColumnOrder: (o: ColumnOrderState) => setColumnOrder(o),
      setColumnSizing: (s: ColumnSizingState) => setColumnSizing(s),
      setColumnPinning: (p: ColumnPinningState) => setColumnPinning(p),
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
      columnOrder,
      columnSizing,
      columnPinning,
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
