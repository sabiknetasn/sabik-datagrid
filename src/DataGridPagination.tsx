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
        <span className="sdg__page-num">{pageCount}</span>
      </div>
      
      <div className="sdg__pagination-controls">
        <label className="sdg__page-size-label">
          <span className="sdg__visually-hidden">Rows per page</span>
          <select 
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="sdg__select"
            aria-label="Rows per page"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size} rows / page</option>
            ))}
          </select>
        </label>
        
        <div className="sdg__toolbar-group">
          <button 
            type="button"
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="sdg__btn"
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <button 
            type="button"
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="sdg__btn"
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
