import React from 'react';
import { Table } from '@tanstack/react-table';
import { RowAction } from './types';

export interface BulkActionsProps {
  table: Table<any>;
  actions: RowAction<any>[];
  onBulkAction: (action: RowAction<any>, selectedRows: any[]) => void;
}

export const DataGridBulkToolbar: React.FC<BulkActionsProps> = ({ table, actions, onBulkAction }) => {
  const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
  
  if (selectedRows.length === 0) return null;

  return (
    <div className="sdg__bulk">
      <div className="sdg__bulk-meta">
        <span className="sdg__bulk-count">{selectedRows.length}</span>
        <span>rows selected</span>
      </div>
      
      <div className="sdg__toolbar-group">
        {actions.map((action, idx) => (
          <button
            key={idx}
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
};
