import { useMemo, useState } from 'react';
import {
  DataGrid,
  type DataGridColumnDef,
  type RowAction,
} from 'sabik-datagrid';
import { DemoStateControls, type DemoMode } from '../components/DemoStateControls';
import { PageHeader } from '../components/PageHeader';
import {
  Badge,
  EmptyIllustration,
  LoadingIllustration,
  formatCurrency,
  formatDateTime,
  type CellProps,
} from '../components/cells';
import {
  adminTickets,
  type AdminTicket,
  type TicketPriority,
  type TicketStatus,
} from '../data/admin';

const priorityTone: Record<TicketPriority, 'neutral' | 'info' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

const statusTone: Record<TicketStatus, 'info' | 'accent' | 'success' | 'neutral'> = {
  open: 'info',
  in_progress: 'accent',
  resolved: 'success',
  closed: 'neutral',
};

const statusLabel: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function AdminPage() {
  const [tickets, setTickets] = useState(adminTickets);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [mode, setMode] = useState<DemoMode>('data');

  const viewTickets = mode === 'empty' || mode === 'error' ? [] : tickets;
  const loading = mode === 'loading';
  const error =
    mode === 'error' ? new Error('Ticket index is temporarily unavailable.') : null;

  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const criticalCount = tickets.filter((t) => t.priority === 'critical').length;
  const escalatedCount = tickets.filter((t) => t.escalated).length;

  const rowActions = useMemo<RowAction<AdminTicket>[]>(
    () => [
      {
        label: 'Assign to me',
        onClick: (row) => {
          setTickets((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, owner: 'You', status: 'in_progress' } : item
            )
          );
        },
      },
      {
        label: 'Resolve',
        onClick: (row) => {
          setTickets((current) =>
            current.map((item) =>
              item.id === row.id ? { ...item, status: 'resolved', escalated: false } : item
            )
          );
        },
      },
      {
        label: 'Escalate',
        danger: true,
        onClick: (row) => {
          setTickets((current) =>
            current.map((item) =>
              item.id === row.id
                ? { ...item, escalated: true, priority: 'critical', status: 'open' }
                : item
            )
          );
        },
      },
    ],
    []
  );

  const columns = useMemo<DataGridColumnDef<AdminTicket>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Ticket',
        size: 110,
        filterType: 'string',
        cell: ({ row }: CellProps<AdminTicket>) => (
          <div className="cell-stack">
            <strong className="mono">{row.original.id}</strong>
            {row.original.escalated ? <Badge tone="danger">Escalated</Badge> : null}
          </div>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        size: 280,
        filterType: 'string',
        cell: ({ row }: CellProps<AdminTicket>) => (
          <div className="cell-stack">
            <strong>{row.original.subject}</strong>
            <span className="muted">{row.original.organization}</span>
          </div>
        ),
      },
      {
        accessorKey: 'area',
        header: 'Area',
        size: 130,
        filterType: 'string',
        cell: ({ getValue }: CellProps<AdminTicket>) => (
          <Badge tone="neutral">{String(getValue())}</Badge>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 120,
        filterType: 'string',
        cell: ({ getValue }: CellProps<AdminTicket>) => {
          const priority = getValue() as TicketPriority;
          return <Badge tone={priorityTone[priority]}>{priority}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        filterType: 'string',
        cell: ({ getValue }: CellProps<AdminTicket>) => {
          const status = getValue() as TicketStatus;
          return <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>;
        },
      },
      {
        accessorKey: 'owner',
        header: 'Owner',
        size: 140,
        filterType: 'string',
      },
      {
        accessorKey: 'slaHours',
        header: 'SLA (h)',
        size: 100,
        filterType: 'number',
        cell: ({ getValue }: CellProps<AdminTicket>) => {
          const hours = Number(getValue());
          return (
            <span className={hours <= 12 ? 'sla sla--hot' : 'sla'}>{hours}h</span>
          );
        },
      },
      {
        accessorKey: 'arrImpact',
        header: 'ARR impact',
        size: 130,
        filterType: 'number',
        cell: ({ getValue }: CellProps<AdminTicket>) => formatCurrency(Number(getValue())),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 150,
        cell: ({ getValue }: CellProps<AdminTicket>) => formatDateTime(String(getValue())),
      },
    ],
    []
  );

  return (
    <section className="page">
      <PageHeader
        title="Enterprise Admin Dashboard"
        description="Full-featured operations board: searchable, filterable, selectable, exportable, sticky header, persistence, and themed styling for dense support workloads."
        features={[
          'Full feature set',
          'Sticky header',
          'Persistence',
          'Export',
          'Theme tokens',
        ]}
        actions={<DemoStateControls mode={mode} onChange={setMode} />}
      />

      <div className="metric-row">
        <article className="metric">
          <span>Open workload</span>
          <strong>{openCount}</strong>
        </article>
        <article className="metric">
          <span>Critical</span>
          <strong>{criticalCount}</strong>
        </article>
        <article className="metric">
          <span>Escalated</span>
          <strong>{escalatedCount}</strong>
        </article>
        <article className="metric">
          <span>Total tickets</span>
          <strong>{tickets.length}</strong>
        </article>
      </div>

      {exportNote ? <p className="toast">{exportNote}</p> : null}

      <div className="panel panel--flush">
        <DataGrid
          data={viewTickets}
          columns={columns}
          getRowId={(row) => row.id}
          searchable
          filterable
          pagination
          selectable
          exportable
          toolbar
          stickyHeader
          striped
          hoverable
          density="compact"
          persistenceKey="consumer-admin-tickets"
          ariaLabel="Enterprise support tickets"
          loading={loading}
          error={error}
          loadingState={<LoadingIllustration />}
          emptyState={
            <EmptyIllustration
              title="Queue is clear"
              detail="No tickets match this view. Restore Data mode to continue triage."
            />
          }
          theme={{
            primary: '#0f766e',
            background: '#ffffff',
            headerBackground: '#f0fdfa',
            border: '#ccfbf1',
            radius: '12px',
          }}
          rowActions={rowActions}
          bulkActions={[
            {
              label: 'Close selected',
              onClick: () => undefined,
            },
          ]}
          onBulkAction={(_action, selectedRows) => {
            const ids = new Set(selectedRows.map((row) => row.id));
            setTickets((current) =>
              current.map((row) =>
                ids.has(row.id) ? { ...row, status: 'closed', escalated: false } : row
              )
            );
            setExportNote(`Closed ${selectedRows.length} tickets`);
            window.setTimeout(() => setExportNote(null), 2200);
          }}
          onExport={(type) => {
            setExportNote(`Export requested as ${type.toUpperCase()} (${tickets.length} rows)`);
            window.setTimeout(() => setExportNote(null), 2400);
          }}
        />
      </div>
    </section>
  );
}
