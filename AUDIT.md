# sabik-datagrid v1.1.1 — Enterprise Audit & Roadmap

Compared against TanStack Table headless patterns, MUI DataGrid, AG Grid, and Mantine DataTable.

## Current strengths
- TanStack Table + Virtual foundation
- Self-contained CSS + theme tokens
- Column filters, density, rowPadding, rowHeight, striped, hoverable, stickyHeader
- Persistence keyed per `persistenceKey`
- Named ESM/CJS exports + `styles.css` subpath

## Gaps by category

### Missing enterprise features
Controlled/`initialState` APIs, `getRowId`, server `pageCount`/`rowCount`, column pinning (typed but unimplemented), cell editing, grouping/aggregation, tree/nested rows, master-detail, clipboard, excel-like fill, column drag reorder, frozen footer, i18n, RTL.

### API inconsistencies
`filterable` both enables column filters and reset button; `DataGridTheme` (legacy) vs `DataGridThemeTokens`; `pin`/`editable` on types but no-ops; loading/error replace the entire chrome.

### Performance
TanStack not externalized in tsup (risk of duplication); always register sort/filter models; virtual height hard-coded 400px; no debounce on global/column filters.

### Accessibility
No `aria-sort`; sort control is a focusable `div`; no grid/table labeling; pagination buttons lack descriptive labels; claim of WCAG AA previously overstated.

### SSR
`localStorage` read on init without `window` guard → crashes Next.js/Remix SSR when `persistenceKey` is set.

### Theming / DX / packaging
README out of date for Phase 1 props; no `exports` `default` condition; TanStack should be `peerDependencies` (or clearly external); dead files (`useUrlStateSync`, `AdvancedFilter`) confuse contributors.

---

## Roadmap

### P0 — Must ship (blocking enterprise + SSR + a11y floor)
1. `getRowId` prop (selection/persistence stability)
2. `pageCount` / `rowCount` for true server-side pagination
3. SSR-safe persistence (`typeof window` guard)
4. Soft loading: overlay when data already present (do not unmount chrome)
5. Accessibility floor: `aria-label`/`ariaLabel`, `aria-sort`, native sort `<button>`, pagination labels
6. Package: externalize `@tanstack/*` in tsup
7. Fix filterFn string-key resolution warnings (pass function refs)
8. README accuracy for shipped APIs

### P1 — Next minor
Controlled state API, column pin implementation, debounced filters, configurable virtual height, `peerDependencies` for TanStack, i18n strings prop, loading/empty keep layout always, remove or finish URL sync / AdvancedFilter.

### P2 — Later major surface
Cell editing, grouping, tree data, clipboard, column reorder, RTL, tests + Storybook, CSS modules / unstyled headless mode.

---

P0 implemented in this change set (non-breaking additive props only).
