import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { FeatureBadge } from '../components/FeatureBadge';
import {
  IconArrowRight,
  IconFilter,
  IconLayers,
  IconSearch,
  IconSort,
  IconUsers,
  IconZap,
} from '../components/Icons';
import {
  INSTALL_COMMAND,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  QUICK_START,
  STYLE_IMPORT,
} from '../lib/meta';

const features = [
  {
    title: 'Sorting & pagination',
    detail: 'Click-to-sort columns with footer controls for page size and navigation.',
    icon: IconSort,
    tone: 'info' as const,
  },
  {
    title: 'Search & column filters',
    detail: 'Global search plus typed filters for string, number, and boolean fields.',
    icon: IconFilter,
    tone: 'accent' as const,
  },
  {
    title: 'Selection & actions',
    detail: 'Checkbox selection, row menus, and bulk actions for operational tables.',
    icon: IconUsers,
    tone: 'success' as const,
  },
  {
    title: 'Appearance tokens',
    detail: 'Theme tokens, density, striped rows, sticky headers, and soft loading overlays.',
    icon: IconLayers,
    tone: 'warning' as const,
  },
  {
    title: 'Toolbar & export',
    detail: 'Built-in toolbar with column visibility and CSV export callback wiring.',
    icon: IconSearch,
    tone: 'info' as const,
  },
  {
    title: 'Virtualization ready',
    detail: 'Optional row virtualization for large datasets without changing your column API.',
    icon: IconZap,
    tone: 'danger' as const,
  },
];

const demos = [
  { to: '/users', title: 'Users', blurb: 'Custom cells, sorting, loading & empty states' },
  { to: '/products', title: 'Products', blurb: 'Ecommerce catalog with filters and search' },
  { to: '/employees', title: 'Employees', blurb: 'Selection, row actions, and bulk workflows' },
  { to: '/admin', title: 'Admin', blurb: 'Enterprise board with theme and persistence' },
];

export function LandingPage() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__brand">{PACKAGE_NAME}</p>
          <h1>Tables that feel finished.</h1>
          <p className="hero__lead">
            A typed React DataGrid with sorting, filtering, selection, and polished states
            — ready to drop into product UIs.
          </p>
          <div className="hero__cta">
            <Link to="/users" className="btn btn--primary">
              Explore demos
              <IconArrowRight size={16} />
            </Link>
            <a href="#install" className="btn btn--ghost">
              Installation
            </a>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero-table">
            <div className="hero-table__toolbar">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-table__head">
              <span>Name</span>
              <span>Status</span>
              <span>Role</span>
              <span>Updated</span>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="hero-table__row" key={i} style={{ animationDelay: `${i * 70}ms` }}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <h2>Capabilities</h2>
          <p>Everything teams expect from an enterprise grid, with a small API surface.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className={`feature-card__icon feature-card__icon--${feature.tone}`}>
                <feature.icon size={18} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.detail}</p>
              <FeatureBadge tone={feature.tone}>Included</FeatureBadge>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section" id="install">
        <div className="section-heading">
          <h2>Installation</h2>
          <p>
            Version <FeatureBadge tone="accent">v{PACKAGE_VERSION}</FeatureBadge> on npm.
            React 18+ peer dependency.
          </p>
        </div>
        <div className="install-grid">
          <CodeBlock code={INSTALL_COMMAND} label="Install package" language="bash" />
          <CodeBlock code={STYLE_IMPORT} label="Optional styles import" language="ts" />
          <CodeBlock code={QUICK_START} label="Quick start" language="tsx" />
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <h2>Live examples</h2>
          <p>Four realistic datasets wired to the same public DataGrid API.</p>
        </div>
        <div className="demo-links">
          {demos.map((demo) => (
            <Link key={demo.to} to={demo.to} className="demo-link">
              <div>
                <strong>{demo.title}</strong>
                <span>{demo.blurb}</span>
              </div>
              <IconArrowRight size={18} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
