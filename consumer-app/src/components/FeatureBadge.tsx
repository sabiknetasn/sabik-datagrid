import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface FeatureBadgeProps {
  children: ReactNode;
  tone?: Tone;
}

export function FeatureBadge({ children, tone = 'neutral' }: FeatureBadgeProps) {
  return <span className={`feature-badge feature-badge--${tone}`}>{children}</span>;
}
