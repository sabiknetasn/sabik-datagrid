import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { CSSProperties, ReactNode } from 'react';

export type Density = 'compact' | 'comfortable' | 'spacious';

export type RowPaddingPreset = 'compact' | 'comfortable' | 'spacious';

export type RowPadding = RowPaddingPreset | { x: number; y: number };

export type ColumnFilterType = 'string' | 'number' | 'boolean';

export interface DataGridThemeTokens {
  primary?: string;
  background?: string;
  headerBackground?: string;
  border?: string;
  radius?: string;
}

/** @deprecated Use `DataGridThemeTokens` via the `theme` prop. */
export interface DataGridTheme {
  light: string;
  dark: string;
  custom?: string;
}

export interface DataGridAppearance {
  rowPadding?: RowPadding;
  rowHeight?: number;
  striped?: boolean;
  hoverable?: boolean;
}

export interface RowAction<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (row: TData) => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * Column definition based on TanStack ColumnDef.
 * Extra fields control DataGrid filtering/sorting behavior.
 * Do not redeclare `cell`/`header` — that breaks TypeScript inference.
 */
export type DataGridColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  sortable?: boolean;
  filterable?: boolean;
  filterType?: ColumnFilterType;
};

export interface DataGridState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
}

export interface DataGridContextValue {
  state: DataGridState;
  setSorting: (sorting: SortingState) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setGlobalFilter: (filter: string) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: RowSelectionState) => void;
  setPagination: (pagination: PaginationState) => void;
  density: Density;
  setDensity: (density: Density) => void;
  appearance: DataGridAppearance;
  themeStyle: CSSProperties;
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: DataGridColumnDef<TData>[];
  loading?: boolean;
  error?: Error | string | null;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  errorState?: ReactNode;

  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  toolbar?: boolean;
  stickyHeader?: boolean;
  virtualized?: boolean;
  /** Scroll viewport height in px when `virtualized` is enabled (default 400). */
  virtualHeight?: number;
  persistenceKey?: string;
  striped?: boolean;
  hoverable?: boolean;

  density?: Density;
  rowPadding?: RowPadding;
  rowHeight?: number;
  theme?: DataGridThemeTokens;

  ariaLabel?: string;
  getRowId?: (originalRow: TData, index: number) => string;
  pageCount?: number;
  rowCount?: number;

  rowActions?: RowAction<TData>[];
  bulkActions?: RowAction<TData>[];
  onBulkAction?: (action: RowAction<TData>, selectedRows: TData[]) => void;

  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;

  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
  onSelectionChange?: (selection: RowSelectionState) => void;
  onSortChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState, globalFilter: string) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onExport?: (type: 'csv' | 'excel' | 'print') => void;

  className?: string;
}
