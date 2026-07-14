const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const report = await page.evaluate(() => {
    const allWithSdg = Array.from(document.querySelectorAll('[class*="sdg"]')).map((el) => ({
      tag: el.tagName,
      className: el.className,
    }));

    const sdgEl = document.querySelector('.sdg');
    const hasSdgClassInDOM = !!sdgEl;
    const rootCandidate = document.querySelector('#root > div > div, #root .sdg, #root [class]');
    // Structure under #root
    const rootHTML = document.querySelector('#root')?.innerHTML?.slice(0, 1500) ?? null;

    // Stylesheets / Sources equivalent
    const sheets = Array.from(document.styleSheets).map((sheet, idx) => {
      let href = sheet.href;
      let rulesCount = null;
      let sdgRules = [];
      let error = null;
      try {
        const rules = Array.from(sheet.cssRules || []);
        rulesCount = rules.length;
        sdgRules = rules
          .filter((r) => r.selectorText && String(r.selectorText).includes('.sdg'))
          .map((r) => ({
            selector: r.selectorText,
            cssText: r.cssText.slice(0, 300),
          }));
      } catch (e) {
        error = String(e.message || e);
      }
      return { idx, href, rulesCount, sdgRulesCount: sdgRules.length, sdgRules: sdgRules.slice(0, 5), error };
    });

    // Link/style tags in document
    const styleNodes = [
      ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => ({
        type: 'link',
        href: l.href,
      })),
      ...Array.from(document.querySelectorAll('style')).map((s, i) => ({
        type: 'style',
        id: s.id || null,
        textPreview: (s.textContent || '').slice(0, 200),
        hasSdg: (s.textContent || '').includes('.sdg'),
        length: (s.textContent || '').length,
      })),
    ];

    // Matched styles for .sdg via getComputedStyle + stylesheet scan
    let applied = null;
    let crossedOut = [];
    let winners = [];

    if (sdgEl) {
      const cs = getComputedStyle(sdgEl);
      applied = {
        display: cs.display,
        borderTopWidth: cs.borderTopWidth,
        borderTopStyle: cs.borderTopStyle,
        borderTopColor: cs.borderTopColor,
        backgroundColor: cs.backgroundColor,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        fontFamily: cs.fontFamily,
        height: cs.height,
        width: cs.width,
      };

      // Walk all rules matching .sdg (exact or compound) and see if properties appear overridden
      const matching = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let rules = [];
        try {
          rules = Array.from(sheet.cssRules || []);
        } catch {
          continue;
        }
        for (const rule of rules) {
          if (!rule.selectorText) continue;
          // element.matches for selector
          let matches = false;
          try {
            matches = sdgEl.matches(rule.selectorText);
          } catch {
            matches = rule.selectorText.split(',').some((sel) => {
              try {
                return sdgEl.matches(sel.trim());
              } catch {
                return false;
              }
            });
          }
          if (!matches) continue;
          const href = sheet.href || (sheet.ownerNode && sheet.ownerNode.id) || 'inline';
          matching.push({
            selector: rule.selectorText,
            href,
            cssText: rule.cssText,
            style: rule.style ? Array.from(rule.style).map((prop) => ({
              prop,
              value: rule.style.getPropertyValue(prop),
              priority: rule.style.getPropertyPriority(prop),
            })) : [],
          });
        }
      }

      // Compare declared vs computed for key .sdg props
      const propsOfInterest = [
        'display',
        'border-top-width',
        'background-color',
        'border-radius',
        'box-shadow',
        'font-family',
      ];
      crossedOut = [];
      for (const m of matching) {
        for (const { prop, value } of m.style) {
          if (!propsOfInterest.includes(prop)) continue;
          const computed = cs.getPropertyValue(prop);
          const overridden = computed.trim() !== value.trim() && value.trim() !== '';
          crossedOut.push({
            selector: m.selector,
            href: m.href,
            prop,
            declared: value,
            computed,
            appearsOverridden: overridden,
          });
        }
      }

      winners = matching.map((m) => ({ selector: m.selector, href: m.href, cssText: m.cssText.slice(0, 250) }));
      applied.matchingRules = matching.map((m) => ({
        selector: m.selector,
        href: m.href,
        cssText: m.cssText.slice(0, 400),
      }));
    }

    // Performance resource entries for css
    const resources = performance.getEntriesByType('resource').map((r) => ({
      name: r.name,
      type: r.initiatorType,
    })).filter((r) => /css|sabik|datagrid|index/i.test(r.name));

    return {
      url: location.href,
      hasSdgClassInDOM,
      sdgClassNameAttr: sdgEl ? sdgEl.getAttribute('class') : null,
      sdgOuterHTML: sdgEl ? sdgEl.outerHTML.slice(0, 300) : null,
      allWithSdgCount: allWithSdg.length,
      allWithSdgSample: allWithSdg.slice(0, 15),
      rootHTML,
      styleNodes,
      sheets,
      applied,
      crossedOut,
      winners,
      resources,
    };
  });

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
