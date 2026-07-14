import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function selectScenario(page: import('@playwright/test').Page, id: string) {
  await page.locator(`[data-testid="scenario-${id}"]`).click();
  await expect(page.locator('[data-testid="active-scenario"]')).toHaveText(id);
  await page.waitForTimeout(500);
  await page.locator('.sdg').first().waitFor({ state: 'visible', timeout: 10000 });
}

test.describe('Phase 1 verification', () => {
  test('features 1-9', async ({ page }) => {
    const results: Record<string, string> = {};

    await page.goto('/');
    await page.waitForSelector('[data-testid="app-root"]');

    // 1. Theme API
    try {
      await selectScenario(page, 'theme');
      const sdg = page.locator('.sdg').first();
      await expect(sdg).toBeVisible();
      const styles = await sdg.evaluate((el) => {
        const cs = getComputedStyle(el);
        const th = document.querySelector('.sdg__th');
        const thCs = th ? getComputedStyle(th) : null;
        return {
          bg: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          borderColor: cs.borderTopColor,
          headerBg: thCs?.backgroundColor ?? null,
          primaryVar: el.style.getPropertyValue('--sdg-primary') || getComputedStyle(el).getPropertyValue('--sdg-primary'),
          radiusVar: getComputedStyle(el).getPropertyValue('--sdg-radius').trim(),
        };
      });
      const ok =
        styles.radiusVar === '20px' &&
        styles.bg.includes('255, 247, 237') &&
        styles.headerBg?.includes('255, 237, 213');
      results['1_theme'] = ok ? 'PASS' : `FAIL ${JSON.stringify(styles)}`;
    } catch (e: unknown) {
      results['1_theme'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 2. Density — verify distinct font sizes per preset (rem-relative)
    const densitySizes: number[] = [];
    for (const key of ['density-compact', 'density-comfortable', 'density-spacious'] as const) {
      try {
        await selectScenario(page, key);
        const fontSize = await page.locator('.sdg__td').first().evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize)
        );
        densitySizes.push(fontSize);
        const hasClass = await page.locator('.sdg__td').first().evaluate((el, k) =>
          el.classList.contains(
            k === 'density-compact' ? 'sdg__cell--compact' :
            k === 'density-comfortable' ? 'sdg__cell--comfortable' : 'sdg__cell--spacious'
          ), key);
        results[`2_${key}`] = hasClass ? 'PASS' : `FAIL missing density class`;
      } catch (e: unknown) {
        results[`2_${key}`] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    if (densitySizes.length === 3 && !(densitySizes[0] < densitySizes[1] && densitySizes[1] < densitySizes[2])) {
      results['2_density_order'] = `FAIL sizes=${densitySizes.join(',')}`;
    } else if (densitySizes.length === 3) {
      results['2_density_order'] = 'PASS';
    }

    // 3. rowPadding
    try {
      await selectScenario(page, 'padding-compact');
      const compact = await page.locator('.sdg').first().evaluate((el) => ({
        px: getComputedStyle(el).getPropertyValue('--sdg-cell-px').trim(),
        py: getComputedStyle(el).getPropertyValue('--sdg-cell-py').trim(),
      }));
      const okCompact = compact.px === '0.5rem' && compact.py === '0.25rem';
      results['3_padding_string'] = okCompact ? 'PASS' : `FAIL ${JSON.stringify(compact)}`;
    } catch (e: unknown) {
      results['3_padding_string'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      await selectScenario(page, 'padding-object');
      const obj = await page.locator('.sdg').first().evaluate((el) => ({
        px: getComputedStyle(el).getPropertyValue('--sdg-cell-px').trim(),
        py: getComputedStyle(el).getPropertyValue('--sdg-cell-py').trim(),
      }));
      const okObj = obj.px === '20px' && obj.py === '14px';
      results['3_padding_object'] = okObj ? 'PASS' : `FAIL ${JSON.stringify(obj)}`;
    } catch (e: unknown) {
      results['3_padding_object'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 4. rowHeight
    try {
      await selectScenario(page, 'rowheight-normal');
      const h = await page.locator('.sdg__tr[role="row"]').first().evaluate((el) => el.getBoundingClientRect().height);
      results['4_rowHeight_normal'] = h >= 50 && h <= 54 ? 'PASS' : `FAIL height=${h}`;
    } catch (e: unknown) {
      results['4_rowHeight_normal'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      await selectScenario(page, 'rowheight-virtual');
      await expect(page.locator('.sdg__scroll--virtual')).toBeVisible({ timeout: 10000 });
      const info = await page.evaluate(() => {
        const rows = document.querySelectorAll('.sdg__scroll--virtual tbody tr[role="row"]');
        const first = rows[0] as HTMLElement | undefined;
        return { count: rows.length, height: first?.getBoundingClientRect().height ?? 0 };
      });
      results['4_rowHeight_virtual'] =
        info.count > 0 && info.count < 100 && info.height >= 50 && info.height <= 54
          ? 'PASS'
          : `FAIL ${JSON.stringify(info)}`;
    } catch (e: unknown) {
      results['4_rowHeight_virtual'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 5. Column filters + global search
    try {
      await selectScenario(page, 'filters');
      const section = page.locator('[data-testid="grid-host"]');
      await section.locator('.sdg__search-input').fill('Alice');
      await page.waitForTimeout(200);
      let count = await section.locator('tbody tr[role="row"]').count();
      if (count !== 1) throw new Error(`global search expected 1 row, got ${count}`);

      await section.locator('.sdg__search-input').fill('');
      const nameFilter = section.locator('.sdg__filter-row input[type="text"]').first();
      await nameFilter.fill('Bob');
      await page.waitForTimeout(200);
      count = await section.locator('tbody tr[role="row"]').count();
      if (count !== 1) throw new Error(`string filter expected 1 row, got ${count}`);

      await nameFilter.fill('');
      const ageFilter = section.locator('.sdg__filter-row input[type="number"]').nth(1);
      await ageFilter.fill('30');
      await page.waitForTimeout(200);
      count = await section.locator('tbody tr[role="row"]').count();
      if (count !== 1) throw new Error(`number filter expected 1 row, got ${count}`);

      await ageFilter.fill('');
      const boolFilter = section.locator('.sdg__filter-row select').first();
      await boolFilter.selectOption('true');
      await page.waitForTimeout(200);
      count = await section.locator('tbody tr[role="row"]').count();
      if (count !== 2) throw new Error(`boolean filter expected 2 rows, got ${count}`);

      await boolFilter.selectOption('all');
      await nameFilter.fill('Alice');
      await section.locator('.sdg__search-input').fill('Alice');
      await page.waitForTimeout(200);
      count = await section.locator('tbody tr[role="row"]').count();
      if (count !== 1) throw new Error(`combined filter expected 1 row, got ${count}`);

      results['5_column_filters'] = 'PASS';
    } catch (e: unknown) {
      results['5_column_filters'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 6. striped
    try {
      await selectScenario(page, 'striped');
      const hasZebra = await page.locator('.sdg__tr--zebra').count();
      results['6_striped'] = hasZebra > 0 ? 'PASS' : `FAIL zebraCount=${hasZebra}`;
    } catch (e: unknown) {
      results['6_striped'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 7. hoverable
    try {
      await selectScenario(page, 'hoverable');
      const hasHover = await page.locator('.sdg__tr--hoverable').count();
      results['7_hoverable'] = hasHover > 0 ? 'PASS' : `FAIL hoverCount=${hasHover}`;
    } catch (e: unknown) {
      results['7_hoverable'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 8. stickyHeader
    try {
      await selectScenario(page, 'sticky');
      const sticky = await page.evaluate(() => {
        const thead = document.querySelector('.sdg__thead--sticky');
        const th = document.querySelector('.sdg__th');
        return {
          hasStickyClass: !!thead,
          position: thead ? getComputedStyle(thead).position : null,
          thBg: th ? getComputedStyle(th).backgroundColor : null,
        };
      });
      const ok = sticky.hasStickyClass && sticky.position === 'sticky';
      results['8_stickyHeader'] = ok ? 'PASS' : `FAIL ${JSON.stringify(sticky)}`;
    } catch (e: unknown) {
      results['8_stickyHeader'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    // 9. virtualization 100k
    try {
      await selectScenario(page, 'virtual-100k');
      await expect(page.locator('.sdg__scroll--virtual')).toBeVisible({ timeout: 120000 });
      const info = await page.evaluate(() => {
        const scroll = document.querySelector('.sdg__scroll--virtual') as HTMLElement | null;
        const rows = document.querySelectorAll('.sdg__scroll--virtual tbody tr[role="row"]');
        return {
          scrollH: scroll?.clientHeight ?? 0,
          roleRows: rows.length,
          scrollScrollH: scroll?.scrollHeight ?? 0,
        };
      });
      const ok =
        info.scrollH >= 350 &&
        info.roleRows > 0 &&
        info.roleRows < 500 &&
        info.scrollScrollH > info.scrollH;
      results['9_virtualization_100k'] = ok ? 'PASS' : `FAIL ${JSON.stringify(info)}`;
    } catch (e: unknown) {
      results['9_virtualization_100k'] = `FAIL ${e instanceof Error ? e.message : String(e)}`;
    }

    fs.writeFileSync(path.join(process.cwd(), 'phase1-results.json'), JSON.stringify(results, null, 2));
    console.log('PHASE1_RESULTS ' + JSON.stringify(results));

    for (const [k, v] of Object.entries(results)) {
      expect.soft(v, k).toBe('PASS');
    }
  });
});
