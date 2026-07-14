# sabik-datagrid

Reusable DataGrid for React 18+ and TypeScript, built on TanStack Table and TanStack Virtual.

## Features

- Client-side sorting, filtering, pagination, and row selection
- Optional row virtualization for large datasets
- Column filters (string / number / boolean) + global search
- Theme tokens, density, row padding, row height, striped, hoverable, sticky header
- Toolbar search, column visibility, and CSV export callback
- Row actions and bulk actions
- LocalStorage persistence scoped per `persistenceKey` (SSR-safe)
- Soft loading overlay when refetching with existing rows
- Self-contained CSS (no Tailwind required)

## Installation

```bash
npm install sabik-datagrid
```

## Styles

Importing the package includes CSS by default. You can also import explicitly:

```ts
import 'sabik-datagrid/styles.css';
```

## Quick Start

```tsx
import { DataGrid } from 'sabik-datagrid';

const columns = [
  { accessorKey: 'name', header: 'Name', filterType: 'string' as const },
  { accessorKey: 'age', header: 'Age', filterType: 'number' as const },
];

function App() {
  return (
    <DataGrid
      data={users}
      columns={columns}
      getRowId={(row) => String(row.id)}
      pagination
      searchable
      filterable
      selectable
      toolbar
      ariaLabel="Users"
    />
  );
}
```

## API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `TData[]` | Required | Rows to display |
| `columns` | `DataGridColumnDef<TData>[]` | Required | Column definitions |
| `getRowId` | `(row, index) => string` | index-based | Stable row id (recommended) |
| `pageCount` | `number` | derived | Total pages for `manualPagination` |
| `rowCount` | `number` | derived | Total rows for `manualPagination` |
| `loading` | `boolean` | `false` | Skeleton when empty; overlay when rows present |
| `error` | `Error \| string \| null` | `null` | Error state |
| `searchable` | `boolean` | `false` | Global search in toolbar |
| `filterable` | `boolean` | `false` | Per-column filters + reset control |
| `pagination` | `boolean` | `false` | Pagination controls |
| `selectable` | `boolean` | `false` | Row selection |
| `exportable` | `boolean` | `false` | Export button (`onExport`) |
| `toolbar` | `boolean` | `false` | Toolbar |
| `stickyHeader` | `boolean` | `false` | Sticky header in scroll area |
| `virtualized` | `boolean` | `false` | Row virtualization |
| `persistenceKey` | `string` | `undefined` | Scoped LocalStorage key |
| `density` | `'compact' \| 'comfortable' \| 'spacious'` | `comfortable` | Density |
| `rowPadding` | preset or `{ x, y }` | density default | Cell padding |
| `rowHeight` | `number` | density default | Row height (virtualizer aware) |
| `theme` | `DataGridThemeTokens` | defaults | CSS variable theme |
| `striped` | `boolean` | `false` | Zebra rows |
| `hoverable` | `boolean` | `false` | Row hover highlight |
| `ariaLabel` | `string` | `'Data grid'` | Accessible table name |
| `manualPagination` | `boolean` | `false` | Server pagination mode |
| `manualSorting` | `boolean` | `false` | Server sorting mode |
| `manualFiltering` | `boolean` | `false` | Server filtering mode |
| `className` | `string` | `undefined` | Extra class on root |

### Column `filterType`

`string` (contains) · `number` (equals) · `boolean` (Yes/No/All)

### Not implemented yet (typed for forward compatibility)

- `pin`
- `editable`

### Legacy type

`DataGridTheme` (`light` / `dark`) is deprecated; use `theme` with `DataGridThemeTokens`.
