import { useMemo, useState } from 'react';
import { DataGrid, type DataGridColumnDef } from 'sabik-datagrid';
import { DemoStateControls, type DemoMode } from '../components/DemoStateControls';
import { PageHeader } from '../components/PageHeader';
import {
  AvatarCell,
  Badge,
  EmptyIllustration,
  LoadingIllustration,
  formatDate,
  formatDateTime,
  type CellProps,
} from '../components/cells';
import { users, type User, type UserRole, type UserStatus } from '../data/users';

const roleTone: Record<UserRole, 'accent' | 'info' | 'neutral' | 'warning'> = {
  Admin: 'accent',
  Editor: 'info',
  Viewer: 'neutral',
  Guest: 'warning',
};

const statusTone: Record<UserStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
};

export function UsersPage() {
  const [mode, setMode] = useState<DemoMode>('data');
  const [flash, setFlash] = useState<string | null>(null);

  const data = mode === 'empty' || mode === 'error' ? [] : users;
  const loading = mode === 'loading';
  const error =
    mode === 'error' ? new Error('Directory service timed out while loading users.') : null;

  const columns = useMemo<DataGridColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
        size: 260,
        cell: ({ row }: CellProps<User>) => (
          <AvatarCell name={row.original.name} subtitle={row.original.email} />
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 120,
        cell: ({ getValue }: CellProps<User>) => {
          const role = getValue() as UserRole;
          return <Badge tone={roleTone[role]}>{role}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ getValue }: CellProps<User>) => {
          const status = getValue() as UserStatus;
          return <Badge tone={statusTone[status]}>{status}</Badge>;
        },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        size: 140,
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last login',
        size: 160,
        cell: ({ getValue }: CellProps<User>) => formatDateTime(String(getValue())),
      },
      {
        accessorKey: 'joinedAt',
        header: 'Joined',
        size: 130,
        cell: ({ getValue }: CellProps<User>) => formatDate(String(getValue())),
      },
    ],
    []
  );

  return (
    <section className="page">
      <PageHeader
        title="Basic Users Table"
        description="Directory view with avatar cells, status badges, client-side sorting, and pagination. Use the demo controls to preview loading, empty, and error states."
        features={['Sorting', 'Pagination', 'Custom cells', 'Loading', 'Empty', 'Error']}
        actions={<DemoStateControls mode={mode} onChange={setMode} />}
      />

      {flash ? <p className="toast">{flash}</p> : null}

      <div className="panel">
        <DataGrid
          data={data}
          columns={columns}
          getRowId={(row) => String(row.id)}
          pagination
          hoverable
          striped
          density="comfortable"
          ariaLabel="Users directory"
          loading={loading}
          error={error}
          loadingState={<LoadingIllustration />}
          emptyState={
            <EmptyIllustration
              title="No users to show"
              detail="Switch back to Data mode or invite teammates to the workspace."
            />
          }
          errorState={
            <EmptyIllustration
              title="Couldn't load users"
              detail="The demo error state mirrors a failed fetch. Restore data to continue."
            />
          }
          onRowClick={(row) => {
            setFlash(`Selected ${row.name}`);
            window.setTimeout(() => setFlash(null), 2200);
          }}
        />
      </div>
    </section>
  );
}
