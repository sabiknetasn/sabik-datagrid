import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../docs/images');

// Opt-in only — keeps regular `npm run test:e2e` free of screenshot writes.
test.skip(!process.env.CAPTURE_DOCS, 'Set CAPTURE_DOCS=1 to regenerate docs/images screenshots');

test.use({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function clearPersistence(page: Page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sabik-datagrid-persistence:')) {
        localStorage.removeItem(key);
      }
    }
  });
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}

async function openFresh(page: Page, route: string, tableName: string) {
  await page.goto(route, { waitUntil: 'networkidle' });
  await clearPersistence(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('table', { name: tableName })).toBeVisible();
  await settle(page);
}

async function shot(page: Page, fileName: string) {
  await page.screenshot({
    path: path.join(OUT_DIR, fileName),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide',
  });
}

async function gridShot(page: Page, fileName: string) {
  const grid = page.locator('.sdg').first();
  await expect(grid).toBeVisible();
  await grid.screenshot({
    path: path.join(OUT_DIR, fileName),
    animations: 'disabled',
    caret: 'hide',
  });
}

/** Force enterprise dark surface — showcase shell has no prefers-color-scheme. */
async function applyDarkDemoTheme(page: Page) {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addStyleTag({
    content: `
      html, body {
        background: #09090b !important;
        color-scheme: dark;
      }
      .shell,
      .shell__sidebar,
      .shell__main,
      .shell__topbar,
      .page,
      .page-header,
      .demo-panel,
      .stat-cards,
      .stat-card {
        background: #09090b !important;
        color: #fafafa !important;
        border-color: #27272a !important;
      }
      .shell__sidebar {
        background: #0c0c0e !important;
        border-right-color: #27272a !important;
      }
      .shell__link,
      .shell__link strong,
      .shell__link small,
      .shell__nav-label,
      .brand strong,
      .brand span,
      .page-header p,
      .page-header h1,
      .shell__version,
      .shell__install,
      .shell__install code {
        color: #e4e4e7 !important;
      }
      .shell__link.is-active {
        background: #18181b !important;
      }
      .feature-badge,
      .demo-state button,
      .btn {
        background: #18181b !important;
        color: #fafafa !important;
        border-color: #3f3f46 !important;
      }
      .sdg {
        --sdg-bg: #09090b !important;
        --sdg-fg: #fafafa !important;
        --sdg-muted: #18181b !important;
        --sdg-muted-fg: #a1a1aa !important;
        --sdg-border: #27272a !important;
        --sdg-input: #27272a !important;
        --sdg-row-hover: #141416 !important;
        --sdg-row-selected: rgba(59, 130, 246, 0.18) !important;
        --sdg-row-zebra: #0f0f12 !important;
        --sdg-header-bg: #111113 !important;
        --sdg-primary: #60a5fa !important;
        --sdg-primary-fg: #09090b !important;
        background: #09090b !important;
        color: #fafafa !important;
        border-color: #27272a !important;
      }
    `,
  });
  // Clear Admin page inline theme tokens so dark vars win
  await page.locator('.sdg').first().evaluate((el) => {
    el.removeAttribute('style');
  });
  await page.waitForTimeout(200);
}

test.describe.configure({ mode: 'serial' });

test('capture docs screenshots', async ({ page }) => {
  // Products overview
  await openFresh(page, '/products', 'Product catalog');
  await shot(page, 'products.png');

  // Column resize: widen Product column and hover the handle
  {
    const productHeader = page.locator('th[data-column-id="name"]').first();
    const handle = productHeader.locator('.sdg__resize');
    const box = await handle.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + 110, box!.y + box!.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(250);
    await handle.hover();
    await gridShot(page, 'column-resize.png');
  }

  // Column reorder: move Category after Rating
  {
    await clearPersistence(page);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('table', { name: 'Product catalog' })).toBeVisible();
    await settle(page);

    const source = page.locator('th[data-column-id="category"] button.sdg__drag-handle');
    const target = page.locator('th[data-column-id="rating"]');
    const sourceBox = await source.boundingBox();
    const targetBox = await target.boundingBox();
    expect(sourceBox && targetBox).toBeTruthy();

    await page.mouse.move(
      sourceBox!.x + sourceBox!.width / 2,
      sourceBox!.y + sourceBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      targetBox!.x + targetBox!.width / 2,
      targetBox!.y + targetBox!.height / 2,
      { steps: 18 }
    );
    await page.mouse.up();
    await page.waitForTimeout(350);

    await page.locator('th[data-column-id="price"] button.sdg__drag-handle').hover();
    await gridShot(page, 'column-reorder.png');
  }

  // Column pinning: force overflow so sticky Product column stays while others slide
  {
    await clearPersistence(page);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('table', { name: 'Product catalog' })).toBeVisible();
    await settle(page);

    await page.addStyleTag({
      content: `
        .sdg__table { min-width: 1600px !important; }
        .sdg__th--pinned-left,
        .sdg__td--pinned-left {
          box-shadow: 6px 0 12px -6px rgba(24, 24, 27, 0.35) !important;
          z-index: 2 !important;
        }
      `,
    });

    const scroll = page.locator('.sdg__scroll').first();
    await scroll.evaluate((el) => {
      el.scrollLeft = 420;
    });
    await page.waitForTimeout(350);
    await expect(page.locator('th[data-column-id="name"]').first()).toHaveClass(/sdg__th--pinned-left/);
    const scrollLeft = await scroll.evaluate((el) => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(100);
    await gridShot(page, 'column-pinning.png');
  }

  // Employees
  await openFresh(page, '/employees', 'Employee roster');
  await shot(page, 'employees.png');

  // Admin dashboard
  await openFresh(page, '/admin', 'Enterprise support tickets');
  await shot(page, 'admin.png');

  // Dark theme — Products grid without Admin theme overrides, full viewport
  await openFresh(page, '/products', 'Product catalog');
  await applyDarkDemoTheme(page);
  await settle(page);
  await shot(page, 'dark.png');
});
