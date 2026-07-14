import { 
  ColumnDef, 
  PaginationState, 
  SortingState, 
  ColumnFiltersState, 
  VisibilityState,
  RowSelectionState,
  Table,
} from '@tanstack/react-table';
import { ReactNode, CSSProperties } from 'react';

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

/** @deprecated Use DataGridThemeTokens via the `theme` prop */
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
  icon?: React.ReactNode;
  onClick: (row: TData) => void;
  danger?: boolean;
  disabled?: boolean;
}

export type DataGridColumnDef<TData> = ColumnDef<TData> & {
  id?: string;
  header?: string | ReactNode;
  cell?: (props: { row: { original: TData }; getValue: () => unknown }) => ReactNode;
  footer?: string | ReactNode;
  minSize?: number;
  maxSize?: number;
  size?: number;
  pin?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  filterType?: ColumnFilterType;
  visible?: boolean;
  editable?: boolean;
};

export interface DataGridPaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPaginationChange: (state: PaginationState) => void;
  manual?: boolean;
}

export interface DataGridFilterProps {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  onColumnFiltersChange: (state: ColumnFiltersState) => void;
  onGlobalFilterChange: (value: string) => void;
  manual?: boolean;
}

export interface DataGridSelectionProps {
  rowSelection: RowSelectionState;
  onRowSelectionChange: (state: RowSelectionState) => void;
  selectable?: boolean;
}

export interface DataGridState<TData> {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
}

export interface DataGridContextValue<TData> {
  state: DataGridState<TData>;
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
  
  // Features
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  toolbar?: boolean;
  stickyHeader?: boolean;
  virtualized?: boolean;
  persistenceKey?: string;
  striped?: boolean;
  hoverable?: boolean;

  // Appearance
  density?: Density;
  rowPadding?: RowPadding;
  rowHeight?: number;
  theme?: DataGridThemeTokens;

  /** Accessible name for the grid (applied to the table element). */
  ariaLabel?: string;
  /** Stable row identity — recommended for selection and refetch scenarios. */
  getRowId?: (originalRow: TData, index: number) => string;
  /** Total page count when using `manualPagination` (server-driven). */
  pageCount?: number;
  /** Total row count when using `manualPagination` (server-driven). */
  rowCount?: number;
  
  // Actions
  rowActions?: RowAction<TData>[];
  bulkActions?: RowAction<TData>[];
  onBulkAction?: (action: RowAction<TData>, selectedRows: TData[]) => void;
  
  // Modes
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  
  // Callbacks
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
  onSelectionChange?: (selection: RowSelectionState) => void;
  onSortChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: ColumnFiltersState, globalFilter: string) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRefresh?: () => void;
  onExport?: (type: 'csv' | 'excel' | 'print') => void;

  // Custom Renderers
  renderToolbar?: (props: { table: Table<TData> }) => ReactNode;
  className?: string;
}
