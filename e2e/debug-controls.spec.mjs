import { test, expect } from "@playwright/test";

test("physical number keys 3/4 control ranges and actual Arcade hitboxes", async ({ browser }) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(() => window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640, 360);
  await page.waitForFunction(() => window.__zombieSmoke?.isActive("game"));
  const state = () => page.evaluate(() => window.__zombieSmoke.debugState());
  expect(await state()).toMatchObject({ overlay: false, hitboxes: false, god: false });
  expect((await state()).playerBody).toMatchObject({ isCircle: true });

  // Old F/Shift shortcuts do not accidentally toggle the debug layer.
  await page.keyboard.press("Digit1");
  await page.keyboard.press("Shift+Digit4");
  expect(await state()).toMatchObject({ overlay: false, hitboxes: false });

  await page.keyboard.press("Digit3");
  expect(await state()).toMatchObject({ overlay: true, hitboxes: false });
  await page.keyboard.press("Digit4");
  expect(await state()).toMatchObject({ overlay: true, hitboxes: true });
  const previousPoints = (await state()).points;
  await page.keyboard.press("Digit5");
  expect((await state()).points).toBe(previousPoints + 950);
  await page.keyboard.press("Digit9");
  expect((await state()).god).toBe(true);
  await page.keyboard.press("Digit9");
  expect((await state()).god).toBe(false);

  // Actual physics bodies remain visible when the ranges turn off.
  await page.keyboard.press("Digit3");
  expect(await state()).toMatchObject({ overlay: false, hitboxes: true });
  await page.screenshot({
    path: "test-results/debug-hitboxes-preview.png",
    animations: "disabled",
  });
  await page.keyboard.press("Digit4");
  expect(await state()).toMatchObject({ overlay: false, hitboxes: false });
  await page.keyboard.press("Digit0");
  await expect(page.locator("#game-root canvas")).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});
