import {test,expect} from "@playwright/test";

test("hardening: repeated round transitions stay bounded and error-free",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));

  let previous=1;
  for(let i=0;i<8;i++){
    await page.keyboard.press("Digit8");
    await page.waitForFunction(
      round=>window.__zombieSmoke?.timingState()?.wave.round===round,
      previous+1,
    );
    const state=await page.evaluate(()=>window.__zombieSmoke.timingState());
    expect(state.wave.round).toBe(previous+1);
    expect(state.wave.phase).toBe("active");
    expect(state.wave.aliveZombies).toBeLessThanOrEqual(state.wave.maxAliveZombies);
    expect(state.wave.spawnedZombies).toBeLessThanOrEqual(state.wave.totalZombies);
    previous=state.wave.round;
  }

  // Let the last round run briefly to exercise fresh spawns after transitions.
  await page.waitForTimeout(850);
  const final=await page.evaluate(()=>window.__zombieSmoke.timingState());
  expect(final.wave.round).toBe(9);
  expect(final.wave.aliveZombies).toBeLessThanOrEqual(final.wave.maxAliveZombies);
  expect(errors).toEqual([]);
  await context.close();
});
