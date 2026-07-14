import { Fragment, type CSSProperties, type SyntheticEvent } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, type Header, type Table } from '@tanstack/react-table';
import { DATAGRID_CONSTANTS } from './constants';
import { useDataGridContext } from './DataGridProvider';
import type { ColumnFilterType, DataGridColumnDef } from './types';
import { useDebouncedCallback } from './hooks/useDebouncedCallback';
import { getColumnPinningStyle, isSystemColumnId } from './utils/columnLayout';

interface DataGridHeaderProps<TData> {
  table: Table<TData>;
  filterable?: boolean;
  stickyHeader?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
}

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
}

function getColumnFilterType<TData>(columnDef: DataGridColumnDef<TData>): ColumnFilterType {
  return columnDef.filterType ?? 'string';
}

function ColumnFilterCell<TData>({ header }: { header: Header<TData, unknown> }) {
  const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
  const filterType = getColumnFilterType(columnDef);
  const filterValue = header.column.getFilterValue();
  const committed = filterValue === undefined || filterValue === null ? '' : String(filterValue);
  const label = `Filter ${typeof columnDef.header === 'string' ? columnDef.header : header.id}`;
  const stopPropagation = (e: SyntheticEvent) => e.stopPropagation();

  const [localValue, setLocalValue] = useDebouncedCallback(committed, (next) => {
    header.column.setFilterValue(next === '' ? undefined : next);
  });

  if (filterType === 'boolean') {
    return (
      <select
        className="sdg__col-filter sdg__col-filter--select"
        value={committed === '' ? 'all' : committed}
        onChange={(e) => {
          const val = e.target.value;
          header.column.setFilterValue(val === 'all' ? undefined : val);
        }}
        onClick={stopPropagation}
        aria-label={label}
      >
        <option value="all">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (filterType === 'number') {
    return (
      <input
        type="number"
        className="sdg__col-filter"
        placeholder="="
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onClick={stopPropagation}
        aria-label={label}
      />
    );
  }

  return (
    <input
      type="search"
      className="sdg__col-filter"
      placeholder="Search…"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onClick={stopPropagation}
      aria-label={label}
    />
  );
}

function ariaSortValue(sorted: false | 'asc' | 'desc'): 'none' | 'ascending' | 'descending' {
  if (sorted === 'asc') return 'ascending';
  if (sorted === 'desc') return 'descending';
  return 'none';
}

function HeaderTh<TData>({
  header,
  densityClass,
  resizable,
  reorderable,
  nodeRef,
  style,
  dragHandle,
}: {
  header: Header<TData, unknown>;
  densityClass: string;
  resizable?: boolean;
  reorderable?: boolean;
  nodeRef?: (node: HTMLElement | null) => void;
  style?: CSSProperties;
  dragHandle?: DragHandleProps;
}) {
  const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
  const canSort = header.column.getCanSort() && columnDef.sortable !== false;
  const sorted = header.column.getIsSorted();
  const system = isSystemColumnId(header.column.id);
  const canResize =
    Boolean(resizable) &&
    !system &&
    columnDef.enableResizing !== false &&
    header.column.getCanResize();
  const pinStyle = getColumnPinningStyle(header.column);
  const pinned = header.column.getIsPinned();

  return (
    <th
      ref={nodeRef}
      colSpan={header.colSpan}
      className={`sdg__th ${densityClass}${pinned ? ` sdg__th--pinned-${pinned}` : ''}${
        header.column.getIsResizing() ? ' sdg__th--resizing' : ''
      }`}
      style={{ width: header.getSize(), ...pinStyle, ...style }}
      aria-sort={canSort ? ariaSortValue(sorted) : undefined}
      scope="col"
      data-column-id={header.column.id}
    >
      <div className="sdg__th-content">
        {reorderable && !system && dragHandle ? (
          <button
            type="button"
            className="sdg__drag-handle"
            ref={dragHandle.setActivatorNodeRef}
            aria-label={`Reorder ${typeof columnDef.header === 'string' ? columnDef.header : header.column.id} column`}
            {...dragHandle.attributes}
            {...dragHandle.listeners}
          >
            <span aria-hidden="true">⠿</span>
          </button>
        ) : null}

        {canSort ? (
          <button
            type="button"
            className="sdg__th-inner sdg__th-inner--sortable sdg__th-sort-btn"
            onClick={header.column.getToggleSortingHandler()}
          >
            <span className="sdg__th-label">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
            <span className="sdg__sort" aria-hidden="true">
              <span className={sorted === 'asc' ? 'sdg__sort-active' : ''}>▲</span>
              <span className={sorted === 'desc' ? 'sdg__sort-active' : ''}>▼</span>
            </span>
          </button>
        ) : (
          <div className="sdg__th-inner">
            <span className="sdg__th-label">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>
          </div>
        )}
      </div>

      {canResize ? (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={`sdg__resize${header.column.getIsResizing() ? ' sdg__resize--active' : ''}`}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${typeof columnDef.header === 'string' ? columnDef.header : header.column.id} column`}
          tabIndex={0}
        />
      ) : null}
    </th>
  );
}

function SortableHeaderTh<TData>({
  header,
  densityClass,
  resizable,
}: {
  header: Header<TData, unknown>;
  densityClass: string;
  resizable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: header.column.id,
      disabled: isSystemColumnId(header.column.id),
    });

  return (
    <HeaderTh
      header={header}
      densityClass={densityClass}
      resizable={resizable}
      reorderable
      nodeRef={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.75 : undefined,
        zIndex: isDragging ? 5 : undefined,
      }}
      dragHandle={{ attributes, listeners, setActivatorNodeRef }}
    />
  );
}

export function DataGridHeader<TData>({
  table,
  filterable,
  stickyHeader,
  resizable = true,
  reorderable = false,
}: DataGridHeaderProps<TData>) {
  const { density, state } = useDataGridContext();
  const densityClass = DATAGRID_CONSTANTS.DENSITY_CLASSES[density];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const leafIds = table.getAllLeafColumns().map((c) => c.id);
  const order = state.columnOrder.length ? state.columnOrder : leafIds;
  const sortableIds = order.filter((id) => !isSystemColumnId(id));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = state.columnOrder.length ? [...state.columnOrder] : [...leafIds];
    const oldIndex = current.indexOf(String(active.id));
    const newIndex = current.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    if (isSystemColumnId(String(active.id)) || isSystemColumnId(String(over.id))) return;

    table.setColumnOrder(arrayMove(current, oldIndex, newIndex));
  };

  return (
    <thead className={`sdg__thead ${stickyHeader ? 'sdg__thead--sticky' : ''}`}>
      {table.getHeaderGroups().map((headerGroup) => {
        const headers = headerGroup.headers;

        const cells = headers.map((header) =>
          reorderable && !isSystemColumnId(header.column.id) ? (
            <SortableHeaderTh
              key={header.id}
              header={header}
              densityClass={densityClass}
              resizable={resizable}
            />
          ) : (
            <HeaderTh
              key={header.id}
              header={header}
              densityClass={densityClass}
              resizable={resizable}
            />
          )
        );

        const headerRow = reorderable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
              <tr className="sdg__header-row">{cells}</tr>
            </SortableContext>
          </DndContext>
        ) : (
          <tr className="sdg__header-row">{cells}</tr>
        );

        return (
          <Fragment key={headerGroup.id}>
            {headerRow}
            {filterable ? (
              <tr className="sdg__filter-row">
                {headers.map((header) => {
                  const columnDef = header.column.columnDef as DataGridColumnDef<TData>;
                  const systemCol = isSystemColumnId(header.column.id);
                  const columnFilterable = !systemCol && columnDef.filterable !== false;
                  const pinStyle = getColumnPinningStyle(header.column);
                  const pinned = header.column.getIsPinned();

                  return (
                    <th
                      key={`${header.id}-filter`}
                      colSpan={header.colSpan}
                      className={`sdg__th sdg__th--filter ${densityClass}${
                        pinned ? ` sdg__th--pinned-${pinned}` : ''
                      }`}
                      style={{ width: header.getSize(), ...pinStyle }}
                    >
                      {columnFilterable ? <ColumnFilterCell header={header} /> : null}
                    </th>
                  );
                })}
              </tr>
            ) : null}
          </Fragment>
        );
      })}
    </thead>
  );
}
