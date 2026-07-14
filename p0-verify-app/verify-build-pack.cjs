const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = {};

// 7. Build succeeds
try {
  execSync('npm run build', { stdio: 'pipe', cwd: __dirname });
  results['7_build'] = 'PASS';
} catch (e) {
  results['7_build'] = 'FAIL ' + (e.stderr?.toString() || e.message);
}

// 8. npm pack contains required files
const tgz = path.resolve(__dirname, '..', 'sabik-datagrid-1.0.1.tgz');
try {
  const listing = execSync(`npm pack --pack-destination "${__dirname}" --dry-run`, {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
  // Prefer inspecting the already-built tarball contents via tar listing if available
  const required = [
    'package/package.json',
    'package/README.md',
    'package/LICENSE',
    'package/dist/index.js',
    'package/dist/index.mjs',
    'package/dist/index.d.ts',
    'package/dist/index.css',
  ];

  // Extract file list from dry-run notice output OR use tar
  let files = [];
  try {
    files = execSync(`tar -tzf "${tgz}"`, { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    // Windows may lack tar flags differently; fallback parse dry-run
    files = listing
      .split(/\r?\n/)
      .map((l) => l.replace(/^npm notice\s+/, '').trim())
      .filter((l) => l.startsWith('dist/') || l === 'package.json' || l === 'README.md' || l === 'LICENSE')
      .map((l) => (l.startsWith('package/') ? l : `package/${l}`));
  }

  const missing = required.filter((r) => !files.includes(r) && !files.includes(r.replace(/^package\//, '')));
  // Normalize: tarball paths are usually package/dist/...
  const normalized = files.map((f) => f.replace(/^\.\//, ''));
  const missing2 = required.filter((r) => !normalized.includes(r));

  // Also accept without package/ prefix variants
  const has = (suffix) =>
    normalized.some((f) => f === suffix || f === suffix.replace(/^package\//, '') || f.endsWith(suffix.replace(/^package\//, '')));

  const checks = {
    'package.json': has('package/package.json') || has('package.json'),
    'README.md': has('package/README.md') || has('README.md'),
    LICENSE: has('package/LICENSE') || has('LICENSE'),
    'dist/index.js': has('package/dist/index.js') || has('dist/index.js'),
    'dist/index.mjs': has('package/dist/index.mjs') || has('dist/index.mjs'),
    'dist/index.d.ts': has('package/dist/index.d.ts') || has('dist/index.d.ts'),
    'dist/index.css': has('package/dist/index.css') || has('dist/index.css'),
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
  results['8_npm_pack'] =
    failed.length === 0 ? 'PASS' : `FAIL missing=${failed.join(',')} files=${JSON.stringify(normalized)}`;
} catch (e) {
  results['8_npm_pack'] = 'FAIL ' + e.message;
}

console.log(JSON.stringify(results, null, 2));
fs.writeFileSync(path.join(__dirname, 'p0-build-pack-results.json'), JSON.stringify(results, null, 2));
