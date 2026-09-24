import {test,expect} from "@playwright/test";

test("desktop: gameplay starts and Enter reliably restarts from game over",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",(error)=>{errors.push(error.message);console.log("PAGE ERROR STACK:",error.stack);});
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
  page.on("pageerror",(error)=>{errors.push(error.message);console.log("PAGE ERROR STACK:",error.stack);});
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
  expect(await page.evaluate(()=>window.__zombieSmoke.zoom())).toBe(1);

  // The right stick should aim AND repeatedly fire the MR6 in default mode.
  const firstAmmo=await page.evaluate(()=>window.__zombieSmoke.ammo());
  // Simulate actual touchscreen interaction, not a desktop mouse in a
  // hasTouch context. The mouse uses a different Phaser pointer route.
  const client=await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent",{
    type:"touchStart",touchPoints:[{x:767,y:312,id:9}],
  });
  await client.send("Input.dispatchTouchEvent",{
    type:"touchMove",touchPoints:[{x:808,y:312,id:9}],
  });
  await page.waitForTimeout(460);
  const firedAmmo=await page.evaluate(()=>window.__zombieSmoke.ammo());
  const touchStatus=await page.evaluate(()=>window.__zombieSmoke.mobileState());
  console.log("MOBILE STICK STATUS:",touchStatus, "AMMO:",firstAmmo,firedAmmo);
  expect(touchStatus.engaged).toBe(true);
  expect(firedAmmo).toBeLessThan(firstAmmo);

  // True simultaneous touches: continue aiming/fire with finger 1, then
  // deflect the movement stick with finger 2. Both must remain responsive.
  const beforeMove=await page.evaluate(()=>window.__zombieSmoke.playerPosition());
  await client.send("Input.dispatchTouchEvent",{
    type:"touchStart",touchPoints:[
      {x:808,y:312,id:9},{x:77,y:313,id:10},
    ],
  });
  await client.send("Input.dispatchTouchEvent",{
    type:"touchMove",touchPoints:[
      {x:808,y:312,id:9},{x:113,y:313,id:10},
    ],
  });
  await page.waitForTimeout(300);
  const afterMove=await page.evaluate(()=>window.__zombieSmoke.playerPosition());
  expect(afterMove.x).toBeGreaterThan(beforeMove.x+10);
  expect((await page.evaluate(()=>window.__zombieSmoke.mobileState())).engaged).toBe(true);
  await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  // Release must not continue firing, even when the aim direction persists.
  await page.waitForTimeout(60);
  const releasedAmmo=await page.evaluate(()=>window.__zombieSmoke.ammo());
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>window.__zombieSmoke.ammo())).toBe(releasedAmmo);

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

test("portrait mobile: game uses available viewport rather than a tiny FIT canvas",async({browser})=>{
  const width=390,height=844;
  const context=await browser.newContext({
    viewport:{width,height},deviceScaleFactor:2,
    isMobile:true,hasTouch:true,
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",(error)=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  const dimensions=await page.evaluate(()=>window.__zombieSmoke.viewport());
  expect(dimensions.width).toBeGreaterThanOrEqual(width-3);
  expect(dimensions.height).toBeGreaterThanOrEqual(height-3);
  const canvas=await page.locator("#game-root canvas").boundingBox();
  expect(canvas.width).toBeGreaterThanOrEqual(width-3);
  expect(canvas.height).toBeGreaterThanOrEqual(height-3);
  await page.mouse.click(width/2,height/2-4);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  expect(await page.evaluate(()=>window.__zombieSmoke.touchMode())).toBe(true);
  expect(await page.evaluate(()=>window.__zombieSmoke.zoom())).toBe(1);
  expect(errors).toEqual([]);
  await context.close();
});


test("desktop: pause menu exposes a working Controls panel",async({browser})=>{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/?smoke=1");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("menu"));
  await page.mouse.click(640,360);
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("game"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(()=>window.__zombieSmoke?.isActive("pause"));

  // Five pause items; Controls is the second, centered at the tested desktop layout.
  await page.mouse.click(640,360-108+58);
  await page.waitForFunction(()=>window.__zombieSmoke?.pauseControlsVisible());
  expect(await page.evaluate(()=>window.__zombieSmoke.pauseControlsVisible())).toBe(true);

  // Escape closes the panel first without resuming gameplay.
  await page.keyboard.press("Escape");
  expect(await page.evaluate(()=>window.__zombieSmoke.pauseControlsVisible())).toBe(false);
  expect(await page.evaluate(()=>window.__zombieSmoke.isActive("pause"))).toBe(true);

  // Second Escape resumes.
  await page.keyboard.press("Escape");
  await page.waitForFunction(()=>!window.__zombieSmoke?.isActive("pause"));
  expect(errors).toEqual([]);
  await context.close();
});
