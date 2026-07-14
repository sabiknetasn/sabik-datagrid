# sabik-datagrid · Docs & Demos

Premium consumer showcase for the `sabik-datagrid` npm package.

## Pages

- `/` — Landing, capabilities, installation
- `/users` — Sorting, custom cells, loading / empty / error
- `/products` — Search, typed filters, ecommerce cells
- `/employees` — Selection, row/bulk actions
- `/admin` — Full enterprise feature set

## Run

```bash
# From repo root
npm run build
npm pack

cd consumer-app
npm install
npm run dev
```

## E2E tests

```bash
cd consumer-app
npm run test:e2e
```

Playwright builds the app, starts preview, and asserts Users / Products / Employees / Admin each render a DataGrid with no console or page errors.
