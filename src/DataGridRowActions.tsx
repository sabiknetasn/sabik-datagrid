import { useEffect, useRef, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import type { RowAction } from './types';

export function DataGridRowActions<TData>({
  row,
  actions,
}: {
  row: Row<TData>;
  actions: RowAction<TData>[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <div className="sdg__actions" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="sdg__actions-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Row actions"
      >
        <span aria-hidden="true">⋮</span>
      </button>

      {isOpen ? (
        <>
          <div
            className="sdg__actions-backdrop"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div className="sdg__actions-menu" role="menu">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row.original);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`sdg__actions-item ${action.danger ? 'sdg__actions-item--danger' : ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
