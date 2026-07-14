import React, { useMemo } from 'react';
import { Row, Table, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DATAGRID_CONSTANTS, resolveRowHeight } from './constants';
import { useDataGridContext } from './DataGridProvider';
import { DataGridRowActions } from './DataGridRowActions';
import { RowAction } from './types';

interface DataGridBodyVirtualProps<TData> {
  table: Table<TData>;
  scrollElement: HTMLDivElement | null;
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

export function DataGridBodyVirtual<TData>({
  table,
  scrollElement,
  onRowClick,
  onRowDoubleClick,
  rowActions,
}: DataGridBodyVirtualProps<TData>) {
  const { density, appearance } = useDataGridContext<TData>();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];
  const rowHeight = resolveRowHeight(appearance.rowHeight, density);
  const striped = appearance.striped ?? false;
  const hoverable = appearance.hoverable ?? false;

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    overscan: 8,
    enabled: !!scrollElement,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;
  const colSpan = table.getVisibleLeafColumns().length + (rowActions?.length ? 1 : 0);

  const rowStyle = useMemo(
    () => ({ minHeight: `${rowHeight}px` }),
    [rowHeight]
  );

  return (
    <tbody className="sdg__tbody">
      {paddingTop > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingTop, padding: 0, border: 'none' }} />
        </tr>
      )}
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>;
        return (
          <tr
            key={row.id}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            onClick={() => onRowClick?.(row.original)}
            onDoubleClick={() => onRowDoubleClick?.(row.original)}
            className={buildRowClassName(row.getIsSelected(), striped, hoverable)}
            role="row"
            aria-selected={row.getIsSelected()}
            style={{ ...rowStyle, height: `${virtualRow.size}px` }}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`sdg__td ${densityClass}`}
                style={{ width: cell.column.getSize() }}
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
        );
      })}
      {paddingBottom > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingBottom, padding: 0, border: 'none' }} />
        </tr>
      )}
    </tbody>
  );
}
