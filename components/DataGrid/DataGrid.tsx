import React, { useMemo, useState, useEffect, useCallback, CSSProperties } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  ColumnDef,
  FilterFn,
} from '@tanstack/react-table';
import { DataGridProvider, useDataGridContext } from './DataGridProvider';
import { DataGridColumnDef, DataGridProps } from './types';
import { DataGridHeader } from './DataGridHeader';
import { DataGridBody } from './DataGridBody';
import { DataGridBodyVirtual } from './DataGridBodyVirtual';
import { DataGridPagination } from './DataGridPagination';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridLoading } from './DataGridLoading';
import { DataGridEmpty } from './DataGridEmpty';
import { DataGridError } from './DataGridError';
import { DataGridBulkToolbar } from './DataGridBulkToolbar';
import { DataGridSkeleton } from './DataGridSkeleton';
import { COLUMN_FILTER_FNS, getFilterFnName, resolveRowPaddingVars } from './constants';

function DataGridCore<TData>({ 
  data, 
  columns: baseColumns, 
  loading, 
  error, 
  emptyState, 
  loadingState, 
  errorState,
  searchable,
  filterable,
  pagination: showPagination,
  selectable,
  exportable,
  toolbar: showToolbar,
  stickyHeader,
  virtualized,
  manualPagination,
  manualSorting,
  manualFiltering,
  rowActions,
  bulkActions,
  onBulkAction,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPaginationChange,
  onExport,
  className,
  ariaLabel,
  getRowId,
  pageCount,
  rowCount,
}: DataGridProps<TData>) {
  const context = useDataGridContext<TData>();
  const { 
    state, 
    setSorting, 
    setColumnFilters, 
    setGlobalFilter, 
    setColumnVisibility, 
    setRowSelection, 
    setPagination,
    density,
    themeStyle,
    appearance,
  } = context;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollElement(node);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const columns = useMemo((): ColumnDef<TData, unknown>[] => {
    const enriched = baseColumns.map((col): ColumnDef<TData, unknown> => {
      const def = col as DataGridColumnDef<TData>;
      const filterType = def.filterType ?? 'string';
      const enableFilter = Boolean(filterable) && def.filterable !== false && def.id !== 'selection';
      const filterFn: FilterFn<TData> | undefined = enableFilter
        ? (COLUMN_FILTER_FNS[getFilterFnName(filterType)] as FilterFn<TData>)
        : undefined;

      return {
        ...def,
        enableSorting: def.sortable !== false,
        enableColumnFilter: enableFilter,
        filterFn,
      };
    });

    if (!selectable) return enriched;

    const selectionColumn: ColumnDef<TData, unknown> = {
      id: 'selection',
      enableColumnFilter: false,
      enableSorting: false,
      header: ({ table }) => (
        <input 
          type="checkbox" 
          className="sdg__checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input 
          type="checkbox" 
          className="sdg__checkbox"
          checked={row.getIsSelected()} 
          onChange={row.getToggleSelectedHandler()}
          aria-label="Select row"
        />
      ),
      size: 40,
    };

    return [selectionColumn, ...enriched];
  }, [baseColumns, selectable, filterable]);

  const table = useReactTable({
    data,
    columns,
    filterFns: COLUMN_FILTER_FNS,
    getRowId,
    pageCount,
    rowCount,
    state: {
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      pagination: state.pagination,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.sorting) : updater;
      setSorting(next);
      onSortChange?.(next);
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnFilters) : updater;
      setColumnFilters(next);
      onFilterChange?.(next, state.globalFilter);
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.globalFilter) : updater;
      setGlobalFilter(next);
      onFilterChange?.(state.columnFilters, next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnVisibility) : updater;
      setColumnVisibility(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.rowSelection) : updater;
      setRowSelection(next);
      onSelectionChange?.(next);
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.pagination) : updater;
      setPagination(next);
      onPaginationChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: virtualized ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: virtualized ? true : manualPagination,
    manualSorting: manualSorting,
    manualFiltering: manualFiltering,
    enableRowSelection: selectable,
    enableGlobalFilter: searchable,
  });

  const rootStyle = useMemo((): CSSProperties => ({
    ...themeStyle,
    ...resolveRowPaddingVars(appearance.rowPadding),
  }), [themeStyle, appearance.rowPadding]);

  if (error) return <DataGridError error={error} customErrorState={errorState} />;

  // Soft loading: keep chrome when rows already exist (enterprise refetch UX).
  const softLoading = Boolean(loading) && data.length > 0;
  if (loading && !softLoading) {
    return (
      <DataGridLoading
        customLoadingState={loadingState || <DataGridSkeleton colCount={columns.length} density={density} />}
      />
    );
  }

  if (data.length === 0) return <DataGridEmpty customEmptyState={emptyState} />;

  return (
    <div
      className={`sdg ${isFullscreen ? 'sdg--fullscreen' : ''} ${className || ''}`}
      style={rootStyle}
    >
      <div className="sdg__chrome">
        {showToolbar && (
          <DataGridToolbar
            table={table}
            searchable={searchable}
            filterable={filterable}
            exportable={exportable}
            onExport={onExport}
          />
        )}
        <button 
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="sdg__icon-btn"
          title="Toggle Fullscreen"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {isFullscreen ? <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/> : <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16V19a2 2 0 0 0 2 2h3"/>}
          </svg>
        </button>
      </div>

      {selectable && (
        <DataGridBulkToolbar 
          table={table} 
          actions={bulkActions || []}
          onBulkAction={onBulkAction || (() => {})} 
        />
      )}
      
      <div
        ref={scrollRef}
        className={`sdg__scroll ${virtualized ? 'sdg__scroll--virtual' : ''} ${stickyHeader ? 'sdg__scroll--sticky-header' : ''}`}
      >
        {softLoading && (
          <div className="sdg__loading-overlay" role="status" aria-live="polite">
            {loadingState || (
              <div className="sdg__toolbar-group" style={{ flexDirection: 'column' }}>
                <div className="sdg__spinner" aria-hidden="true" />
                <p className="sdg__status-text">Loading…</p>
              </div>
            )}
          </div>
        )}
        <table
          className="sdg__table"
          role="table"
          aria-label={ariaLabel || 'Data grid'}
          aria-busy={softLoading || undefined}
        >
          <DataGridHeader table={table} filterable={filterable} stickyHeader={stickyHeader} />
          {virtualized ? (
            <DataGridBodyVirtual 
              table={table}
              scrollElement={scrollElement}
              onRowClick={onRowClick} 
              onRowDoubleClick={onRowDoubleClick}
              rowActions={rowActions}
            />
          ) : (
            <DataGridBody 
              table={table} 
              onRowClick={onRowClick} 
              onRowDoubleClick={onRowDoubleClick}
              rowActions={rowActions}
            />
          )}
        </table>
      </div>

      {showPagination && <DataGridPagination table={table} />}
    </div>
  );
}

export function DataGrid<TData>({ 
  density,
  rowPadding,
  rowHeight,
  striped,
  hoverable,
  theme,
  persistenceKey,
  ...props 
}: DataGridProps<TData>) {
  const appearance = useMemo(
    () => ({ rowPadding, rowHeight, striped, hoverable }),
    [rowPadding, rowHeight, striped, hoverable]
  );

  return (
    <DataGridProvider
      persistenceKey={persistenceKey}
      density={density}
      appearance={appearance}
      theme={theme}
    >
      <DataGridCore {...props} />
    </DataGridProvider>
  );
}
