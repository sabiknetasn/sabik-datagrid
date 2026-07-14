import React from 'react';

export const DataGridSkeleton: React.FC<{ 
  rowCount?: number; 
  colCount: number; 
  density: string; 
}> = ({ rowCount = 10, colCount, density }) => {
  const densityClass = {
    compact: 'sdg__skeleton-row--compact',
    comfortable: 'sdg__skeleton-row--comfortable',
    spacious: 'sdg__skeleton-row--spacious',
  }[density] || 'sdg__skeleton-row--comfortable';

  return (
    <div className="sdg__skeleton">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={rowIndex} className={`sdg__skeleton-row ${densityClass}`}>
          {Array.from({ length: colCount }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="sdg__skeleton-cell" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};
