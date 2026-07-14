import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
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

export type ColumnPinPosition = 'left' | 'right';

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
 * Extra fields control DataGrid filtering/sorting/pinning behavior.
 * Do not redeclare `cell`/`header` — that breaks TypeScript inference.
 */
export type DataGridColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  sortable?: boolean;
  filterable?: boolean;
  filterType?: ColumnFilterType;
  /** Initial pin side. Persisted when `persistenceKey` is set. */
  pin?: ColumnPinPosition;
  /** Opt out of resizing for this column when grid `resizable` is on. */
  enableResizing?: boolean;
};

export interface DataGridState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
}

export interface DataGridContextValue {
  state: DataGridState;
  setSorting: (sorting: SortingState) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setGlobalFilter: (filter: string) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setRowSelection: (selection: RowSelectionState) => void;
  setPagination: (pagination: PaginationState) => void;
  setColumnOrder: (order: ColumnOrderState) => void;
  setColumnSizing: (sizing: ColumnSizingState) => void;
  setColumnPinning: (pinning: ColumnPinningState) => void;
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
  /** Enable drag handles to resize columns (default `true`). */
  resizable?: boolean;
  /** Enable drag-and-drop header reordering via @dnd-kit (default `false`). */
  reorderable?: boolean;
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
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  onExport?: (type: 'csv' | 'excel' | 'print') => void;

  className?: string;
}
