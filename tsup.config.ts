import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';

export default defineConfig({
  entry: ['components/DataGrid/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tanstack/react-table',
    '@tanstack/react-virtual',
  ],
  treeshake: true,
  // Default CSS loader (do not set loader: { '.css': 'text' }).
  // That text loader inlines CSS into JS and prevents tsup from writing dist/index.css.
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
  async onSuccess() {
    // tsup emits dist/index.css but strips the side-effect import from JS; restore it
    // so bundlers load styles when consumers import the package entry.
    const mjsPath = 'dist/index.mjs';
    const jsPath = 'dist/index.js';
    const mjs = readFileSync(mjsPath, 'utf8');
    const js = readFileSync(jsPath, 'utf8');
    if (!mjs.includes("./index.css") && !mjs.includes('./index.css')) {
      writeFileSync(mjsPath, `import './index.css';\n` + mjs);
    }
    if (!js.includes("./index.css") && !js.includes('./index.css')) {
      writeFileSync(jsPath, `require('./index.css');\n` + js);
    }
  },
});
