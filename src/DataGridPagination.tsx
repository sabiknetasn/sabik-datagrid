import type { Table } from '@tanstack/react-table';

export function DataGridPagination<TData>({ table }: { table: Table<TData> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="sdg__pagination" role="navigation" aria-label="Table pagination">
      <div className="sdg__pagination-meta" aria-live="polite">
        <span>Page</span>
        <span className="sdg__page-num">{pageIndex + 1}</span>
        <span>of</span>
        <span className="sdg__page-num">{Math.max(pageCount, 1)}</span>
      </div>

      <div className="sdg__pagination-controls">
        <label className="sdg__page-size-label">
          <span>Rows</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="sdg__select"
            aria-label="Rows per page"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="sdg__toolbar-group">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="sdg__btn sdg__btn--icon"
            aria-label="Go to previous page"
          >
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
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="sdg__btn sdg__btn--icon"
            aria-label="Go to next page"
          >
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
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
