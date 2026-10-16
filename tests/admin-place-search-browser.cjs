/* eslint-disable @typescript-eslint/no-require-imports */
// PLAYWRIGHT_MODULE=<installed playwright-core> node tests/helpers/admin-place-search-browser.cjs --test
const assert = require('node:assert/strict');
const path = require('node:path');
module.exports = async function run(url) {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const waitSearch = value => page.waitForFunction(expected => new URLSearchParams(location.search).get('search') === expected, value);
    for (const lang of ['en', 'ar', 'he']) {
      const labels = require(path.join('..', 'dictionaries', `${lang}.json`)).adminPlaceSearch;
      await page.goto(`${url}/${lang}?page=3&category=nature#places`);
      const input = page.getByRole('searchbox', { name: labels.label, exact: true });
      await input.waitFor();
      await input.fill('c');
      await input.fill('ca');
      await input.fill('cafe');
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => window.navigationCalls.length), 0);
      await waitSearch('cafe');
      assert.equal(await page.evaluate(() => window.navigationCalls.length), 1);
      assert.equal(new URL(page.url()).searchParams.has('page'), false);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'nature');
      assert.equal(new URL(page.url()).hash, '#places');
      assert.equal(await page.evaluate(() => window.navigationCalls[0].options.scroll), false);
      assert.equal(await input.inputValue(), 'cafe');
      await input.fill('cafe ');
      await page.waitForTimeout(450);
      assert.equal(await page.evaluate(() => window.navigationCalls.length), 1);
      // All scripts can be entered regardless of the interface locale.
      for (const query of ['مجدل شمس', 'מסעדה']) {
        await input.fill(query);
        await waitSearch(query);
        assert.equal(await input.inputValue(), query);
      }
      const clear = page.getByRole('button', { name: labels.clear, exact: true });
      await clear.focus();
      await page.keyboard.press('Enter');
      await waitSearch(null);
      assert.equal(await input.inputValue(), '');
      assert.equal(await input.evaluate(element => element === document.activeElement), true);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'nature');
      assert.equal(new URL(page.url()).hash, '#places');
      // Changing history externally must synchronize the field without rewriting the page.
      await page.evaluate(() => window.navigateExternally(`${location.pathname}?search=historic&page=2#places`));
      await page.waitForFunction(() => document.querySelector('input').value === 'historic');
      await page.waitForTimeout(400);
      assert.equal(new URL(page.url()).searchParams.get('page'), '2');
      await page.goBack();
      await page.waitForFunction(() => document.querySelector('input').value === '');
      // Narrow and desktop RTL geometry, touch size, reduced motion, keyboard focus.
      await input.fill('query');
      await waitSearch('query');
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const field = await input.boundingBox();
        const button = await clear.boundingBox();
        assert.ok(field.height >= 44 && button.height >= 44 && button.width >= 44);
        assert.ok(lang === 'en' ? button.x > field.x + field.width / 2 : button.x < field.x + field.width / 2);
        await input.focus();
        assert.notEqual(await input.evaluate(element => getComputedStyle(element).boxShadow), 'none');
      }
      const settledCalls = await page.evaluate(() => window.navigationCalls.length);
      await input.fill('query ');
      await page.waitForTimeout(450);
      assert.equal(await page.evaluate(() => window.navigationCalls.length), settledCalls);
      console.log(`PASS ${lang}: debounce, multilingual input, clear/focus, query/page/hash, history, responsive RTL`);
    }
    const labels = require('../dictionaries/en.json').adminPlaceSearch;
    await page.goto(`${url}/en?search=original&page=3`);
    const input = page.getByRole('searchbox', { name: labels.label, exact: true });
    await input.waitFor();
    await page.evaluate(() => { window.navigationDelay = 450; });
    await input.fill('first');
    await page.waitForFunction(() => window.navigationCalls.length === 1);
    await input.fill('latest');
    await waitSearch('latest');
    assert.equal(await input.inputValue(), 'latest');
    await page.waitForTimeout(450);
    assert.equal(new URL(page.url()).searchParams.get('search'), 'latest');
    await input.fill('pending');
    await page.waitForFunction(() => window.navigationCalls.some(call => new URL(call.url, location.href).searchParams.get('search') === 'pending'));
    await page.getByRole('button', { name: labels.clear, exact: true }).click();
    await waitSearch(null);
    await page.waitForTimeout(500);
    assert.equal(await input.inputValue(), '');
    assert.equal(new URL(page.url()).searchParams.has('search'), false);
    console.log('PASS delayed navigation retains latest typing; clear cancels pending search');
    assert.deepEqual(errors, []);
    console.log('PASS no browser runtime errors');
  } finally {
    await browser.close();
  }
};
