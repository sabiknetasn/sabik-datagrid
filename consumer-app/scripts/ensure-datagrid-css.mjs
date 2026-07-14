import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceStyles = path.resolve(appRoot, '../src/datagrid.css')
const packageDist = path.resolve(appRoot, 'node_modules/sabik-datagrid/dist')

mkdirSync(packageDist, { recursive: true })
copyFileSync(sourceStyles, path.join(packageDist, 'index.css'))
