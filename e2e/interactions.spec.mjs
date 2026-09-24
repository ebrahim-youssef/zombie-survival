import {test,expect} from "@playwright/test";

test("hardening: Kuda wall buy rejects, buys, then refills at half price",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));

  await page.evaluate(()=>window.__zombieSmoke.moveToInteraction("kuda"));
  await page.waitForTimeout(40);
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(40);
  let state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(state.points).toBe(500);
  expect(state.status).toBe("Not enough points.");
  expect(state.inventory.map(x=>x.weaponId)).toEqual(["mr6",null]);

  expect(await page.evaluate(()=>window.__zombieSmoke.addPoints(1000))).toBe(1500);
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(40);
  state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(state.points).toBe(250);
  expect(state.status).toBe("Bought Kuda.");
  expect(state.inventory.map(x=>x.weaponId)).toEqual(["mr6","kuda"]);
  expect(state.active.id).toBe("kuda");

  // One real shot makes the owned wall weapon refillable.
  await page.mouse.move(850,360);
  await page.mouse.down({button:"left"});
  await page.waitForTimeout(70);
  await page.mouse.up({button:"left"});
  await page.waitForFunction(
    ()=>window.__zombieSmoke?.interactionState()?.active.magazineAmmo<30,
  );
  const spentAmmo=(await page.evaluate(
    ()=>window.__zombieSmoke.interactionState(),
  )).active.magazineAmmo;

  expect(await page.evaluate(()=>window.__zombieSmoke.addPoints(1000))).toBe(1250);
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(40);
  state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(spentAmmo).toBeLessThan(state.active.magazineSize);
  expect(state.points).toBe(625);
  expect(state.status).toBe("Kuda ammo refilled.");
  expect(state.active.magazineAmmo).toBe(state.active.magazineSize);
  expect(state.active.reserveAmmo).toBe(state.active.maxReserveAmmo);
  expect(errors).toEqual([]);
  await context.close();
});

test("hardening: Mystery Box pays, cycles, reveals and fills/replaces inventory",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));

  await page.evaluate(()=>{
    window.__zombieSmoke.addPoints(2000);
    window.__zombieSmoke.moveToInteraction("box");
  });
  await page.waitForTimeout(40);
  const before=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  await page.keyboard.press("KeyE");
  await page.waitForTimeout(40);
  let state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(before.points-state.points).toBe(950);
  expect(state.status).toBe("Mystery Box rolling...");

  await page.evaluate(()=>window.__zombieSmoke.advanceInteraction(3600));
  state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(state.prompt).toMatch(/^\[E\] Take /);
  const revealed=state.prompt.replace("[E] Take ","");
  expect(revealed).not.toBe("MR6");

  await page.keyboard.press("KeyE");
  await page.waitForTimeout(40);
  state=await page.evaluate(()=>window.__zombieSmoke.interactionState());
  expect(state.status).toBe("Took "+revealed+".");
  expect(state.inventory.filter(x=>x.weaponId!==null)).toHaveLength(2);
  expect(state.inventory.some(x=>x.name===revealed)).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
});
