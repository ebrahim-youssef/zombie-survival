import {test,expect} from "@playwright/test";

test("Stage 2: aligned projected torso is hittable by real gun fire",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  await page.keyboard.press("Digit4");
  const snapshot=await page.evaluate(()=>window.__zombieSmoke.debugState());
  expect(snapshot.hitboxes).toBe(true);
  expect(snapshot.playerBody?.radius).toBe(11);
  expect(snapshot.playerCombat).toMatchObject({
    radiusX:16,radiusY:16,
  });
  const result=await page.evaluate(()=>window.__zombieSmoke.alignedShot());
  expect(result).not.toBeNull();
  expect(result.visualWidth).toBe(32);
  expect(result.playerFootY-result.playerCombatY).toBe(0);
  expect(result.targetFootY-result.targetCombatY).toBe(0);
  expect(Math.abs(result.targetPhysicsFootY-result.targetFootY)).toBeLessThan(2);
  expect(Math.abs(result.muzzleY-result.playerFootY)).toBeLessThan(2);
  expect(Math.abs(result.physicsFootY-result.playerFootY)).toBeLessThan(2);
  expect(result.ammoUsed).toBe(1);
  expect(result.killed).toBe(true);
  expect(result.pointsGained).toBe(60);
  // Check the near-body edge, not the legacy foot-radius melee test.
  const melee=await page.evaluate(()=>window.__zombieSmoke.alignedMelee());
  expect(melee).toEqual({killed:true,pointsGained:130});
  await page.screenshot({
    path:"test-results/aligned-hurtbox-preview.png",animations:"disabled",
  });
  expect(errors).toEqual([]);
  await context.close();
});
