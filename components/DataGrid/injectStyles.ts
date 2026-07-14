import css from './datagrid.css';

const STYLE_ID = 'sabik-datagrid-styles';

export function injectDataGridStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

injectDataGridStyles();
