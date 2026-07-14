import React from 'react';
import { Table } from '@tanstack/react-table';
import { DataGridContextValue } from '../types';
import { useDataGridContext } from '../DataGridProvider';

export interface AdvancedFilterProps {
  columnId: string;
  value: any;
  onChange: (value: any) => void;
  type: 'date-range' | 'multi-select' | 'number-range' | 'boolean';
  options?: { label: string; value: any }[];
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ 
  value, 
  onChange, 
  type, 
  options 
}) => {
  switch (type) {
    case 'date-range':
      return (
        <div className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-800 border rounded shadow-sm">
          <input 
            type="date" 
            className="text-xs border rounded px-1 py-1 dark:bg-slate-700 dark:text-white"
            value={value?.start || ''} 
            onChange={e => onChange({ ...value, start: e.target.value })} 
          />
          <input 
            type="date" 
            className="text-xs border rounded px-1 py-1 dark:bg-slate-00 dark:text-white"
            value={value?.end || ''} 
            onChange={e => onChange({ ...value, end: e.target.value })} 
          />
        </div>
      );
    case 'multi-select':
      return (
        <div className="flex flex-col gap-1 p-2 max-h-40 overflow-auto bg-white dark:bg-slate-800 border rounded shadow-sm">
          {options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer text-gray-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={value?.includes(opt.value)} 
                onChange={e => {
                  const next = e.target.checked 
                    ? [...(value || []), opt.value] 
                    : value?.filter((v: any) => v !== opt.value);
                  onChange(next);
                }} 
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    case 'number-range':
      return (
        <div className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-800 border rounded shadow-sm">
          <input 
            type="number" 
            placeholder="Min" 
            className="text-xs border rounded px-1 py-1 dark:bg-slate-00 dark:text-white"
            value={value?.min || ''} 
            onChange={e => onChange({ ...value, min: e.target.value })} 
          />
          <input 
            type="number" 
            placeholder="Max" 
            className="text-xs border rounded px-1 py-1 dark:bg-slate-00 dark:text-white"
            value={value?.max || ''} 
            onChange={e => onChange({ ...value, max: e.target.value })} 
          />
        </div>
      );
    case 'boolean':
      return (
        <div className="flex gap-2 p-2 bg-white dark:bg-slate-800 border rounded shadow-sm">
          {[true, false].map(val => (
            <button 
              key={String(val)}
              onClick={() => onChange(val)}
              className={`text-xs px-2 py-1 rounded border ${value === val ? 'bg-blue-600 text-white' : 'bg-transparent'}`}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      );
    default:
      return null;
  }
};
