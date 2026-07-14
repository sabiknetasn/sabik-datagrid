import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  IconBriefcase,
  IconCart,
  IconClose,
  IconGrid,
  IconHome,
  IconMenu,
  IconShield,
  IconUsers,
} from './Icons';
import { PACKAGE_NAME, PACKAGE_VERSION } from '../lib/meta';
import { CopyButton } from './CopyButton';

const overview = [{ to: '/', label: 'Overview', caption: 'Landing & install', icon: IconHome, end: true }] as const;

const demos = [
  { to: '/users', label: 'Users', caption: 'Sorting & states', icon: IconUsers },
  { to: '/products', label: 'Products', caption: 'Search & filters', icon: IconCart },
  { to: '/employees', label: 'Employees', caption: 'Selection & actions', icon: IconBriefcase },
  { to: '/admin', label: 'Admin', caption: 'Enterprise board', icon: IconShield },
] as const;

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#install') {
      document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="shell">
      <aside className={`shell__sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <IconGrid size={18} />
          </span>
          <div>
            <strong>{PACKAGE_NAME}</strong>
            <span>Docs & live demos</span>
          </div>
        </div>

        <div className="shell__version">
          <span>npm package</span>
          <strong>v{PACKAGE_VERSION}</strong>
        </div>

        <nav className="shell__nav" aria-label="Documentation">
          <p className="shell__nav-label">Start</p>
          {overview.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `shell__link ${isActive ? 'is-active' : ''}`}
            >
              <item.icon size={16} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.caption}</small>
              </span>
            </NavLink>
          ))}

          <p className="shell__nav-label">Examples</p>
          {demos.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `shell__link ${isActive ? 'is-active' : ''}`}
            >
              <item.icon size={16} />
              <span>
                <strong>{item.label}</strong>
                <small>{item.caption}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="shell__install">
          <p>Install</p>
          <div className="shell__install-row">
            <code>npm i {PACKAGE_NAME}</code>
            <CopyButton value={`npm install ${PACKAGE_NAME}`} label="Copy" />
          </div>
        </div>
      </aside>

      {menuOpen ? (
        <button
          type="button"
          className="shell__backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div className="shell__main">
        <header className="shell__topbar">
          <button
            type="button"
            className="shell__menu-btn"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
          <div className="shell__topbar-copy">
            <p className="eyebrow">sabik-datagrid showcase</p>
            <strong>Production-ready React DataGrid demos</strong>
          </div>
          <button
            type="button"
            className="shell__top-cta btn btn--ghost"
            onClick={() => {
              if (location.pathname === '/') {
                document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/#install');
              }
            }}
          >
            Get started
          </button>
        </header>

        <main className="shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
