import React from 'react';
import { Table } from '@tanstack/react-table';

export const DataGridSelectionColumn: React.FC<{ table: Table<any> }> = ({ table }) => {
  return (
    <th 
      className="w-12 border-b border-gray-200 dark:border-slate-700 px-4 py-2"
      style={{ width: 48 }}
    >
      <input 
        type="checkbox" 
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    </th>
  );
};

export const DataGridSelectionCell: React.FC<{ row: any }> = ({ row }) => {
  return (
    <td className="border-r border-gray-100 dark:border-slate-700 px-4 py-2">
      <input 
        type="checkbox" 
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={row.getIsSelected()} 
        onChange={row.getToggleSelectedHandler()} 
      />
    </td>
  );
};
