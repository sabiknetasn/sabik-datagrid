import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('P0 verification suite', async ({ page }) => {
  const results: Record<string, string> = {
    '1_styling': 'FAIL not run',
    '2_virtualization': 'FAIL not run',
    '3_rowActions': 'FAIL not run',
    '4_bulkActions': 'FAIL not run',
    '5_export': 'FAIL not run',
    '6_persistence': 'FAIL not run',
  };

  try {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-root"]');

    // 1. Styling without Tailwind
    try {
      const styleTag = page.locator('#sabik-datagrid-styles');
      await expect(styleTag).toHaveCount(1, { timeout: 5000 });
      const styleText = (await styleTag.textContent()) || '';
      const root = page.locator('[data-testid="styles-section"] .sdg').first();
      await expect(root).toBeVisible();
      const border = await root.evaluate((el) => getComputedStyle(el).borderTopWidth);
      const bg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
      const styled =
        styleText.includes('.sdg') &&
        border !== '0px' &&
        bg !== 'rgba(0, 0, 0, 0)' &&
        bg !== 'transparent';
      results['1_styling'] = styled
        ? 'PASS'
        : `FAIL border=${border} bg=${bg} hasRules=${styleText.includes('.sdg')}`;
    } catch (e: any) {
      results['1_styling'] = `FAIL ${e.message}`;
    }

    // 3. RowActions
    try {
      const actionsSection = page.locator('[data-testid="actions-section"]');
      await actionsSection.scrollIntoViewIfNeeded();
      const menuBtn = actionsSection.locator('.sdg__actions-trigger').first();
      await expect(menuBtn).toBeVisible({ timeout: 5000 });
      await menuBtn.click();
      const editItem = actionsSection.locator('.sdg__actions-item', { hasText: 'Edit' });
      await expect(editItem).toBeVisible({ timeout: 3000 });
      await editItem.click();
      await expect(page.locator('[data-testid="row-action-log"]')).toHaveText(/edit:\d+/, {
        timeout: 5000,
      });
      results['3_rowActions'] = 'PASS';
    } catch (e: any) {
      results['3_rowActions'] = `FAIL ${e.message}`;
    }

    // 4. BulkActions
    try {
      const actionsSection = page.locator('[data-testid="actions-section"]');
      await actionsSection.locator('tbody tr[role="row"]').nth(0).locator('input[type="checkbox"]').check();
      await actionsSection.locator('tbody tr[role="row"]').nth(1).locator('input[type="checkbox"]').check();
      await expect(actionsSection.locator('.sdg__bulk')).toBeVisible({ timeout: 5000 });
      await actionsSection.locator('.sdg__bulk button', { hasText: 'Archive' }).click();
      await expect(page.locator('[data-testid="bulk-action-log"]')).toHaveText(/Archive:\d+,\d+/, {
        timeout: 5000,
      });
      results['4_bulkActions'] = 'PASS';
    } catch (e: any) {
      results['4_bulkActions'] = `FAIL ${e.message}`;
    }

    // 5. Export
    try {
      const actionsSection = page.locator('[data-testid="actions-section"]');
      await actionsSection.locator('button', { hasText: 'Export' }).click();
      await expect(page.locator('[data-testid="export-log"]')).toHaveText('export:csv', {
        timeout: 5000,
      });
      results['5_export'] = 'PASS';
    } catch (e: any) {
      results['5_export'] = `FAIL ${e.message}`;
    }

    // 6. Persistence isolation
    try {
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForSelector('[data-testid="persistence-section"]');
      const persistence = page.locator('[data-testid="persistence-section"]');
      await persistence.scrollIntoViewIfNeeded();

      const gridA = persistence.locator('[data-testid="grid-a"]');
      const gridB = persistence.locator('[data-testid="grid-b"]');

      await gridA.locator('.sdg__select').selectOption('20');
      await page.waitForTimeout(300);
      await gridB.locator('.sdg__select').selectOption('50');
      await page.waitForTimeout(300);

      const aPage = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('sabik-datagrid-persistence:grid-a:pagination') || 'null')
      );
      const bPage = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('sabik-datagrid-persistence:grid-b:pagination') || 'null')
      );
      const keys = await page.evaluate(() => Object.keys(localStorage).sort());

      const isolated =
        aPage?.pageSize === 20 &&
        bPage?.pageSize === 50 &&
        keys.some((k) => k.includes('grid-a')) &&
        keys.some((k) => k.includes('grid-b'));

      results['6_persistence'] = isolated
        ? 'PASS'
        : `FAIL keys=${JSON.stringify(keys)} a=${JSON.stringify(aPage)} b=${JSON.stringify(bPage)}`;
    } catch (e: any) {
      results['6_persistence'] = `FAIL ${e.message}`;
    }

    // 2. Virtualization — 100k (also probes 100 if 100k is empty/hangs)
    try {
      const virtualSection = page.locator('[data-testid="virtual-section"]');
      await virtualSection.scrollIntoViewIfNeeded();

      // Probe with 100 rows first (proves virtual body wiring)
      await page.locator('[data-testid="mount-virtual-100"]').click();
      await page.waitForTimeout(2000);
      const probe100 = await page.evaluate(() => {
        const section = document.querySelector('[data-testid="virtual-section"]');
        return {
          debug: document.querySelector('[data-testid="virtual-debug"]')?.textContent,
          roleRows: section?.querySelectorAll('tbody tr[role="row"]').length ?? 0,
          tbodyChildren: section?.querySelector('tbody')?.childElementCount ?? 0,
        };
      });

      // Then attempt 100k
      let probe100k: any = { skipped: true };
      try {
        await Promise.race([
          (async () => {
            await page.locator('[data-testid="mount-virtual"]').click();
            await page.waitForTimeout(8000);
            probe100k = await page.evaluate(() => {
              const section = document.querySelector('[data-testid="virtual-section"]');
              return {
                debug: document.querySelector('[data-testid="virtual-debug"]')?.textContent,
                roleRows: section?.querySelectorAll('tbody tr[role="row"]').length ?? 0,
                tbodyChildren: section?.querySelector('tbody')?.childElementCount ?? 0,
              };
            });
          })(),
          page.waitForTimeout(15000).then(() => {
            probe100k = { timeout: true };
          }),
        ]);
      } catch (e: any) {
        probe100k = { error: e.message };
      }

      const ok100 = probe100.roleRows > 0 && probe100.roleRows < 500;
      const ok100k =
        probe100k &&
        !probe100k.timeout &&
        !probe100k.error &&
        probe100k.debug === 'mounted:100000' &&
        probe100k.roleRows > 0 &&
        probe100k.roleRows < 500;

      results['2_virtualization'] = ok100k
        ? 'PASS'
        : `FAIL probe100=${JSON.stringify(probe100)} probe100k=${JSON.stringify(probe100k)}`;
    } catch (e: any) {
      results['2_virtualization'] = `FAIL ${e.message}`;
    }
  } finally {
    const out = path.join(process.cwd(), 'p0-runtime-results.json');
    fs.writeFileSync(out, JSON.stringify(results, null, 2));
    console.log('P0_RESULTS ' + JSON.stringify(results));
  }
});
