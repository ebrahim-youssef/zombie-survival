import { test, expect } from "@playwright/test";

test("Shift+1 and Shift+7 toggle independent debug/raycast and real hitboxes", async ({ browser }) => {
  test.setTimeout(60_000); // Shared Chromium runners occasionally start slowly.
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(() => window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640, 360);
  await page.waitForFunction(() => window.__zombieSmoke?.isActive("game"));
  const debug = () => page.evaluate(() => window.__zombieSmoke.debugState());
  const initial = await debug();
  expect(initial).toMatchObject({ overlay: false, hitboxes: false, god: false });
  expect(initial.playerBody).toMatchObject({ isCircle: true });
  expect(initial.playerBody.radius).toBeGreaterThan(0);

  // Plain 1/2 remain inventory keys; they cannot enable diagnostics.
  await page.keyboard.press("Digit1");
  expect((await debug()).overlay).toBe(false);

  await page.keyboard.press("Shift+Digit1");
  expect(await debug()).toMatchObject({ overlay: true, hitboxes: false });

  await page.keyboard.press("Shift+Digit7");
  expect(await debug()).toMatchObject({ overlay: true, hitboxes: true });

  const previousPoints = (await debug()).points;
  await page.keyboard.press("Shift+Digit2");
  expect((await debug()).points).toBe(previousPoints + 950);

  await page.keyboard.press("Shift+Digit6");
  expect((await debug()).god).toBe(true);
  await page.keyboard.press("Shift+Digit6");
  expect((await debug()).god).toBe(false);

  // Ranges can be turned off while *real* colliders stay visible.
  await page.keyboard.press("Shift+Digit1");
  expect(await debug()).toMatchObject({ overlay: false, hitboxes: true });
  await page.screenshot({
    path: "test-results/debug-hitboxes-preview.png",
    animations: "disabled",
  });
  await page.keyboard.press("Shift+Digit7");
  expect(await debug()).toMatchObject({ overlay: false, hitboxes: false });
  expect(errors).toEqual([]);
  await context.close();
});
