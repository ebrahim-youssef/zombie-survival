import {test,expect} from "@playwright/test";

test("restored first isometric view uses original 32x32 placeholders",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>
    window.__zombieSmoke?.isActive("game") &&
    window.__zombieSmoke.placeholderState()?.zombie!==null,
  );
  expect(await page.evaluate(()=>window.__zombieSmoke.placeholderState()))
    .toEqual({
      player:{width:32,height:32},
      zombie:{width:32,height:32},
    });
  await page.screenshot({
    path:"test-results/placeholder-isometric.png",
    animations:"disabled",
  });
  expect(errors).toEqual([]);
  await context.close();
});
