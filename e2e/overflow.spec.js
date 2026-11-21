import { expect, test } from '@playwright/test';

const WIDTHS = [320, 360, 375, 390, 412, 430];
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

// scrollWidth mayor que el ancho pedido: la página se sale. innerWidth a veces
// crece con el contenido en emulación móvil; por eso se compara con el ancho fijado.
async function assertFits(page, width, label) {
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(box.scrollWidth, `${label}: scrollWidth ${box.scrollWidth}px`).toBeLessThanOrEqual(width + 1);
  expect(box.scrollWidth, `${label}: scrollWidth > innerWidth`).toBeLessThanOrEqual(box.innerWidth + 1);

  const escaped = await page.evaluate((vw) => {
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      if (rect.right <= vw + 1 && rect.left >= -1) continue;
      let parent = el.parentElement;
      let insideScroller = false;
      while (parent) {
        const style = getComputedStyle(parent);
        const parentRect = parent.getBoundingClientRect();
        const clips = style.overflowX === 'auto' || style.overflowX === 'hidden' || style.overflowX === 'clip' || style.overflowX === 'scroll';
        if (clips && parentRect.left >= -1 && parentRect.right <= vw + 1) {
          insideScroller = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!insideScroller) {
        const cls = typeof el.className === 'string' ? el.className.slice(0, 80) : '';
        bad.push(`${el.tagName} L${Math.round(rect.left)} R${Math.round(rect.right)} ${cls}`);
      }
    }
    return bad.slice(0, 6);
  }, width);
  expect(escaped, `${label}: piezas fuera del ancho`).toEqual([]);
}

test.describe('sin scroll horizontal', () => {
  test('login, explorar, mapa y fichas en 320–430 px', async ({ browser }) => {
    const setup = await browser.newContext({ viewport: { width: 390, height: 800 }, locale: 'es-MX' });
    const setupPage = await setup.newPage();
    await setupPage.goto(BASE + '/');
    await setupPage.getByRole('button', { name: /demo/i }).click();
    await setupPage.waitForSelector('nav');
    const state = await setup.storageState();
    await setup.close();

    for (const locale of ['es', 'en']) {
      for (const zoom of [1, 1.3]) {
        const context = await browser.newContext({
          viewport: { width: 390, height: 800 },
          locale: locale === 'es' ? 'es-MX' : 'en-US',
          storageState: state,
          hasTouch: true,
          isMobile: true,
        });
        await context.addInitScript(({ locale: loc, zoom: scale }) => {
          localStorage.setItem('kindhop.locale', loc);
          if (scale !== 1) {
            const apply = () => { document.documentElement.style.fontSize = `${scale * 100}%`; };
            apply();
            document.addEventListener('DOMContentLoaded', apply);
          }
        }, { locale, zoom });
        const page = await context.newPage();
        const fresh = await browser.newContext({
          viewport: { width: 390, height: 800 },
          locale: locale === 'es' ? 'es-MX' : 'en-US',
          hasTouch: true,
          isMobile: true,
        });
        await fresh.addInitScript(({ locale: loc, zoom: scale }) => {
          localStorage.setItem('kindhop.locale', loc);
          if (scale !== 1) {
            const apply = () => { document.documentElement.style.fontSize = `${scale * 100}%`; };
            apply();
            document.addEventListener('DOMContentLoaded', apply);
          }
        }, { locale, zoom });
        const login = await fresh.newPage();
        page.setDefaultTimeout(12_000);
        const tag = `${locale}${zoom === 1 ? '' : ' zoom130'}`;

        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: 780 });
          await login.setViewportSize({ width, height: 780 });
          await login.goto(BASE + '/');
          await login.getByRole('button', { name: /demo/i }).waitFor();
          await assertFits(login, width, `login ${tag} ${width}`);

          await page.goto(BASE + '/?tab=explore');
          await page.waitForSelector('#explore-q');
          await page.waitForTimeout(250);
          await assertFits(page, width, `explorar ${tag} ${width}`);

          const more = page.getByRole('button', { name: /ver todo|see all|más|more/i }).first();
          if (await more.count()) {
            await more.click();
            await page.waitForTimeout(200);
            await assertFits(page, width, `explorar categorías ${tag} ${width}`);
          }

          const event = page.locator('[data-event-open]').first();
          await event.click();
          await page.getByRole('dialog').waitFor();
          await page.waitForTimeout(200);
          await assertFits(page, width, `ficha evento ${tag} ${width}`);
          await page.getByRole('button', { name: /cerrar|close/i }).first().click();
          await page.waitForTimeout(150);

          await page.goto(BASE + '/?tab=map');
          await page.waitForTimeout(600);
          await assertFits(page, width, `mapa ${tag} ${width}`);

          await page.getByRole('button', { name: /capas|layers/i }).click();
          await page.waitForTimeout(200);
          await assertFits(page, width, `capas ${tag} ${width}`);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(250);

          await page.getByRole('button', { name: /explorar en el mapa|browse the map/i }).click();
          await page.waitForTimeout(250);
          await assertFits(page, width, `lista mapa ${tag} ${width}`);
        }
        await fresh.close();
        await context.close();
      }
    }
  });
});

// ── Shell, Inicio y Billetera (KH-022, PR #39) ──

// Falla si la página es más ancha que el viewport o si alguna caja se sale por los lados.
// Segunda parte (PR #39): shell, Inicio, Billetera, hoja de gasto y Ajustes.
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
