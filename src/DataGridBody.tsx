import { useMemo } from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { DATAGRID_CONSTANTS, resolveRowHeight } from './constants';
import { useDataGridContext } from './DataGridProvider';
import { buildRowClassName } from './utils/rowClassName';

interface DataGridBodyProps<TData> {
  table: Table<TData>;
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
}

export function DataGridBody<TData>({
  table,
  onRowClick,
  onRowDoubleClick,
}: DataGridBodyProps<TData>) {
  const { density, appearance } = useDataGridContext();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];
  const rowHeight = resolveRowHeight(appearance.rowHeight, density);
  const striped = appearance.striped ?? false;
  const hoverable = appearance.hoverable ?? false;
  const selectable = Boolean(table.options.enableRowSelection);

  const rowStyle = useMemo(
    () => (appearance.rowHeight ? { height: `${rowHeight}px` } : undefined),
    [appearance.rowHeight, rowHeight]
  );

  return (
    <tbody className="sdg__tbody">
      {table.getRowModel().rows.map((row, index) => (
        <tr
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
          onDoubleClick={() => onRowDoubleClick?.(row.original)}
          className={buildRowClassName(row.getIsSelected(), striped, hoverable, index)}
          style={rowStyle}
          aria-selected={selectable ? row.getIsSelected() : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className={`sdg__td ${densityClass}${
                cell.column.id === 'row-actions' ? ' sdg__td--actions' : ''
              }`}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
