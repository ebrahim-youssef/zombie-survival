import { test, expect } from "@playwright/test";

test("art assets are initialized at native pixel resolution in a live scene",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  const assets=await page.evaluate(()=>window.__zombieSmoke.artState());
  expect(assets).toEqual({
    player:{width:32,height:32},
    zombie:{width:32,height:32},
    chest:{width:80,height:60},
    lantern:{width:24,height:40},
    heart:{width:18,height:16},
    shelf:{width:68,height:94},
  });
  await page.waitForTimeout(450);
  expect(errors).toEqual([]);
  await context.close();
});
