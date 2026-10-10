/* eslint-disable @typescript-eslint/no-require-imports */
/* Run: PLAYWRIGHT_MODULE=<installed playwright-core> node tests/helpers/place-order-browser.cjs --test */
const assert = require('node:assert/strict');
module.exports = async function run(url) {
 const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
 const browser = await chromium.launch({headless:true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  const ids=()=>page.locator('[data-place-id]').evaluateAll(rows=>rows.map(row=>row.dataset.placeId));
  await page.goto(url);
  await page.locator('[data-place-id]').first().waitFor();
  const original=await ids();
  // Keyboard controls, no success before the asynchronous confirmation.
  await page.getByRole('button',{name:'Move Place 2 up',exact:true}).focus();
  await page.keyboard.press('Enter');
  assert.deepEqual((await ids()).slice(0,2),[original[1],original[0]]);
  await page.getByRole('button',{name:'Save Order',exact:true}).click();
  await page.getByRole('status').waitFor();
  await page.reload();
  await page.locator('[data-place-id]').first().waitFor();
  assert.equal((await ids())[0],original[1]);
  console.log('PASS keyboard move, confirmed save, refresh persistence');
  // Search retains global position and unsaved full-list order.
  await page.getByRole('searchbox').fill('Place 24');
  assert.equal(await page.locator('[data-place-id]').count(),1);
  await page.getByRole('button',{name:'Move Place 24 up',exact:true}).click();
  await page.getByRole('searchbox').fill('');
  assert.equal((await ids())[22],original[23]);
  await page.evaluate(()=>{window.orderFailure='UNKNOWN_ERROR';});
  await page.getByRole('button',{name:'Save Order',exact:true}).click();
  await page.getByRole('alert').waitFor();
  assert.equal((await ids())[22],original[23]);
  assert.equal(await page.getByRole('status').count(),0);
  console.log('PASS search global position and retained failed save');
  // Unsaved link navigation cancels, conflict recovery explicitly reloads.
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('link',{name:'Leave editor'}).click();
  assert.equal(new URL(page.url()).pathname,'/');
  await page.evaluate(()=>{window.orderFailure='ORDER_CONFLICT';});
  await page.getByRole('button',{name:'Save Order',exact:true}).click();
  await page.getByRole('button',{name:'Reload latest order'}).waitFor();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Reload latest order'}).click();
  await page.waitForFunction(()=>!document.querySelector('[role="alert"]'));
  assert.equal((await ids())[23],original[23]);
  await page.evaluate(()=>{window.orderFailure=undefined;});
  console.log('PASS unsaved link warning and concurrent-edit recovery');
  // A real pointer drag on desktop.
  await page.getByRole('searchbox').scrollIntoViewIfNeeded();
  const handle=await page.locator('[data-place-id]').nth(0).locator('button').first().boundingBox();
  const target=await page.locator('[data-place-id]').nth(1).boundingBox();
  await page.mouse.move(handle.x+20,handle.y+20); await page.mouse.down();
  await page.mouse.move(handle.x+20,target.y+target.height-8,{steps:12});
  await page.waitForTimeout(100); await page.mouse.up();
  assert.equal((await ids())[1],original[1]);
  await page.getByRole('button',{name:'Save Order',exact:true}).click();
  await page.getByRole('status').waitFor();
  console.log('PASS desktop pointer drag');
  for(const lang of ['en','ar','he']) {
   await page.goto(`${url}/?lang=${lang}`); await page.locator('[data-place-id]').first().waitFor();
   assert.deepEqual(await ids(),await page.evaluate(()=>JSON.parse(localStorage.getItem('order')).places.map(p=>p.id)));
   await page.setViewportSize({width:375,height:812}); await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  console.log('PASS matching EN/AR/HE order, mobile overflow, reduced motion');
  const mobile=await browser.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true});
  const touch=await mobile.newPage(); await touch.goto(url); await touch.locator('[data-place-id]').first().waitFor();
  const first=await touch.locator('[data-place-id]').nth(0).locator('button').first().boundingBox();
  const second=await touch.locator('[data-place-id]').nth(1).boundingBox();
  const cdp=await mobile.newCDPSession(touch);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:first.x+20,y:first.y+20}]});
  for(let step=1;step<=12;step++) {
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:first.x+20,y:first.y+20+(second.y+second.height-8-first.y-20)*step/12}]});
   await touch.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await touch.locator('[data-place-id]').nth(1).getAttribute('data-place-id'),original[0]);
  console.log('PASS mobile touch drag');
  const position=touch.getByRole('spinbutton',{name:'Position for Place 24',exact:true});
  await touch.getByRole('searchbox').fill('Place 24');
  await position.fill('1');
  await position.press('Enter');
  await touch.getByRole('searchbox').fill('');
  const moved=await touch.locator('[data-place-id]').evaluateAll(rows=>rows.map(row=>row.dataset.placeId));
  assert.deepEqual(moved,[original[23],original[1],original[0],...original.slice(2,23)]);
  await touch.getByRole('spinbutton',{name:'Position for Place 24',exact:true}).fill('25');
  await touch.getByRole('button',{name:'Move Place 24 to entered position',exact:true}).click();
  assert.deepEqual(await touch.locator('[data-place-id]').evaluateAll(rows=>rows.map(row=>row.dataset.placeId)),moved);
  await touch.getByRole('spinbutton',{name:'Position for Place 24',exact:true}).fill('1');
  await touch.getByRole('button',{name:'Save Order',exact:true}).click();
  await touch.getByRole('status').waitFor();
  await touch.reload(); await touch.locator('[data-place-id]').first().waitFor();
  assert.equal(await touch.locator('[data-place-id]').first().getAttribute('data-place-id'),original[23]);
  assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS typed position shifts intervening places, filtered search, invalid range, save and refresh on mobile');
  assert.deepEqual(errors,[]); console.log('PASS no browser runtime errors');
  await mobile.close();
 } finally { await browser.close(); }
};
