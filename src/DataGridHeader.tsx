import { Fragment, type SyntheticEvent } from 'react';
import { flexRender, type Header, type Table } from '@tanstack/react-table';
import { DATAGRID_CONSTANTS } from './constants';
import { useDataGridContext } from './DataGridProvider';
import type { ColumnFilterType, DataGridColumnDef } from './types';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';

interface DataGridHeaderProps<TData> {
  table: Table<TData>;
  filterable?: boolean;
  stickyHeader?: boolean;
}

function getColumnFilterType<TData>(columnDef: DataGridColumnDef<TData>): ColumnFilterType {
  return columnDef.filterType ?? 'string';
}

function ColumnFilterCell<TData>({ header }: { header: Header<TData, unknown> }) {
  const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
  const filterType = getColumnFilterType(columnDef);
  const filterValue = header.column.getFilterValue();
  const committed = filterValue === undefined || filterValue === null ? '' : String(filterValue);
  const label = `Filter ${typeof columnDef.header === 'string' ? columnDef.header : header.id}`;
  const stopPropagation = (e: SyntheticEvent) => e.stopPropagation();

  const [localValue, setLocalValue] = useDebouncedCallback(committed, (next) => {
    header.column.setFilterValue(next === '' ? undefined : next);
  });

  if (filterType === 'boolean') {
    return (
      <select
        className="sdg__col-filter sdg__col-filter--select"
        value={committed === '' ? 'all' : committed}
        onChange={(e) => {
          const val = e.target.value;
          header.column.setFilterValue(val === 'all' ? undefined : val);
        }}
        onClick={stopPropagation}
        aria-label={label}
      >
        <option value="all">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (filterType === 'number') {
    return (
      <input
        type="number"
        className="sdg__col-filter"
        placeholder="="
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onClick={stopPropagation}
        aria-label={label}
      />
    );
  }

  return (
    <input
      type="search"
      className="sdg__col-filter"
      placeholder="Search…"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onClick={stopPropagation}
      aria-label={label}
    />
  );
}

function ariaSortValue(sorted: false | 'asc' | 'desc'): 'none' | 'ascending' | 'descending' {
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

export function DataGridHeader<TData>({ table, filterable, stickyHeader }: DataGridHeaderProps<TData>) {
  const { density } = useDataGridContext();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];

  return (
    <thead className={`sdg__thead ${stickyHeader ? 'sdg__thead--sticky' : ''}`}>
      {table.getHeaderGroups().map((headerGroup) => (
        <Fragment key={headerGroup.id}>
          <tr className="sdg__header-row">
            {headerGroup.headers.map((header) => {
              const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
              const canSort = header.column.getCanSort() && columnDef.sortable !== false;
              const sorted = header.column.getIsSorted();

              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`sdg__th ${densityClass}`}
                  style={{ width: header.getSize() }}
                  aria-sort={canSort ? ariaSortValue(sorted) : undefined}
                  scope="col"
                >
                  {canSort ? (
                    <button
                      type="button"
                      className="sdg__th-inner sdg__th-inner--sortable sdg__th-sort-btn"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="sdg__th-label">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span className="sdg__sort" aria-hidden="true">
                        <span className={sorted === 'asc' ? 'sdg__sort-active' : ''}>▲</span>
                        <span className={sorted === 'desc' ? 'sdg__sort-active' : ''}>▼</span>
                      </span>
                    </button>
                  ) : (
                    <div className="sdg__th-inner">
                      <span className="sdg__th-label">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    </div>
                  )}

                  {header.column.id !== 'selection' && header.column.id !== 'row-actions' ? (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="sdg__resize"
                      aria-hidden="true"
                    />
                  ) : null}
                </th>
              );
            })}
          </tr>
          {filterable ? (
            <tr className="sdg__filter-row">
              {headerGroup.headers.map((header) => {
                const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
                const systemCol =
                  header.column.id === 'selection' || header.column.id === 'row-actions';
                const columnFilterable = !systemCol && columnDef.filterable !== false;

                return (
                  <th
                    key={`${header.id}-filter`}
                    colSpan={header.colSpan}
                    className={`sdg__th sdg__th--filter ${densityClass}`}
                    style={{ width: header.getSize() }}
                  >
                    {columnFilterable ? <ColumnFilterCell header={header} /> : null}
                  </th>
                );
              })}
            </tr>
          ) : null}
        </Fragment>
      ))}
    </thead>
  );
}
