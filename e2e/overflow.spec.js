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
