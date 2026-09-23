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
    player:{width:64,height:64},
    zombie:{width:64,height:64},
    chest:{width:80,height:60},
    lantern:{width:24,height:40},
    heart:{width:18,height:16},
    shelf:{width:68,height:94},
    paper:{width:32,height:28},
  });
  const quality=await page.evaluate(()=>window.__zombieSmoke.artComplexity());
  expect(quality.opaque).toBeGreaterThan(500);
  expect(quality.zombieOpaque).toBeGreaterThan(500);
  expect(quality.translucent).toBeGreaterThan(20);
  expect(quality.colors).toBeGreaterThan(12);
  expect(quality.diff).toBeGreaterThan(100);
  await page.waitForTimeout(1600);
  // Publish the actual browser-rendered scene for review in the Actions run.
  await page.screenshot({
    path:"test-results/cabin-art-preview.png",
    animations:"disabled",
  });
  // A reproducible close-up sheet tests visual direction independently
  // from gameplay zoom, HUD and window occlusion.
  await page.evaluate(()=>{
    const keys=[
      "character-player-s-idle-0","character-player-se-walk-1",
      "character-player-e-shoot-0","character-player-n-reload-1",
      "character-zombie-s-walk-0","character-zombie-se-attack-1",
      "character-zombie-w-hurt-0","character-zombie-n-death-2",
    ];
    const atlas=document.createElement("canvas");
    atlas.width=800;atlas.height=410;
    const c=atlas.getContext("2d");
    if(!c)throw Error("Missing art QA canvas");
    c.fillStyle="#26313a";c.fillRect(0,0,800,410);
    c.imageSmoothingEnabled=false;
    keys.forEach((key,i)=>{
      const gameCanvas=window.__zombieSmoke;
      // getSourceImage is exposed only through this opt-in smoke hook.
      const src=gameCanvas.getTextureCanvas(key);
      const x=18+(i%4)*196, y=28+Math.floor(i/4)*194;
      c.fillStyle="#9b613e";c.fillRect(x,y,166,162);
      c.drawImage(src,x+19,y+6,128,128);
      c.fillStyle="#f4ddbb";c.font="10px monospace";
      c.fillText(key.replace("character-",""),x+2,y+151);
    });
    const img=document.createElement("img");
    img.id="character-art-review";
    img.src=atlas.toDataURL("image/png");
    img.style.cssText="position:fixed;z-index:99999;left:0;top:0;width:800px;height:410px;pointer-events:none";
    document.body.append(img);
  });
  await page.locator("#character-art-review").screenshot({
    path:"test-results/character-closeups.png",
  });
  expect(errors).toEqual([]);
  await context.close();
});
