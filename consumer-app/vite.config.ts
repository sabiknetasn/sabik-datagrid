import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const appRoot = path.dirname(fileURLToPath(import.meta.url))
const reactPkg = path.resolve(appRoot, 'node_modules/react')
const reactDomPkg = path.resolve(appRoot, 'node_modules/react-dom')

// Force one React instance when sabik-datagrid is linked via file: (junction)
// and would otherwise resolve react from the library repo's node_modules.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: reactPkg,
      'react-dom': reactDomPkg,
      'react/jsx-runtime': path.resolve(reactPkg, 'jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(reactPkg, 'jsx-dev-runtime.js'),
    },
  },
  optimizeDeps: {
    include: ['sabik-datagrid', '@tanstack/react-table', '@tanstack/react-virtual'],
  },
})
