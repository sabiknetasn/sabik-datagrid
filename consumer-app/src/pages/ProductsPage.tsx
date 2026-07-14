import { useMemo, useState } from 'react';
import { DataGrid, type DataGridColumnDef } from 'sabik-datagrid';
import { DemoStateControls, type DemoMode } from '../components/DemoStateControls';
import { PageHeader } from '../components/PageHeader';
import {
  Badge,
  EmptyIllustration,
  LoadingIllustration,
  formatCurrency,
  formatDate,
  type CellProps,
} from '../components/cells';
import {
  products,
  type Product,
  type ProductCategory,
  type StockStatus,
} from '../data/products';

const stockTone: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
};

const stockLabel: Record<StockStatus, string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
};

const categoryTone: Record<ProductCategory, 'info' | 'accent' | 'neutral' | 'warning' | 'success'> = {
  Electronics: 'info',
  Apparel: 'accent',
  Home: 'neutral',
  Sports: 'success',
  Beauty: 'warning',
};

export function ProductsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<DemoMode>('data');
  const data = mode === 'empty' || mode === 'error' ? [] : products;
  const loading = mode === 'loading';
  const error =
    mode === 'error' ? new Error('Catalog API returned 503 Service Unavailable.') : null;

  const columns = useMemo<DataGridColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        size: 280,
        filterType: 'string',
        cell: ({ row }: CellProps<Product>) => (
          <div className="cell-product">
            <span className={`swatch swatch--${row.original.category.toLowerCase()}`} />
            <span>
              <strong>{row.original.name}</strong>
              <small>
                {row.original.sku} · {row.original.brand}
              </small>
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        filterType: 'string',
        cell: ({ getValue }: CellProps<Product>) => {
          const category = getValue() as ProductCategory;
          return <Badge tone={categoryTone[category]}>{category}</Badge>;
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 140,
        filterType: 'number',
        cell: ({ row }: CellProps<Product>) => (
          <div className="cell-price">
            <strong>{formatCurrency(row.original.price, true)}</strong>
            {row.original.compareAt ? (
              <s>{formatCurrency(row.original.compareAt, true)}</s>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Inventory',
        size: 150,
        filterType: 'number',
        cell: ({ row }: CellProps<Product>) => (
          <div className="cell-stack">
            <Badge tone={stockTone[row.original.stockStatus]}>
              {stockLabel[row.original.stockStatus]}
            </Badge>
            <span className="muted">{row.original.stock} units</span>
          </div>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        size: 130,
        filterType: 'number',
        cell: ({ row }: CellProps<Product>) => (
          <div className="cell-rating">
            <span aria-label={`${row.original.rating} out of 5`}>
              {row.original.rating.toFixed(1)}
            </span>
            <small>{row.original.reviews.toLocaleString()} reviews</small>
          </div>
        ),
      },
      {
        accessorKey: 'featured',
        header: 'Featured',
        size: 110,
        filterType: 'boolean',
        cell: ({ getValue }: CellProps<Product>) =>
          getValue() ? <Badge tone="accent">Featured</Badge> : <span className="muted">—</span>,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 120,
        cell: ({ getValue }: CellProps<Product>) => formatDate(String(getValue())),
      },
    ],
    []
  );

  return (
    <section className="page">
      <PageHeader
        title="Ecommerce Products Table"
        description="Catalog browsing with global search, typed column filters, boolean feature flags, and rich price/inventory rendering."
        features={[
          'Search',
          'Column filters',
          'Pagination',
          'Typed filters',
          'Loading / empty / error',
        ]}
        actions={<DemoStateControls mode={mode} onChange={setMode} />}
      />

      {notice ? <p className="toast">{notice}</p> : null}

      <div className="panel">
        <DataGrid
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          searchable
          filterable
          pagination
          toolbar
          striped
          hoverable
          density="comfortable"
          ariaLabel="Product catalog"
          loading={loading}
          error={error}
          loadingState={<LoadingIllustration />}
          emptyState={
            <EmptyIllustration
              title="No products found"
              detail="Clear filters or switch back to Data mode to restore the catalog."
            />
          }
          onRowClick={(row) => {
            setNotice(`Opened product ${row.sku}`);
            window.setTimeout(() => setNotice(null), 2000);
          }}
        />
      </div>
    </section>
  );
}
