import { useMemo, useState } from 'react';
import { DataGrid } from 'sabik-datagrid';

type Row = { id: number; name: string; status: string };

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
];

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'idle',
  }));
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const data = useMemo(() => (mounted ? makeRows(100_000) : []), [mounted]);

  return (
    <div style={{ padding: 16 }} data-testid="app-root">
      <h1>Virtualization verify</h1>
      <button type="button" data-testid="mount-virtual" onClick={() => setMounted(true)}>
        Mount 100k
      </button>
      <pre data-testid="virtual-debug">{mounted ? `mounted:${data.length}` : 'idle'}</pre>
      {mounted && (
        <DataGrid data={data} columns={columns} virtualized pagination={false} />
      )}
    </div>
  );
}
