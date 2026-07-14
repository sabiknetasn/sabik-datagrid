import React from 'react';

export const DataGridLoading: React.FC<{ customLoadingState?: React.ReactNode }> = ({ customLoadingState }) => (
  <div className="sdg__status">
    {customLoadingState || (
      <div className="sdg__toolbar-group" style={{ flexDirection: 'column' }}>
        <div className="sdg__spinner" />
        <p className="sdg__status-text">Loading data...</p>
      </div>
    )}
  </div>
);
