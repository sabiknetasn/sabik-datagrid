import type { Column } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

const SYSTEM_COLUMNS = new Set(['selection', 'row-actions']);

export function isSystemColumnId(id: string): boolean {
  return SYSTEM_COLUMNS.has(id);
}

/** Sticky styles for left/right pinned columns (TanStack pinning offsets). */
export function getColumnPinningStyle<TData>(column: Column<TData, unknown>): CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};

  const isLastLeft = pinned === 'left' && column.getIsLastColumn('left');
  const isFirstRight = pinned === 'right' && column.getIsFirstColumn('right');

  return {
    position: 'sticky',
    left: pinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: pinned === 'left' ? 2 : 1,
    boxShadow: isLastLeft
      ? '2px 0 4px -2px rgba(15, 23, 42, 0.15)'
      : isFirstRight
        ? '-2px 0 4px -2px rgba(15, 23, 42, 0.15)'
        : undefined,
  };
}

export function buildInitialColumnPinning(
  columns: { id?: string; accessorKey?: string | number | symbol; pin?: 'left' | 'right' }[]
): { left?: string[]; right?: string[] } {
  const left: string[] = [];
  const right: string[] = [];

  for (const col of columns) {
    const id =
      col.id ??
      (typeof col.accessorKey === 'string' || typeof col.accessorKey === 'number'
        ? String(col.accessorKey)
        : undefined);
    if (!id || isSystemColumnId(id) || !col.pin) continue;
    if (col.pin === 'left') left.push(id);
    if (col.pin === 'right') right.push(id);
  }

  return {
    left: left.length ? left : undefined,
    right: right.length ? right : undefined,
  };
}
