import { useId, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { DataGridColumnVisibility } from './DataGridColumnVisibility';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';

interface DataGridToolbarProps<TData> {
  table: Table<TData>;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onExport?: (type: 'csv' | 'excel' | 'print') => void;
}

export function DataGridToolbar<TData>({
  table,
  searchable,
  filterable,
  exportable,
  onExport,
}: DataGridToolbarProps<TData>) {
  const [showVisibility, setShowVisibility] = useState(false);
  const menuId = useId();
  const searchId = useId();
  const globalFilter = (table.getState().globalFilter as string) || '';
  const [searchValue, setSearchValue] = useDebouncedCallback(globalFilter, (next) => {
    table.setGlobalFilter(next);
  });

  return (
    <div className="sdg__toolbar">
      <div className="sdg__toolbar-group">
        {searchable ? (
          <div className="sdg__search">
            <label className="sdg__visually-hidden" htmlFor={searchId}>
              Search records
            </label>
            <div className="sdg__search-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              id={searchId}
              type="search"
              placeholder="Search records..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="sdg__search-input"
              aria-label="Search records"
            />
          </div>
        ) : null}
      </div>

      <div className="sdg__toolbar-group">
        {filterable ? (
          <button
            type="button"
            onClick={() => table.setColumnFilters([])}
            className="sdg__btn"
          >
            Reset Filters
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setShowVisibility((open) => !open)}
          className="sdg__btn"
          aria-expanded={showVisibility}
          aria-controls={menuId}
        >
          Columns
        </button>
        {exportable ? (
          <button
            type="button"
            className="sdg__btn sdg__btn--primary"
            onClick={() => onExport?.('csv')}
          >
            Export
          </button>
        ) : null}
      </div>

      {showVisibility ? (
        <DataGridColumnVisibility table={table} id={menuId} onClose={() => setShowVisibility(false)} />
      ) : null}
    </div>
  );
}
