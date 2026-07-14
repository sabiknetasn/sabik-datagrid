import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // Keep peer runtime deps out of the bundle for a single React instance.
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@tanstack/react-table',
    '@tanstack/react-virtual',
  ],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
  async onSuccess() {
    // tsup emits dist/index.css but strips the side-effect import from JS; restore it.
    const mjsPath = 'dist/index.mjs';
    const jsPath = 'dist/index.js';
    const mjs = readFileSync(mjsPath, 'utf8');
    const js = readFileSync(jsPath, 'utf8');
    if (!mjs.includes('./index.css') && !mjs.includes("./index.css")) {
      writeFileSync(mjsPath, `import './index.css';\n` + mjs);
    }
    if (!js.includes('./index.css') && !js.includes("./index.css")) {
      writeFileSync(jsPath, `require('./index.css');\n` + js);
    }
  },
});
