import React from 'react';
import { Table } from '@tanstack/react-table';

export const DataGridColumnVisibility: React.FC<{ table: Table<any> }> = ({ table }) => {
  return (
    <div className="sdg__menu">
      <p className="sdg__menu-title">Toggle Columns</p>
      <div className="sdg__menu-list">
        {table.getAllLeafColumns().map(column => (
          <label 
            key={column.id} 
            className="sdg__menu-item"
          >
            <input 
              type="checkbox" 
              className="sdg__checkbox"
              checked={column.getIsVisible()} 
              onChange={column.getToggleVisibilityHandler()} 
            />
            {String(column.columnDef.header ?? column.id)}
          </label>
        ))}
      </div>
    </div>
  );
};
