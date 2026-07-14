import type { Table } from '@tanstack/react-table';
import type { RowAction } from './types';

interface BulkActionsProps<TData> {
  table: Table<TData>;
  actions: RowAction<TData>[];
  onBulkAction: (action: RowAction<TData>, selectedRows: TData[]) => void;
}

export function DataGridBulkToolbar<TData>({
  table,
  actions,
  onBulkAction,
}: BulkActionsProps<TData>) {
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  if (selectedRows.length === 0) return null;

  return (
    <div className="sdg__bulk" role="region" aria-label="Bulk actions">
      <div className="sdg__bulk-meta">
        <span className="sdg__bulk-count">{selectedRows.length}</span>
        <span>rows selected</span>
      </div>

      <div className="sdg__toolbar-group">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onBulkAction(action, selectedRows)}
            className={`sdg__btn ${action.danger ? 'sdg__btn--danger' : ''}`}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => table.toggleAllRowsSelected(false)}
          className="sdg__btn sdg__btn--ghost"
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}
