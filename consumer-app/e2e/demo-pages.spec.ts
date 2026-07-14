import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEMO_PAGES = [
  {
    name: 'Users',
    path: '/users',
    title: 'Basic Users Table',
    ariaLabel: 'Users directory',
  },
  {
    name: 'Products',
    path: '/products',
    title: 'Ecommerce Products Table',
    ariaLabel: 'Product catalog',
  },
  {
    name: 'Employees',
    path: '/employees',
    title: 'Employee Management Table',
    ariaLabel: 'Employee roster',
  },
  {
    name: 'Admin',
    path: '/admin',
    title: 'Enterprise Admin Dashboard',
    ariaLabel: 'Enterprise support tickets',
  },
] as const;

function isRelevantConsoleError(message: ConsoleMessage): boolean {
  if (message.type() !== 'error') return false;
  const text = message.text();

  // Vite / browser noise that is not an application failure
  if (text.includes('Download the React DevTools')) return false;
  if (text.includes('favicon')) return false;

  return true;
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (isRelevantConsoleError(message)) {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function assertDataGridVisible(page: Page, ariaLabel: string) {
  const table = page.getByRole('table', { name: ariaLabel });
  await expect(table).toBeVisible();

  // DataGrid root / structure from sabik-datagrid
  await expect(page.locator('.sdg').first()).toBeVisible();
  await expect(page.locator('.sdg__table').first()).toBeVisible();

  // At least one data or header row rendered
  const headerCells = table.locator('th');
  await expect(headerCells.first()).toBeVisible();
  expect(await headerCells.count()).toBeGreaterThan(0);

  const bodyRows = table.locator('tbody tr');
  await expect(bodyRows.first()).toBeVisible();
  expect(await bodyRows.count()).toBeGreaterThan(0);
}

test.describe('Showcase demo pages', () => {
  for (const demo of DEMO_PAGES) {
    test(`${demo.name} page loads and DataGrid renders without console errors`, async ({
      page,
    }) => {
      const errors = await collectConsoleErrors(page);

      await page.goto(demo.path, { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { level: 1, name: demo.title })).toBeVisible();
      await assertDataGridVisible(page, demo.ariaLabel);

      // Leave a short beat for delayed React warnings / effect errors
      await page.waitForTimeout(300);

      expect(errors, `Console/page errors on ${demo.path}:\n${errors.join('\n')}`).toEqual([]);
    });
  }

  test('sidebar navigation reaches every demo page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Tables that feel finished.' })).toBeVisible();

    for (const demo of DEMO_PAGES) {
      await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: demo.name }).click();
      await expect(page).toHaveURL(new RegExp(`${demo.path}$`));
      await assertDataGridVisible(page, demo.ariaLabel);
    }

    await page.waitForTimeout(200);
    expect(errors, `Console/page errors during nav:\n${errors.join('\n')}`).toEqual([]);
  });
});
