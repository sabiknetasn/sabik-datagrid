import * as react from 'react';
import { ReactNode, CSSProperties } from 'react';
import { ColumnDef, RowSelectionState, SortingState, ColumnFiltersState, PaginationState, VisibilityState } from '@tanstack/react-table';

type Density = 'compact' | 'comfortable' | 'spacious';
type RowPaddingPreset = 'compact' | 'comfortable' | 'spacious';
type RowPadding = RowPaddingPreset | {
    x: number;
    y: number;
};
type ColumnFilterType = 'string' | 'number' | 'boolean';
interface DataGridThemeTokens {
    primary?: string;
    background?: string;
    headerBackground?: string;
    border?: string;
    radius?: string;
}
/** @deprecated Use `DataGridThemeTokens` via the `theme` prop. */
interface DataGridTheme {
    light: string;
    dark: string;
    custom?: string;
}
interface DataGridAppearance {
    rowPadding?: RowPadding;
    rowHeight?: number;
    striped?: boolean;
    hoverable?: boolean;
}
interface RowAction<TData> {
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
type DataGridColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
    sortable?: boolean;
    filterable?: boolean;
    filterType?: ColumnFilterType;
};
interface DataGridState {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    columnVisibility: VisibilityState;
    rowSelection: RowSelectionState;
    pagination: PaginationState;
}
interface DataGridContextValue {
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
interface DataGridProps<TData> {
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

declare function DataGrid<TData>({ density, rowPadding, rowHeight, striped, hoverable, theme, persistenceKey, ...props }: DataGridProps<TData>): react.JSX.Element;

export { type ColumnFilterType, DataGrid, type DataGridAppearance, type DataGridColumnDef, type DataGridContextValue, type DataGridProps, type DataGridState, type DataGridTheme, type DataGridThemeTokens, type Density, type RowAction, type RowPadding, type RowPaddingPreset };
