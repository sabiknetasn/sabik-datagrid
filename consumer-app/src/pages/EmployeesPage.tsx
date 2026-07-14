import { useMemo, useState } from 'react';
import {
  DataGrid,
  type DataGridColumnDef,
  type RowAction,
} from 'sabik-datagrid';
import { DemoStateControls, type DemoMode } from '../components/DemoStateControls';
import { PageHeader } from '../components/PageHeader';
import {
  AvatarCell,
  Badge,
  EmptyIllustration,
  LoadingIllustration,
  formatCurrency,
  formatDate,
  type CellProps,
} from '../components/cells';
import {
  employees,
  type Employee,
  type EmployeeStatus,
  type EmploymentType,
} from '../data/employees';

const statusTone: Record<EmployeeStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  on_leave: 'warning',
  terminated: 'danger',
};

const statusLabel: Record<EmployeeStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  terminated: 'Terminated',
};

const typeTone: Record<EmploymentType, 'info' | 'neutral' | 'accent'> = {
  'Full-time': 'info',
  'Part-time': 'neutral',
  Contract: 'accent',
};

export function EmployeesPage() {
  const [rows, setRows] = useState(employees);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [mode, setMode] = useState<DemoMode>('data');
  const viewRows = mode === 'empty' || mode === 'error' ? [] : rows;
  const loading = mode === 'loading';
  const error =
    mode === 'error' ? new Error('HR service could not authorize this request.') : null;

  const announce = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const rowActions = useMemo<RowAction<Employee>[]>(
    () => [
      {
        label: 'View profile',
        onClick: (row) => announce(`Opened profile for ${row.name}`),
      },
      {
        label: 'Send reminder',
        onClick: (row) => announce(`Reminder queued for ${row.email}`),
      },
      {
        label: 'Mark on leave',
        onClick: (row) => {
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, status: 'on_leave' } : item
            )
          );
          announce(`${row.name} marked on leave`);
        },
      },
    ],
    []
  );

  const bulkActions = useMemo<RowAction<Employee>[]>(
    () => [
      {
        label: 'Export selected',
        onClick: () => undefined,
      },
      {
        label: 'Archive selected',
        danger: true,
        onClick: () => undefined,
      },
    ],
    []
  );

  const columns = useMemo<DataGridColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Employee',
        size: 250,
        filterType: 'string',
        cell: ({ row }: CellProps<Employee>) => (
          <AvatarCell name={row.original.name} subtitle={row.original.title} />
        ),
      },
      {
        accessorKey: 'team',
        header: 'Team',
        size: 140,
        filterType: 'string',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 140,
        filterType: 'string',
      },
      {
        accessorKey: 'employmentType',
        header: 'Type',
        size: 120,
        filterType: 'string',
        cell: ({ getValue }: CellProps<Employee>) => {
          const type = getValue() as EmploymentType;
          return <Badge tone={typeTone[type]}>{type}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        filterType: 'string',
        cell: ({ getValue }: CellProps<Employee>) => {
          const status = getValue() as EmployeeStatus;
          return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
        },
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        size: 120,
        filterType: 'number',
        cell: ({ getValue }: CellProps<Employee>) => formatCurrency(Number(getValue())),
      },
      {
        accessorKey: 'startDate',
        header: 'Start date',
        size: 130,
        cell: ({ getValue }: CellProps<Employee>) => formatDate(String(getValue())),
      },
      {
        accessorKey: 'manager',
        header: 'Manager',
        size: 150,
        filterType: 'string',
      },
    ],
    []
  );

  return (
    <section className="page">
      <PageHeader
        title="Employee Management Table"
        description="HR-style roster with row selection, per-row actions, bulk actions, search, filters, and a compact density for denser directories."
        features={[
          'Row selection',
          'Row actions',
          'Bulk actions',
          'Search & filters',
          'Compact density',
        ]}
        actions={
          <>
            <div className="stat-chip">
              <span>Selected</span>
              <strong>{selectedCount}</strong>
            </div>
            <DemoStateControls mode={mode} onChange={setMode} />
          </>
        }
      />

      {message ? <p className="toast">{message}</p> : null}

      <div className="panel">
        <DataGrid
          data={viewRows}
          columns={columns}
          getRowId={(row) => row.id}
          searchable
          filterable
          pagination
          selectable
          toolbar
          hoverable
          density="compact"
          ariaLabel="Employee roster"
          loading={loading}
          error={error}
          loadingState={<LoadingIllustration />}
          emptyState={
            <EmptyIllustration
              title="No employees in view"
              detail="Restore Data mode or undo the last archive action."
            />
          }
          rowActions={rowActions}
          bulkActions={bulkActions}
          onBulkAction={(action, selectedRows) => {
            if (action.label === 'Archive selected') {
              const ids = new Set(selectedRows.map((row) => row.id));
              setRows((current) => current.filter((row) => !ids.has(row.id)));
              announce(`Archived ${selectedRows.length} employees`);
              return;
            }
            announce(`Exported ${selectedRows.length} employees`);
          }}
          onSelectionChange={(selection) => {
            setSelectedCount(Object.keys(selection).filter((key) => selection[key]).length);
          }}
        />
      </div>
    </section>
  );
}
