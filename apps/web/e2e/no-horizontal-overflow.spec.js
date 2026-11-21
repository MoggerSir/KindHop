import { expect, test } from '@playwright/test';

// Falla si la página es más ancha que el viewport o si alguna caja se sale por los lados.
// Cubre el shell, Inicio y la Billetera (KH-022). No abre Explorar ni Mapa.
// Requiere `npm run dev` con AUTH_DEV_LOGIN=true (no entra en `npm run check`).
const WIDTHS = [320, 360, 375, 390, 412, 430];
const COPY = {
  es: { more: /^Más$/, less: /^Ver menos$/, add: 'Añadir gasto', clear: 'Empezar en cero', settings: 'Abrir ajustes', close: 'Cerrar', start: 'Empezar', cat: 'Música' },
  en: { more: /^More$/, less: /^Show less$/, add: 'Add expense', clear: 'Start fresh', settings: 'Open settings', close: 'Close', start: 'Start', cat: 'Music' },
};

async function horizontalOverflow(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 && rect.height < 1) continue;
      const over = rect.right - vw;
      const under = -rect.left;
      if (over > 1 || under > 1) {
        const cls = typeof el.className === 'string' ? el.className.slice(0, 80) : '';
        offenders.push({ tag: el.tagName, cls, over: Math.round(over), under: Math.round(under) });
      }
    }
    return { delta: document.documentElement.scrollWidth - vw, count: offenders.length, sample: offenders.slice(0, 4) };
  });
}

async function fits(page, label) {
  const result = await horizontalOverflow(page);
  expect(result.delta, `${label} scrollWidth ${JSON.stringify(result.sample)}`).toBeLessThanOrEqual(1);
  expect(result.count, `${label} cajas fuera ${JSON.stringify(result.sample)}`).toBe(0);
}

async function zoom(page, size) {
  await page.evaluate((value) => {
    document.documentElement.style.fontSize = value ?? '';
  }, size);
}

async function closeDialog(page, copy) {
  const dialog = page.getByRole('dialog');
  if (await dialog.count()) {
    await page.getByRole('button', { name: copy.close, exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
  }
}

test('shell, inicio y billetera caben en 320–430 px', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/?tab=budget');
  await page.getByRole('button', { name: /demo/i }).click();
  await page.getByRole('heading', { name: /Billetera|Wallet/ }).waitFor();

  for (const locale of ['es', 'en']) {
    const copy = COPY[locale];
    await page.evaluate((code) => localStorage.setItem('kindhop.locale', code), locale);
    await page.evaluate(() => localStorage.removeItem('kindhop.budget.v1'));

    for (const size of [null, '130%']) {
      await page.goto('/?tab=home');
      await zoom(page, size);
      await page.getByRole('button', { name: copy.cat }).waitFor();

      for (const width of WIDTHS) {
        const label = `${locale} ${width}px ${size ?? '100%'}`;
        await page.setViewportSize({ width, height: 800 });
        await fits(page, `inicio ${label}`);
        const more = page.getByRole('button', { name: copy.more });
        if (await more.count()) await more.click();
        await page.getByRole('button', { name: copy.less }).waitFor();
        await fits(page, `más categorías ${label}`);
        await page.getByRole('button', { name: copy.less }).click();
      }

      await page.goto('/?tab=budget');
      await zoom(page, size);
      await page.locator('select').first().selectOption({ label: 'Ciudad de México' });
      await page.getByRole('button', { name: copy.add }).waitFor();

      for (const width of WIDTHS) {
        const label = `${locale} ${width}px ${size ?? '100%'}`;
        await page.setViewportSize({ width, height: 800 });
        await fits(page, `billetera demo ${label}`);
        await page.getByRole('button', { name: copy.add }).click();
        await page.getByRole('dialog').waitFor();
        await fits(page, `hoja de gasto ${label}`);
        await closeDialog(page, copy);
        await page.getByRole('button', { name: copy.settings }).click();
        await page.getByRole('dialog').waitFor();
        await fits(page, `ajustes ${label}`);
        await closeDialog(page, copy);
      }

      await page.getByRole('button', { name: copy.clear }).click();
      await page.getByRole('button', { name: copy.start }).waitFor();
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await fits(page, `presupuesto vacío ${locale} ${width}px ${size ?? '100%'}`);
      }
      await page.evaluate(() => localStorage.removeItem('kindhop.budget.v1'));
    }
  }
});
