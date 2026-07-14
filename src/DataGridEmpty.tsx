import type { ReactNode } from 'react';

export function DataGridEmpty({ customEmptyState }: { customEmptyState?: ReactNode }) {
  return (
    <div className="sdg__status" role="status" aria-live="polite">
      {customEmptyState || (
        <div className="sdg__status-text">
          <p>No records found</p>
        </div>
      )}
    </div>
  );
}
