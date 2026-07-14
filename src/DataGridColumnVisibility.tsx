import { useEffect } from 'react';
import type { Table } from '@tanstack/react-table';

interface DataGridColumnVisibilityProps<TData> {
  table: Table<TData>;
  id?: string;
  onClose?: () => void;
}

function columnLabel<TData>(column: ReturnType<Table<TData>['getAllLeafColumns']>[number]): string {
  const header = column.columnDef.header;
  if (typeof header === 'string') return header;
  if (column.id === 'selection') return 'Selection';
  if (column.id === 'row-actions') return 'Actions';
  return column.id;
}

export function DataGridColumnVisibility<TData>({
  table,
  id,
  onClose,
}: DataGridColumnVisibilityProps<TData>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="sdg__menu" id={id} role="group" aria-label="Toggle columns">
      <p className="sdg__menu-title">Toggle Columns</p>
      <div className="sdg__menu-list">
        {table.getAllLeafColumns().map((column) => (
          <label key={column.id} className="sdg__menu-item">
            <input
              type="checkbox"
              className="sdg__checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            {columnLabel(column)}
          </label>
        ))}
      </div>
    </div>
  );
}
