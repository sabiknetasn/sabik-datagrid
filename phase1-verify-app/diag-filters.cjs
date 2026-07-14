const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') console.log('BROWSER', msg.text());
  });
  await page.goto('http://127.0.0.1:5190/');
  await page.locator('[data-testid="scenario-filters"]').click();
  await page.waitForTimeout(500);
  const section = page.locator('[data-testid="grid-host"]');

  for (const [label, action] of [
    ['id=30 first number', async () => section.locator('.sdg__filter-row input[type="number"]').first().fill('30')],
    ['age=30 second number', async () => section.locator('.sdg__filter-row input[type="number"]').nth(1).fill('30')],
  ]) {
    await section.locator('.sdg__filter-row input[type="number"]').first().fill('');
    await section.locator('.sdg__filter-row input[type="number"]').nth(1).fill('');
    await action();
    await page.waitForTimeout(300);
    const count = await section.locator('tbody tr[role="row"]').count();
    console.log(label, 'rows=', count);
  }
  await browser.close();
})();
