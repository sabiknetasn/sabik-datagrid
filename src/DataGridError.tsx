import type { ReactNode } from 'react';

export function DataGridError({
  error,
  customErrorState,
}: {
  error: Error | string | null | undefined;
  customErrorState?: ReactNode;
}) {
  const message =
    typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error';

  return (
    <div className="sdg__status" role="alert" aria-live="assertive">
      {customErrorState || (
        <div className="sdg__status-error">
          <p style={{ fontWeight: 700 }}>Error occurred</p>
          <p style={{ fontSize: '0.875rem' }}>{message}</p>
        </div>
      )}
    </div>
  );
}
