import React, { useMemo } from 'react';
import { Row, Table, flexRender } from '@tanstack/react-table';
import { DATAGRID_CONSTANTS, resolveRowHeight } from './constants';
import { useDataGridContext } from './DataGridProvider';
import { DataGridRowActions } from './DataGridRowActions';
import { RowAction } from './types';

interface DataGridBodyProps<TData> {
  table: Table<TData>;
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
  rowActions?: RowAction<TData>[];
}

function buildRowClassName(isSelected: boolean, striped: boolean, hoverable: boolean): string {
  const classes = ['sdg__tr'];
  if (striped) classes.push('sdg__tr--zebra');
  if (hoverable) classes.push('sdg__tr--hoverable');
  if (isSelected) classes.push('sdg__tr--selected');
  return classes.join(' ');
}

export function DataGridBody<TData>({
  table,
  onRowClick,
  onRowDoubleClick,
  rowActions,
}: DataGridBodyProps<TData>) {
  const { density, appearance } = useDataGridContext<TData>();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];
  const rowHeight = resolveRowHeight(appearance.rowHeight, density);
  const striped = appearance.striped ?? false;
  const hoverable = appearance.hoverable ?? false;

  const rowStyle = useMemo(
    () => (appearance.rowHeight ? { height: `${rowHeight}px` } : undefined),
    [appearance.rowHeight, rowHeight]
  );

  return (
    <tbody className="sdg__tbody">
      {table.getRowModel().rows.map((row: Row<TData>) => (
        <tr 
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
          onDoubleClick={() => onRowDoubleClick?.(row.original)}
          className={buildRowClassName(row.getIsSelected(), striped, hoverable)}
          style={rowStyle}
          role="row"
          aria-selected={row.getIsSelected()}
        >
          {row.getVisibleCells().map((cell) => (
            <td 
              key={cell.id} 
              className={`sdg__td ${densityClass}`}
              role="cell"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
          {rowActions && rowActions.length > 0 && (
            <td className={`sdg__td sdg__td--actions ${densityClass}`}>
              <DataGridRowActions row={row} actions={rowActions} />
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}
