export type UserRole = 'Admin' | 'Editor' | 'Viewer' | 'Guest';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  lastLogin: string;
  joinedAt: string;
}

export const users: User[] = [
  {
    id: 1,
    name: 'Ava Mitchell',
    email: 'ava.mitchell@northline.io',
    role: 'Admin',
    status: 'active',
    department: 'Engineering',
    lastLogin: '2026-07-14T09:12:00Z',
    joinedAt: '2023-02-11',
  },
  {
    id: 2,
    name: 'Noah Patel',
    email: 'noah.patel@northline.io',
    role: 'Editor',
    status: 'active',
    department: 'Product',
    lastLogin: '2026-07-13T18:44:00Z',
    joinedAt: '2023-06-02',
  },
  {
    id: 3,
    name: 'Sofia Alvarez',
    email: 'sofia.alvarez@northline.io',
    role: 'Viewer',
    status: 'pending',
    department: 'Design',
    lastLogin: '2026-07-10T11:05:00Z',
    joinedAt: '2024-01-19',
  },
  {
    id: 4,
    name: 'Liam Chen',
    email: 'liam.chen@northline.io',
    role: 'Editor',
    status: 'active',
    department: 'Engineering',
    lastLogin: '2026-07-14T07:30:00Z',
    joinedAt: '2022-11-08',
  },
  {
    id: 5,
    name: 'Maya Okonkwo',
    email: 'maya.okonkwo@northline.io',
    role: 'Admin',
    status: 'inactive',
    department: 'Operations',
    lastLogin: '2026-05-22T16:20:00Z',
    joinedAt: '2021-09-14',
  },
  {
    id: 6,
    name: 'Ethan Brooks',
    email: 'ethan.brooks@northline.io',
    role: 'Viewer',
    status: 'active',
    department: 'Support',
    lastLogin: '2026-07-12T14:55:00Z',
    joinedAt: '2024-04-03',
  },
  {
    id: 7,
    name: 'Isla Berg',
    email: 'isla.berg@northline.io',
    role: 'Guest',
    status: 'pending',
    department: 'Marketing',
    lastLogin: '2026-07-01T09:00:00Z',
    joinedAt: '2025-12-01',
  },
  {
    id: 8,
    name: 'Kai Nakamura',
    email: 'kai.nakamura@northline.io',
    role: 'Editor',
    status: 'active',
    department: 'Engineering',
    lastLogin: '2026-07-14T10:02:00Z',
    joinedAt: '2023-08-21',
  },
  {
    id: 9,
    name: 'Elena Rossi',
    email: 'elena.rossi@northline.io',
    role: 'Viewer',
    status: 'active',
    department: 'Finance',
    lastLogin: '2026-07-11T12:18:00Z',
    joinedAt: '2024-07-30',
  },
  {
    id: 10,
    name: 'Owen Hart',
    email: 'owen.hart@northline.io',
    role: 'Guest',
    status: 'inactive',
    department: 'Sales',
    lastLogin: '2026-04-09T08:45:00Z',
    joinedAt: '2025-03-12',
  },
  {
    id: 11,
    name: 'Priya Sharma',
    email: 'priya.sharma@northline.io',
    role: 'Admin',
    status: 'active',
    department: 'Product',
    lastLogin: '2026-07-14T08:11:00Z',
    joinedAt: '2022-04-18',
  },
  {
    id: 12,
    name: 'Jordan Lee',
    email: 'jordan.lee@northline.io',
    role: 'Editor',
    status: 'pending',
    department: 'Design',
    lastLogin: '2026-07-08T19:27:00Z',
    joinedAt: '2025-09-05',
  },
];
