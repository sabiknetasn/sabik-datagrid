import { DataGrid } from "sabik-datagrid";

const data = [
  { id: 1, name: "John Doe" },
];

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
];

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>DataGrid Test</h1>

      <DataGrid
        data={data}
        columns={columns}
      />
    </div>
  );
}