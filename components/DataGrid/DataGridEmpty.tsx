import React from 'react';

export const DataGridEmpty: React.FC<{ customEmptyState?: React.ReactNode }> = ({ customEmptyState }) => (
  <div className="sdg__status">
    {customEmptyState || (
      <div className="sdg__status-text">
        <p>No records found</p>
      </div>
    )}
  </div>
);
