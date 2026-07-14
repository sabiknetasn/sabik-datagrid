import React from 'react';
import { Row } from '@tanstack/react-table';
import { RowAction } from './types';

export const DataGridRowActions = <TData,>({ 
  row, 
  actions, 
}: { 
  row: Row<TData>; 
  actions: RowAction<TData>[]; 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="sdg__actions">
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="sdg__actions-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        ⋮
      </button>
      
      {isOpen && (
        <>
          <div 
            className="sdg__actions-backdrop" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
          />
          <div className="sdg__actions-menu" role="menu">
            {actions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row.original);
                  setIsOpen(false);
                }}
                className={`sdg__actions-item ${action.danger ? 'sdg__actions-item--danger' : ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
