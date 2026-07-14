import { useMemo, useState } from 'react';
import { DataGrid, type DataGridColumnDef } from 'sabik-datagrid';

type Row = {
  id: number;
  name: string;
  age: number;
  active: boolean;
};

const baseColumns: DataGridColumnDef<Row>[] = [
  { accessorKey: 'id', header: 'ID', filterType: 'number' },
  { accessorKey: 'name', header: 'Name', filterType: 'string' },
  { accessorKey: 'age', header: 'Age', filterType: 'number' },
  { accessorKey: 'active', header: 'Active', filterType: 'boolean' },
];

const data: Row[] = [
  { id: 1, name: 'Alice', age: 30, active: true },
  { id: 2, name: 'Bob', age: 25, active: false },
  { id: 3, name: 'Charlie', age: 35, active: true },
  { id: 4, name: 'Diana', age: 28, active: false },
];

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 40),
    active: i % 2 === 0,
  }));
}

type Scenario =
  | 'theme'
  | 'density-compact'
  | 'density-comfortable'
  | 'density-spacious'
  | 'padding-compact'
  | 'padding-object'
  | 'rowheight-normal'
  | 'rowheight-virtual'
  | 'filters'
  | 'striped'
  | 'hoverable'
  | 'sticky'
  | 'virtual-100k';

export default function App() {
  const [scenario, setScenario] = useState<Scenario>('theme');
  const virtualData = useMemo(
    () => (scenario === 'virtual-100k' ? makeRows(100_000) : data),
    [scenario]
  );

  const common = {
    data: scenario === 'virtual-100k' ? virtualData : data,
    columns: baseColumns,
    filterable: scenario === 'filters',
    searchable: scenario === 'filters',
    toolbar: scenario === 'filters',
    pagination: false,
  };

  let grid = null;

  switch (scenario) {
    case 'theme':
      grid = (
        <DataGrid
          {...common}
          theme={{
            primary: '#dc2626',
            background: '#fff7ed',
            headerBackground: '#ffedd5',
            border: '#fb923c',
            radius: '20px',
          }}
        />
      );
      break;
    case 'density-compact':
      grid = <DataGrid {...common} density="compact" />;
      break;
    case 'density-comfortable':
      grid = <DataGrid {...common} density="comfortable" />;
      break;
    case 'density-spacious':
      grid = <DataGrid {...common} density="spacious" />;
      break;
    case 'padding-compact':
      grid = <DataGrid {...common} rowPadding="compact" />;
      break;
    case 'padding-object':
      grid = <DataGrid {...common} rowPadding={{ x: 20, y: 14 }} />;
      break;
    case 'rowheight-normal':
      grid = <DataGrid {...common} rowHeight={52} />;
      break;
    case 'rowheight-virtual':
      grid = (
        <DataGrid
          {...common}
          data={makeRows(500)}
          rowHeight={52}
          virtualized
          manualPagination
        />
      );
      break;
    case 'filters':
      grid = <DataGrid {...common} />;
      break;
    case 'striped':
      grid = <DataGrid {...common} striped />;
      break;
    case 'hoverable':
      grid = <DataGrid {...common} hoverable />;
      break;
    case 'sticky':
      grid = <DataGrid {...common} stickyHeader />;
      break;
    case 'virtual-100k':
      grid = (
        <DataGrid
          {...common}
          virtualized
          manualPagination
        />
      );
      break;
  }

  return (
    <div data-testid="app-root">
      <nav data-testid="scenario-nav">
        {(
          [
            'theme',
            'density-compact',
            'density-comfortable',
            'density-spacious',
            'padding-compact',
            'padding-object',
            'rowheight-normal',
            'rowheight-virtual',
            'filters',
            'striped',
            'hoverable',
            'sticky',
            'virtual-100k',
          ] as Scenario[]
        ).map((s) => (
          <button
            key={s}
            type="button"
            data-testid={`scenario-${s}`}
            onClick={() => setScenario(s)}
          >
            {s}
          </button>
        ))}
      </nav>
      <div data-testid="active-scenario">{scenario}</div>
      <div data-testid="grid-host">{grid}</div>
    </div>
  );
}
