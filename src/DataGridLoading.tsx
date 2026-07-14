import type { ReactNode } from 'react';

export function DataGridLoading({ customLoadingState }: { customLoadingState?: ReactNode }) {
  return (
    <div className="sdg__status" role="status" aria-live="polite" aria-busy="true">
      {customLoadingState || (
        <div className="sdg__toolbar-group" style={{ flexDirection: 'column' }}>
          <div className="sdg__spinner" aria-hidden="true" />
          <p className="sdg__status-text">Loading data...</p>
        </div>
      )}
    </div>
  );
}
