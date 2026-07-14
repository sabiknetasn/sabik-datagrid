import { useMemo } from 'react';
import { flexRender, type Row, type Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DATAGRID_CONSTANTS, resolveRowHeight } from './constants';
import { useDataGridContext } from './DataGridProvider';
import { buildRowClassName } from './utils/rowClassName';
import { getColumnPinningStyle } from './utils/columnLayout';

interface DataGridBodyVirtualProps<TData> {
  table: Table<TData>;
  scrollElement: HTMLDivElement | null;
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
}

export function DataGridBodyVirtual<TData>({
  table,
  scrollElement,
  onRowClick,
  onRowDoubleClick,
}: DataGridBodyVirtualProps<TData>) {
  const { density, appearance } = useDataGridContext();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];
  const rowHeight = resolveRowHeight(appearance.rowHeight, density);
  const striped = appearance.striped ?? false;
  const hoverable = appearance.hoverable ?? false;
  const selectable = Boolean(table.options.enableRowSelection);
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
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]!.start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1]!.end : 0;
  const colSpan = table.getVisibleLeafColumns().length;

  const rowStyle = useMemo(() => ({ minHeight: `${rowHeight}px` }), [rowHeight]);

  return (
    <tbody className="sdg__tbody">
      {paddingTop > 0 ? (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingTop, padding: 0, border: 'none' }} />
        </tr>
      ) : null}
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index] as Row<TData>;
        return (
          <tr
            key={row.id}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            onClick={() => onRowClick?.(row.original)}
            onDoubleClick={() => onRowDoubleClick?.(row.original)}
            className={buildRowClassName(
              row.getIsSelected(),
              striped,
              hoverable,
              virtualRow.index
            )}
            aria-selected={selectable ? row.getIsSelected() : undefined}
            style={{ ...rowStyle, height: `${virtualRow.size}px` }}
          >
            {row.getVisibleCells().map((cell) => {
              const pinned = cell.column.getIsPinned();
              return (
                <td
                  key={cell.id}
                  className={`sdg__td ${densityClass}${
                    cell.column.id === 'row-actions' ? ' sdg__td--actions' : ''
                  }${pinned ? ` sdg__td--pinned-${pinned}` : ''}`}
                  style={{
                    width: cell.column.getSize(),
                    ...getColumnPinningStyle(cell.column),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        );
      })}
      {paddingBottom > 0 ? (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: paddingBottom, padding: 0, border: 'none' }} />
        </tr>
      ) : null}
    </tbody>
  );
}
