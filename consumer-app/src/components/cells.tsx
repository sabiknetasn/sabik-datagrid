import type { ReactNode } from 'react';

/** Explicit cell props — library ColumnDef intersection can erase inference under tsc. */
export type CellProps<TData> = {
  row: { original: TData };
  getValue: () => unknown;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const currencyExact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatCurrency(value: number, exact = false): string {
  return (exact ? currencyExact : currency).format(value);
}

export function formatDate(value: string): string {
  return dateFmt.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFmt.format(new Date(value));
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarCell({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <div className="cell-person">
      <span className="avatar" aria-hidden="true">
        {initials(name)}
      </span>
      <span className="cell-person__text">
        <span className="cell-person__name">{name}</span>
        {subtitle ? <span className="cell-person__sub">{subtitle}</span> : null}
      </span>
    </div>
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const toneClass: Record<Tone, string> = {
  neutral: 'badge badge--neutral',
  success: 'badge badge--success',
  warning: 'badge badge--warning',
  danger: 'badge badge--danger',
  info: 'badge badge--info',
  accent: 'badge badge--accent',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={toneClass[tone]}>{children}</span>;
}

export function EmptyIllustration({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="state-panel">
      <div className="state-panel__icon" aria-hidden="true">
        ⌀
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}

export function LoadingIllustration() {
  return (
    <div className="state-panel state-panel--loading">
      <div className="spinner" aria-hidden="true" />
      <h3>Loading records</h3>
      <p>Fetching the latest data from the demo workspace…</p>
    </div>
  );
}
