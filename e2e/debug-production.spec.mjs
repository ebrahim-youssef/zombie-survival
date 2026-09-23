import { test, expect } from "@playwright/test";

test("production preview: explicitly opted-in QA works with plain 4 key", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/?debug=1");
  await page.waitForFunction(() => window.__zombieDebug?.scene("menu"));
  await page.mouse.click(640, 360);
  await page.waitForFunction(() => window.__zombieDebug?.scene("game"));
  const state = () => page.evaluate(() => window.__zombieDebug.state());
  expect(await state()).toMatchObject({ overlay: false, hitboxes: false });
  await page.keyboard.press("Digit4");
  expect(await state()).toMatchObject({ overlay: false, hitboxes: true });
  await page.keyboard.press("Digit3");
  expect(await state()).toMatchObject({ overlay: true, hitboxes: true });
  await page.keyboard.press("Digit4");
  expect(await state()).toMatchObject({ overlay: true, hitboxes: false });
  expect(errors).toEqual([]);
  await context.close();
});

test("production preview: no query keeps debug disabled", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#game-root canvas")).toBeVisible();
  expect(await page.evaluate(() => window.__zombieDebug)).toBeUndefined();
  expect(await page.evaluate(() => window.__zombieSmoke)).toBeUndefined();
  expect(errors).toEqual([]);
  await context.close();
});
