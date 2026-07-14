import { test } from '@playwright/test';

test('diagnose 100 rows only', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('/');
  await page.locator('[data-testid="mount-virtual-100"]').click();
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => {
    const section = document.querySelector('[data-testid="virtual-section"]');
    return {
      debug: document.querySelector('[data-testid="virtual-debug"]')?.textContent,
      scrollH: (section?.querySelector('.sdg__scroll') as HTMLElement | null)?.clientHeight ?? null,
      roleRows: section?.querySelectorAll('tbody tr[role="row"]').length ?? 0,
      allTr: section?.querySelectorAll('tbody tr').length ?? 0,
      tbodyChildCount: section?.querySelector('tbody')?.childElementCount ?? null,
      firstRowText: section?.querySelector('tbody tr[role="row"]')?.textContent ?? null,
    };
  });

  console.log('DIAG ' + JSON.stringify({ info, errors }, null, 2));
});
