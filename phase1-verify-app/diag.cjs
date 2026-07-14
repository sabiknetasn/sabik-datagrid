const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5190/');
  await page.waitForSelector('[data-testid="app-root"]');

  for (const s of ['striped', 'hoverable', 'filters']) {
    await page.locator(`[data-testid="scenario-${s}"]`).click();
    await page.waitForTimeout(600);
    const info = await page.evaluate(() => ({
      scenario: document.querySelector('[data-testid="active-scenario"]')?.textContent,
      rowClasses: Array.from(document.querySelectorAll('tbody tr[role="row"]')).map((r) => r.className),
      zebra: document.querySelectorAll('.sdg__tr--zebra').length,
      hover: document.querySelectorAll('.sdg__tr--hoverable').length,
      filterInputs: document.querySelectorAll('.sdg__col-filter').length,
      numberInputs: Array.from(document.querySelectorAll('.sdg__filter-row input')).map((i) => ({
        type: i.type,
        placeholder: i.placeholder,
        value: i.value,
      })),
    }));
    console.log(s, JSON.stringify(info, null, 2));
  }

  await browser.close();
})();
