import type { ReactNode } from 'react';
import { FeatureBadge } from './FeatureBadge';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  features: string[];
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow = 'Live demo',
  title,
  description,
  features,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-header__desc">{description}</p>
        <div className="page-header__badges">
          {features.map((feature) => (
            <FeatureBadge key={feature}>{feature}</FeatureBadge>
          ))}
        </div>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
