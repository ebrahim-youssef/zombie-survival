import {test,expect} from "@playwright/test";

test("desktop: gameplay starts and Enter reliably restarts from game over",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",(error)=>{errors.push(error.message);console.log("PAGE ERROR:",error.message);});
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  await page.evaluate(()=>window.__zombieSmoke.forceGameOver());
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("gameOver"));
  await expect(page.getByRole("button",{name:"RESTART"})).toBeVisible();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(650);
  const state=await page.evaluate(()=>({
    game:window.__zombieSmoke.isActive("game"),
    over:window.__zombieSmoke.isActive("gameOver"),
    menu:window.__zombieSmoke.isActive("menu"),
    dialog:!!document.querySelector(".gameover-overlay"),
  }));
  console.log("RESTART DIAGNOSTIC:",JSON.stringify(state),"PAGE ERRORS:",JSON.stringify(errors));
  if(!state.game||state.over){
    throw new Error("Restart transition: "+JSON.stringify(state)+" errors="+JSON.stringify(errors));
  }

  await page.waitForFunction(()=>
    window.__zombieSmoke?.isActive("game")&&
    !window.__zombieSmoke?.isActive("gameOver"),
  {timeout:3000});
  expect(errors).toEqual([]);
  await context.close();
});

test("mobile landscape: canvas fills viewport and touch restart/main menu work",async({browser})=>{
  const width=844,height=390;
  const context=await browser.newContext({
    viewport:{width,height},deviceScaleFactor:2,
    isMobile:true,hasTouch:true,
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",(error)=>{errors.push(error.message);console.log("PAGE ERROR:",error.message);});
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  const actual=await page.evaluate(()=>window.__zombieSmoke.viewport());
  expect(actual.width).toBeGreaterThanOrEqual(width-3);
  expect(actual.height).toBeGreaterThanOrEqual(height-3);
  const canvas=await page.locator("#game-root canvas").boundingBox();
  expect(canvas).not.toBeNull();
  expect(canvas.width).toBeGreaterThanOrEqual(width-3);
  expect(canvas.height).toBeGreaterThanOrEqual(height-3);

  await page.mouse.click(width/2,height/2-4);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  expect(await page.evaluate(()=>window.__zombieSmoke.touchMode())).toBe(true);
  await page.evaluate(()=>window.__zombieSmoke.forceGameOver());
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("gameOver"));
  await expect(page.getByRole("button",{name:"RESTART"})).toBeVisible();
  await page.getByRole("button",{name:"RESTART"}).tap();
  await page.waitForTimeout(650);
  const state=await page.evaluate(()=>({
    game:window.__zombieSmoke.isActive("game"),
    over:window.__zombieSmoke.isActive("gameOver"),
    menu:window.__zombieSmoke.isActive("menu"),
    dialog:!!document.querySelector(".gameover-overlay"),
  }));
  console.log("RESTART DIAGNOSTIC:",JSON.stringify(state),"PAGE ERRORS:",JSON.stringify(errors));
  if(!state.game||state.over){
    throw new Error("Restart transition: "+JSON.stringify(state)+" errors="+JSON.stringify(errors));
  }

  await page.waitForFunction(()=>
    window.__zombieSmoke?.isActive("game")&&
    !window.__zombieSmoke?.isActive("gameOver"),
  {timeout:3000});
  await page.evaluate(()=>window.__zombieSmoke.forceGameOver());
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("gameOver"));
  await page.getByRole("button",{name:"MAIN MENU"}).tap();
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  expect(errors).toEqual([]);
  await context.close();
});
