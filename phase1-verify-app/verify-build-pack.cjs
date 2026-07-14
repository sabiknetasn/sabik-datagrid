const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = {};

try {
  execSync('npm run build', { stdio: 'pipe', cwd: __dirname });
  results['10_build'] = 'PASS';
} catch (e) {
  results['10_build'] = 'FAIL ' + (e.stderr?.toString() || e.message);
}

try {
  const pkgRoot = path.resolve(__dirname, '..');
  const tgz = path.join(pkgRoot, 'sabik-datagrid-1.1.1.tgz');
  const distCss = path.join(pkgRoot, 'dist', 'index.css');
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));

  const hasDistCss = fs.existsSync(distCss);
  const stylesExport = pkgJson.exports?.['./styles.css'];
  const packListing = execSync(`tar -tzf "${tgz}"`, { encoding: 'utf8' });
  const packHasCss = packListing.includes('package/dist/index.css');

  let stylesImportWorks = false;
  try {
    const resolved = require.resolve('sabik-datagrid/styles.css', { paths: [__dirname] });
    stylesImportWorks = fs.existsSync(resolved);
  } catch {
    stylesImportWorks = false;
  }

  const ok = hasDistCss && stylesExport === './dist/index.css' && packHasCss && stylesImportWorks;
  results['11_npm_pack'] = ok
    ? 'PASS'
    : `FAIL hasDistCss=${hasDistCss} export=${stylesExport} packHasCss=${packHasCss} import=${stylesImportWorks}`;
} catch (e) {
  results['11_npm_pack'] = 'FAIL ' + e.message;
}

console.log(JSON.stringify(results, null, 2));
fs.writeFileSync(path.join(__dirname, 'phase1-build-pack.json'), JSON.stringify(results, null, 2));
