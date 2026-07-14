import React from 'react';
import { Table } from '@tanstack/react-table';
import { DataGridColumnVisibility } from './DataGridColumnVisibility';

export const DataGridToolbar: React.FC<{ 
  table: Table<any>; 
  searchable?: boolean; 
  filterable?: boolean; 
  exportable?: boolean;
  onExport?: (type: 'csv' | 'excel' | 'print') => void;
}> = ({ table, searchable, filterable, exportable, onExport }) => {
  const [showVisibility, setShowVisibility] = React.useState(false);

  return (
    <div className="sdg__toolbar">
      <div className="sdg__toolbar-group">
        {searchable && (
          <div className="sdg__search">
            <div className="sdg__search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text"
              placeholder="Search records..."
              value={(table.getState().globalFilter as string) || ''}
              onChange={e => table.setGlobalFilter(e.target.value)}
              className="sdg__search-input"
            />
          </div>
        )}
      </div>
      
      <div className="sdg__toolbar-group">
        {filterable && (
          <button 
            type="button"
            onClick={() => table.setColumnFilters([])}
            className="sdg__btn"
          >
            Reset Filters
          </button>
        )}
        <button 
          type="button"
          onClick={() => setShowVisibility(!showVisibility)}
          className="sdg__btn"
        >
          Columns
        </button>
        {exportable && (
          <button
            type="button"
            className="sdg__btn sdg__btn--primary"
            onClick={() => onExport?.('csv')}
          >
            Export
          </button>
        )}
      </div>

      {showVisibility && <DataGridColumnVisibility table={table} />}
    </div>
  );
};
