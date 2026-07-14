import { FilterFn } from '@tanstack/react-table';
import { CSSProperties } from 'react';
import { ColumnFilterType, DataGridThemeTokens, Density, RowPadding } from './types';

declare module '@tanstack/react-table' {
  interface FilterFns {
    sdgString: FilterFn<unknown>;
    sdgNumberEquals: FilterFn<unknown>;
    sdgBoolean: FilterFn<unknown>;
  }
}

export const DATAGRID_CONSTANTS = {
  STORAGE_KEY_PREFIX: 'sabik-datagrid-persistence:',
  DEFAULT_PAGE_SIZE: 10,
  DEBOUNCE_TIME: 300,
  DENSITY_CLASSES: {
    compact: 'sdg__cell--compact',
    comfortable: 'sdg__cell--comfortable',
    spacious: 'sdg__cell--spacious',
  } as Record<Density, string>,
  DEFAULT_ROW_HEIGHT: {
    compact: 32,
    comfortable: 48,
    spacious: 64,
  } as Record<Density, number>,
};

export const sdgStringFilter: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null || filterValue === '') return true;
  const value = row.getValue(columnId);
  return String(value ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
};

export const sdgNumberEqualsFilter: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null || filterValue === '') return true;
  const value = row.getValue(columnId);
  const num = Number(value);
  const target = Number(filterValue);
  if (Number.isNaN(target)) return true;
  return !Number.isNaN(num) && num === target;
};

export const sdgBooleanFilter: FilterFn<unknown> = (row, columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null || filterValue === '' || filterValue === 'all') {
    return true;
  }
  const value = row.getValue(columnId);
  if (filterValue === 'true') return value === true || value === 'true';
  if (filterValue === 'false') return value === false || value === 'false';
  return true;
};

export const COLUMN_FILTER_FNS = {
  sdgString: sdgStringFilter,
  sdgNumberEquals: sdgNumberEqualsFilter,
  sdgBoolean: sdgBooleanFilter,
};

export function getFilterFnName(filterType: ColumnFilterType): keyof typeof COLUMN_FILTER_FNS {
  switch (filterType) {
    case 'number':
      return 'sdgNumberEquals';
    case 'boolean':
      return 'sdgBoolean';
    default:
      return 'sdgString';
  }
}

export function resolveRowPaddingVars(rowPadding?: RowPadding): CSSProperties {
  if (!rowPadding) {
    return {
      '--sdg-cell-px': '1rem',
      '--sdg-cell-py': '0.5rem',
    } as CSSProperties;
  }
  if (typeof rowPadding === 'object') {
    return {
      '--sdg-cell-px': `${rowPadding.x}px`,
      '--sdg-cell-py': `${rowPadding.y}px`,
    } as CSSProperties;
  }
  const presets: Record<Exclude<RowPadding, { x: number; y: number }>, { px: string; py: string }> = {
    compact: { px: '0.5rem', py: '0.25rem' },
    comfortable: { px: '1rem', py: '0.5rem' },
    spacious: { px: '1.5rem', py: '1rem' },
  };
  const preset = presets[rowPadding];
  return {
    '--sdg-cell-px': preset.px,
    '--sdg-cell-py': preset.py,
  } as CSSProperties;
}

export function resolveThemeVars(theme?: DataGridThemeTokens): CSSProperties {
  if (!theme) return {};
  const vars: Record<string, string> = {};
  if (theme.primary) vars['--sdg-primary'] = theme.primary;
  if (theme.background) vars['--sdg-bg'] = theme.background;
  if (theme.headerBackground) vars['--sdg-header-bg'] = theme.headerBackground;
  if (theme.border) {
    vars['--sdg-border'] = theme.border;
    vars['--sdg-input'] = theme.border;
  }
  if (theme.radius) vars['--sdg-radius'] = theme.radius;
  return vars as CSSProperties;
}

export function resolveRowHeight(
  rowHeight: number | undefined,
  density: Density
): number {
  return rowHeight ?? DATAGRID_CONSTANTS.DEFAULT_ROW_HEIGHT[density];
}
