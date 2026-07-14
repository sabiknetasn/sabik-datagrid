import type { Density } from './types';

export function DataGridSkeleton({
  rowCount = 10,
  colCount,
  density,
}: {
  rowCount?: number;
  colCount: number;
  density: Density | string;
}) {
  const densityClass =
    {
      compact: 'sdg__skeleton-row--compact',
      comfortable: 'sdg__skeleton-row--comfortable',
      spacious: 'sdg__skeleton-row--spacious',
    }[density] || 'sdg__skeleton-row--comfortable';

  return (
    <div className="sdg__skeleton" aria-hidden="true">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={rowIndex} className={`sdg__skeleton-row ${densityClass}`}>
          {Array.from({ length: colCount }).map((_, colIndex) => (
            <div key={colIndex} className="sdg__skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}
