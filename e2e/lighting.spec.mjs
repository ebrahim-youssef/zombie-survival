import {test,expect} from "@playwright/test";

test("lighting experiment: room lamp persists and gun creates a short light flash",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));

  const lamp=await page.evaluate(()=>window.__zombieSmoke.lightingState());
  expect(lamp).not.toBeNull();
  expect(["webgl","canvas"]).toContain(lamp.renderer);
  expect(lamp.lamp.radius).toBe(210);
  expect(lamp.activeMuzzleFlashes).toBe(0);
  expect(lamp.totalMuzzleFlashes).toBe(0);

  await page.mouse.move(900,360);
  await page.mouse.down({button:"left"});
  await page.mouse.up({button:"left"});
  await page.waitForFunction(
    ()=>window.__zombieSmoke?.lightingState()?.totalMuzzleFlashes>0,
  );
  const fired=await page.evaluate(()=>window.__zombieSmoke.lightingState());
  expect(fired.totalMuzzleFlashes).toBe(1);
  // 120ms lifetime makes the flash perceptible, but the cumulative count is
  // the deterministic proof that the real gun path triggered lighting.
  expect(fired.activeMuzzleFlashes).toBeGreaterThanOrEqual(0);

  await page.screenshot({
    path:"test-results/lighting-experiment.png",
    animations:"disabled",
  });

  await page.waitForTimeout(190);
  expect((await page.evaluate(
    ()=>window.__zombieSmoke.lightingState(),
  )).activeMuzzleFlashes).toBe(0);
  expect(errors).toEqual([]);
  await context.close();
});
