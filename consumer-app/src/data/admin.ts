export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ServiceArea =
  | 'Billing'
  | 'Access'
  | 'Performance'
  | 'Security'
  | 'Integrations';

export interface AdminTicket {
  id: string;
  subject: string;
  organization: string;
  owner: string;
  area: ServiceArea;
  priority: TicketPriority;
  status: TicketStatus;
  slaHours: number;
  createdAt: string;
  updatedAt: string;
  arrImpact: number;
  escalated: boolean;
}

function daysAgo(n: number): string {
  const d = new Date('2026-07-14T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

const subjects = [
  'SSO session timeout mismatch',
  'Invoice PDF export failing',
  'API rate limit bursts on staging',
  'Permission drift after role sync',
  'Webhook delivery lag',
  'Dashboard latency spike',
  'MFA enrollment blocked',
  'Seat overage reconciliation',
  'Audit log retention gap',
  'CSV import encoding issue',
  'Region failover dry-run failed',
  'Token refresh returns 401 intermittently',
  'Custom field mapping broken',
  'Report scheduler skip',
  'Tenant branding cache stale',
];

const orgs = [
  'Helix Biotech',
  'Summit Retail Group',
  'Cascade Logistics',
  'Brightpath Education',
  'Orbital Finance',
  'Copperline Manufacturing',
  'Evergreen Health',
  'Nimbus Media',
];

const owners = [
  'Ava Mitchell',
  'Noah Patel',
  'Kai Nakamura',
  'Priya Sharma',
  'Liam Chen',
  'Rita Mensah',
];

const areas: ServiceArea[] = [
  'Billing',
  'Access',
  'Performance',
  'Security',
  'Integrations',
];

const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const statuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export const adminTickets: AdminTicket[] = Array.from({ length: 48 }, (_, i) => {
  const priority = priorities[i % priorities.length]!;
  const status = statuses[i % statuses.length]!;
  const slaBase = { low: 72, medium: 48, high: 24, critical: 8 }[priority];

  return {
    id: `TKT-${2400 + i}`,
    subject: subjects[i % subjects.length]!,
    organization: orgs[i % orgs.length]!,
    owner: owners[i % owners.length]!,
    area: areas[i % areas.length]!,
    priority,
    status,
    slaHours: slaBase - (i % 5),
    createdAt: daysAgo(14 - (i % 14)),
    updatedAt: daysAgo(i % 7),
    arrImpact: Math.round((12_000 + (i % 17) * 8500) / 100) * 100,
    escalated: i % 7 === 0,
  };
});
