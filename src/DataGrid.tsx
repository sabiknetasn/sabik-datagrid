import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnPinningState,
  type FilterFn,
} from '@tanstack/react-table';
import { DataGridProvider, useDataGridContext } from './DataGridProvider';
import type { DataGridColumnDef, DataGridProps, RowAction } from './types';
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
import { DataGridRowActions } from './DataGridRowActions';
import { COLUMN_FILTER_FNS, getFilterFnName, resolveRowPaddingVars } from './constants';
import { buildInitialColumnPinning, isSystemColumnId } from './utils/columnLayout';

function getColumnId<TData>(col: DataGridColumnDef<TData>, index: number): string {
  if (col.id) return col.id;
  if ('accessorKey' in col && col.accessorKey != null) {
    return String(col.accessorKey);
  }
  return `col_${index}`;
}

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
  virtualHeight = 400,
  resizable = true,
  reorderable = false,
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
  onColumnOrderChange,
  onColumnSizingChange,
  onColumnPinningChange,
  onExport,
  className,
  ariaLabel,
  getRowId,
  pageCount,
  rowCount,
}: DataGridProps<TData>) {
  const context = useDataGridContext();
  const {
    state,
    setSorting,
    setColumnFilters,
    setGlobalFilter,
    setColumnVisibility,
    setRowSelection,
    setPagination,
    setColumnOrder,
    setColumnSizing,
    setColumnPinning,
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
    if (!isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const columns = useMemo((): ColumnDef<TData, unknown>[] => {
    const enriched = baseColumns.map((col, index): ColumnDef<TData, unknown> => {
      const def = col as DataGridColumnDef<TData>;
      const id = getColumnId(def, index);
      const filterType = def.filterType ?? 'string';
      const enableFilter =
        Boolean(filterable) && def.filterable !== false && !isSystemColumnId(id);
      const filterFn: FilterFn<TData> | undefined = enableFilter
        ? (COLUMN_FILTER_FNS[getFilterFnName(filterType)] as FilterFn<TData>)
        : undefined;

      return {
        ...def,
        id,
        enableSorting: def.sortable !== false,
        enableColumnFilter: enableFilter,
        enableResizing: def.enableResizing !== false,
        filterFn,
      };
    });

    const withSelection: ColumnDef<TData, unknown>[] = selectable
      ? [
          {
            id: 'selection',
            enableColumnFilter: false,
            enableSorting: false,
            enableHiding: false,
            enableResizing: false,
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
            minSize: 40,
            maxSize: 48,
          },
          ...enriched,
        ]
      : enriched;

    if (!rowActions?.length) return withSelection;

    const actions: RowAction<TData>[] = rowActions;
    const actionsColumn: ColumnDef<TData, unknown> = {
      id: 'row-actions',
      enableColumnFilter: false,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      header: () => <span className="sdg__visually-hidden">Actions</span>,
      cell: ({ row }) => <DataGridRowActions row={row} actions={actions} />,
      size: 56,
      minSize: 48,
      maxSize: 72,
    };

    return [...withSelection, actionsColumn];
  }, [baseColumns, selectable, filterable, rowActions]);

  // Seed order / pinning once columns are known (keep persisted values when present).
  useEffect(() => {
    const ids = columns.map((c) => String(c.id));
    if (!state.columnOrder.length) {
      setColumnOrder(ids);
    } else {
      const missing = ids.filter((id) => !state.columnOrder.includes(id));
      const pruned = state.columnOrder.filter((id) => ids.includes(id));
      if (missing.length || pruned.length !== state.columnOrder.length) {
        setColumnOrder([...pruned, ...missing]);
      }
    }

    const hasPersistedPin =
      (state.columnPinning.left?.length ?? 0) > 0 ||
      (state.columnPinning.right?.length ?? 0) > 0;
    if (!hasPersistedPin) {
      const fromDefs = buildInitialColumnPinning(
        baseColumns.map((col, index) => ({
          id: getColumnId(col, index),
          pin: col.pin,
        }))
      );
      const next: ColumnPinningState = {
        left: selectable ? ['selection', ...(fromDefs.left ?? [])] : fromDefs.left,
        right: rowActions?.length
          ? [...(fromDefs.right ?? []), 'row-actions']
          : fromDefs.right,
      };
      if ((next.left?.length ?? 0) > 0 || (next.right?.length ?? 0) > 0) {
        setColumnPinning(next);
      }
    }
    // Intentionally seed from column identity, not every state tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, selectable, rowActions, baseColumns]);

  const table = useReactTable({
    data,
    columns,
    filterFns: COLUMN_FILTER_FNS,
    getRowId,
    pageCount,
    rowCount,
    columnResizeMode: 'onChange',
    enableColumnResizing: resizable,
    defaultColumn: {
      minSize: 60,
      size: 150,
      maxSize: 560,
    },
    state: {
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      pagination: state.pagination,
      columnOrder: state.columnOrder,
      columnSizing: state.columnSizing,
      columnPinning: state.columnPinning,
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
    onColumnOrderChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnOrder) : updater;
      setColumnOrder(next);
      onColumnOrderChange?.(next);
    },
    onColumnSizingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnSizing) : updater;
      setColumnSizing(next);
      onColumnSizingChange?.(next);
    },
    onColumnPinningChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnPinning) : updater;
      setColumnPinning(next);
      onColumnPinningChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: virtualized ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: virtualized ? true : manualPagination,
    manualSorting,
    manualFiltering,
    enableRowSelection: selectable,
    enableGlobalFilter: searchable,
  });

  const rootStyle = useMemo(
    (): CSSProperties => ({
      ...themeStyle,
      ...resolveRowPaddingVars(appearance.rowPadding),
      ...(virtualized ? ({ '--sdg-virtual-height': `${virtualHeight}px` } as CSSProperties) : null),
    }),
    [themeStyle, appearance.rowPadding, virtualized, virtualHeight]
  );

  if (error) return <DataGridError error={error} customErrorState={errorState} />;

  const softLoading = Boolean(loading) && data.length > 0;
  if (loading && !softLoading) {
    return (
      <DataGridLoading
        customLoadingState={
          loadingState || <DataGridSkeleton colCount={columns.length} density={density} />
        }
      />
    );
  }

  if (data.length === 0) return <DataGridEmpty customEmptyState={emptyState} />;

  const tableWidth = table.getCenterTotalSize() + table.getLeftTotalSize() + table.getRightTotalSize();

  return (
    <div
      className={`sdg ${isFullscreen ? 'sdg--fullscreen' : ''} ${className || ''}`}
      style={rootStyle}
    >
      <div className="sdg__chrome">
        {showToolbar ? (
          <DataGridToolbar
            table={table}
            searchable={searchable}
            filterable={filterable}
            exportable={exportable}
            onExport={onExport}
          />
        ) : null}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="sdg__icon-btn"
          title="Toggle Fullscreen"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isFullscreen ? (
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            ) : (
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16V19a2 2 0 0 0 2 2h3" />
            )}
          </svg>
        </button>
      </div>

      {selectable ? (
        <DataGridBulkToolbar
          table={table}
          actions={bulkActions || []}
          onBulkAction={onBulkAction || (() => {})}
        />
      ) : null}

      <div
        ref={scrollRef}
        className={`sdg__scroll ${virtualized ? 'sdg__scroll--virtual' : ''} ${
          stickyHeader ? 'sdg__scroll--sticky-header' : ''
        }`}
      >
        {softLoading ? (
          <div className="sdg__loading-overlay" role="status" aria-live="polite">
            {loadingState || (
              <div className="sdg__toolbar-group" style={{ flexDirection: 'column' }}>
                <div className="sdg__spinner" aria-hidden="true" />
                <p className="sdg__status-text">Loading…</p>
              </div>
            )}
          </div>
        ) : null}
        <table
          className="sdg__table"
          style={{ width: tableWidth }}
          aria-label={ariaLabel || 'Data grid'}
          aria-busy={softLoading || undefined}
        >
          <DataGridHeader
            table={table}
            filterable={filterable}
            stickyHeader={stickyHeader}
            resizable={resizable}
            reorderable={reorderable}
          />
          {virtualized ? (
            <DataGridBodyVirtual
              table={table}
              scrollElement={scrollElement}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
            />
          ) : (
            <DataGridBody
              table={table}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
            />
          )}
        </table>
      </div>

      {showPagination ? <DataGridPagination table={table} /> : null}
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
