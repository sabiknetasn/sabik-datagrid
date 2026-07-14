import React from 'react';

export const DataGridError: React.FC<{ error: any; customErrorState?: React.ReactNode }> = ({ error, customErrorState }) => (
  <div className="sdg__status">
    {customErrorState || (
      <div className="sdg__status-error">
        <p style={{ fontWeight: 700 }}>Error occurred</p>
        <p style={{ fontSize: '0.875rem' }}>{typeof error === 'string' ? error : error.message}</p>
      </div>
    )}
  </div>
);
