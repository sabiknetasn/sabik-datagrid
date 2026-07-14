export const PACKAGE_NAME = 'sabik-datagrid';
export const PACKAGE_VERSION = '1.1.1';
export const INSTALL_COMMAND = `npm install ${PACKAGE_NAME}`;
export const STYLE_IMPORT = `import '${PACKAGE_NAME}/styles.css';`;
export const QUICK_START = `import { DataGrid } from '${PACKAGE_NAME}';

<DataGrid
  data={rows}
  columns={columns}
  pagination
  searchable
  filterable
  selectable
  toolbar
/>`;
