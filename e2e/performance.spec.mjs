import {test,expect} from "@playwright/test";
import fs from "node:fs";

test("performance soak: repeated restart does not accumulate scene objects/timers",async({browser})=>{
  test.setTimeout(45_000);
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  await page.waitForTimeout(450);

  const samples=[];
  samples.push(await page.evaluate(()=>window.__zombieSmoke.performanceState()));

  for(let cycle=1;cycle<=6;cycle++){
    // Exercise transient shot graphics/audio scheduling before teardown.
    await page.mouse.move(880,360);
    await page.mouse.down({button:"left"});
    await page.mouse.up({button:"left"});
    await page.waitForTimeout(70);

    await page.evaluate(()=>window.__zombieSmoke.forceGameOver());
    await page.waitForFunction(()=>window.__zombieSmoke?.isActive("gameOver"));
    await page.getByRole("button",{name:"RESTART"}).click();
    await page.waitForFunction(()=>
      window.__zombieSmoke?.isActive("game") &&
      !window.__zombieSmoke?.isActive("gameOver"),
    );
    await page.waitForTimeout(450);
    samples.push(await page.evaluate(()=>window.__zombieSmoke.performanceState()));
  }

  const baseline=samples[0];
  const final=samples.at(-1);
  for(const sample of samples){
    expect(sample).not.toBeNull();
    // One fresh zombie may spawn at different moments; allow a small fixed
    // envelope while rejecting monotonic scene/timer accumulation.
    expect(sample.gameObjects).toBeLessThanOrEqual(baseline.gameObjects+8);
    expect(sample.tweens).toBeLessThanOrEqual(8);
    expect(sample.aliveZombies).toBeLessThanOrEqual(6);
    expect(Number.isFinite(sample.actualFps)).toBe(true);
  }
  expect(final.gameObjects).toBeLessThanOrEqual(baseline.gameObjects+5);
  expect(final.tweens).toBeLessThanOrEqual(baseline.tweens+2);
  expect(errors).toEqual([]);

  fs.mkdirSync("test-results",{recursive:true});
  fs.writeFileSync(
    "test-results/performance-soak.json",
    JSON.stringify({
      note:"Headless FPS is diagnostic only; leak/boundedness assertions are the CI gate.",
      samples,
    },null,2),
  );
  await context.close();
});
