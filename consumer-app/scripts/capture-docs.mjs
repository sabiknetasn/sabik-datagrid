import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npx',
  ['playwright', 'test', 'e2e/capture-docs-screenshots.spec.ts', '--project=chromium'],
  {
    stdio: 'inherit',
    env: { ...process.env, CAPTURE_DOCS: '1' },
    shell: true,
  }
);

process.exit(result.status ?? 1);
