import { test, expect } from '@playwright/test';

test('virtualization 100k rows', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto('/');
  await page.locator('[data-testid="mount-virtual"]').click();

  await expect(page.locator('[data-testid="virtual-debug"]')).toHaveText('mounted:100000', {
    timeout: 60_000,
  });

  const grid = page.locator('.sdg').first();
  await expect(grid).toBeVisible({ timeout: 120_000 });

  const scroll = page.locator('.sdg__scroll--virtual').first();
  await expect(scroll).toBeVisible({ timeout: 30_000 });

  // Wait until virtual rows appear
  const rows = page.locator('.sdg__scroll--virtual tbody tr[role="row"]');
  await expect(rows.first()).toBeVisible({ timeout: 120_000 });

  const info = await page.evaluate(() => {
    const scrollEl = document.querySelector('.sdg__scroll--virtual') as HTMLElement | null;
    const roleRows = document.querySelectorAll('.sdg__scroll--virtual tbody tr[role="row"]').length;
    const allTr = document.querySelectorAll('.sdg__scroll--virtual tbody tr').length;
    return {
      scrollH: scrollEl?.clientHeight ?? null,
      scrollScrollH: scrollEl?.scrollHeight ?? null,
      roleRows,
      allTr,
    };
  });

  // Scroll and ensure rows still render
  await scroll.evaluate((el) => {
    el.scrollTop = 50000;
  });
  await page.waitForTimeout(500);
  const afterScroll = await rows.count();

  await scroll.evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(300);
  const afterTop = await rows.count();

  const result = {
    info,
    afterScroll,
    afterTop,
    errors,
    pass:
      errors.length === 0 &&
      info.scrollH !== null &&
      info.scrollH >= 350 &&
      info.scrollScrollH !== null &&
      info.scrollScrollH > info.scrollH &&
      info.roleRows > 0 &&
      info.roleRows < 500 &&
      afterScroll > 0 &&
      afterTop > 0,
  };

  console.log('VIRTUAL_RESULT ' + JSON.stringify(result));
  expect(result.pass, JSON.stringify(result)).toBe(true);
});
