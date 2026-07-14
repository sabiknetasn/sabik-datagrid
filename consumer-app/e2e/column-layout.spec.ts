import { expect, test } from '@playwright/test';

async function clearGridPersistence(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sabik-datagrid-persistence:')) {
        localStorage.removeItem(key);
      }
    }
  });
}

async function openProductsFresh(page: import('@playwright/test').Page) {
  await page.goto('/products', { waitUntil: 'networkidle' });
  await clearGridPersistence(page);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('table', { name: 'Product catalog' })).toBeVisible();
}

test.describe('Column layout features', () => {
  test('renders resize handles for data columns', async ({ page }) => {
    await openProductsFresh(page);
    const separators = page.locator('[role="separator"][aria-orientation="vertical"]');
    await expect(separators.first()).toBeVisible();
    expect(await separators.count()).toBeGreaterThan(2);
  });

  test('resizes a column via drag handle', async ({ page }) => {
    await openProductsFresh(page);
    const productHeader = page.locator('th[data-column-id="name"]').first();
    await expect(productHeader).toBeVisible();

    const before = await productHeader.boundingBox();
    expect(before).toBeTruthy();

    const handle = productHeader.locator('.sdg__resize');
    const box = await handle.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + 80, box!.y + box!.height / 2, { steps: 8 });
    await page.mouse.up();

    const after = await productHeader.boundingBox();
    expect(after).toBeTruthy();
    expect(after!.width).toBeGreaterThan(before!.width + 20);
  });

  test('shows reorder drag handles when reorderable', async ({ page }) => {
    await openProductsFresh(page);
    const handles = page.locator('button.sdg__drag-handle');
    await expect(handles.first()).toBeVisible();
    expect(await handles.count()).toBeGreaterThan(2);
  });

  test('reorders columns via drag handle', async ({ page }) => {
    await openProductsFresh(page);

    const headers = page.locator('.sdg__header-row th[data-column-id]');
    const beforeIds = await headers.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('data-column-id'))
    );

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
      { steps: 16 }
    );
    await page.mouse.up();
    await page.waitForTimeout(200);

    const afterIds = await headers.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('data-column-id'))
    );

    expect(afterIds).not.toEqual(beforeIds);

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem(
        'sabik-datagrid-persistence:consumer-products-layout:columnOrder'
      );
      return raw ? (JSON.parse(raw) as string[]) : null;
    });
    expect(stored).toBeTruthy();
    expect(stored).not.toEqual(beforeIds);
  });

  test('pins the Product column to the left with sticky styles', async ({ page }) => {
    await openProductsFresh(page);
    const pinnedHeader = page.locator('th[data-column-id="name"]').first();
    await expect(pinnedHeader).toHaveClass(/sdg__th--pinned-left/);

    const position = await pinnedHeader.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe('sticky');

    const pinnedCell = page.locator('td.sdg__td--pinned-left').first();
    await expect(pinnedCell).toBeVisible();
  });

  test('persists column sizing with persistenceKey', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' });
    await clearGridPersistence(page);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('table', { name: 'Product catalog' })).toBeVisible();

    const productHeader = page.locator('th[data-column-id="name"]').first();
    const handle = productHeader.locator('.sdg__resize');
    const box = await handle.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + 70, box!.y + box!.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    const sizing = await page.evaluate(() => {
      const raw = localStorage.getItem(
        'sabik-datagrid-persistence:consumer-products-layout:columnSizing'
      );
      return raw ? (JSON.parse(raw) as Record<string, number>) : null;
    });
    expect(sizing).toBeTruthy();
    expect(sizing!.name).toBeGreaterThan(280);

    const widthAfterResize = (await productHeader.boundingBox())!.width;

    // Reload without clearing storage
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('table', { name: 'Product catalog' })).toBeVisible();

    const restored = page.locator('th[data-column-id="name"]').first();
    const restoredWidth = (await restored.boundingBox())!.width;
    expect(Math.abs(restoredWidth - widthAfterResize)).toBeLessThan(6);
  });
});
