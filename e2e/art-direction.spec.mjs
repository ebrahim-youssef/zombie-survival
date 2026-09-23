import {test,expect} from "@playwright/test";

test("Stage 3: expanded three-quarter room keeps floor material below every actor",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>
    window.__zombieSmoke?.isActive("game") &&
    window.__zombieSmoke.artLayerState()?.zombies.length>0,
  );
  const state=await page.evaluate(()=>window.__zombieSmoke.artLayerState());
  expect(state).not.toBeNull();
  expect(state.room.halfWidth).toBe(990);
  expect(state.room.halfHeight).toBe(470);
  expect(state.room.rearWidthRatio).toBe(.78);
  expect(state.room.windowOpeningWidth).toBe(116);
  expect(state.room.polygon).toHaveLength(4);
  expect(state.room.polygon[0].y).toBe(state.room.polygon[1].y);
  expect(state.room.polygon[2].y).toBe(state.room.polygon[3].y);

  const prop=(key)=>state.room.props.find(item=>item.texture===key);
  const rug=prop("cabin:rug");
  const paper=prop("cabin:paper");
  const shelf=prop("cabin:shelf");
  const barrel=prop("cabin:barrel");
  expect(rug).toBeDefined();
  expect(paper).toBeDefined();
  expect(shelf).toBeDefined();
  expect(barrel).toBeDefined();
  expect(rug.depth).toBe(-55);
  expect(paper.depth).toBe(-55);
  expect(rug.depth).toBeLessThan(state.playerDepth);
  expect(paper.depth).toBeLessThan(state.playerDepth);
  expect(shelf.depth).toBeGreaterThan(100);
  expect(barrel.depth).toBeGreaterThan(100);
  expect(state.playerDepth).toBeCloseTo(100+state.playerFootY/1000,4);

  for(const zombie of state.zombies){
    expect(rug.depth).toBeLessThan(zombie.depth);
    expect(paper.depth).toBeLessThan(zombie.depth);
    if(zombie.enteredArena){
      expect(zombie.depth).toBeCloseTo(100+zombie.footY/1000,4);
    }else{
      expect(zombie.depth).toBe(-45);
    }
  }

  await page.screenshot({
    path:"test-results/stage3-adventure-cabin.png",animations:"disabled",
  });
  expect(errors).toEqual([]);
  await context.close();
});
