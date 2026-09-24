import {describe,expect,it} from "vitest";
import {GameplayClock} from "../src/game/GameplayClock";
import {WeaponController} from "../src/weapons/WeaponController";
import {WEAPON_DEFINITIONS} from "../src/weapons/weaponDefinitions";

describe("pause-time composite regression",()=>{
  it("reload deadlines only progress when the scene clock advances",()=>{
    const clock=new GameplayClock();
    const weapon=new WeaponController(WEAPON_DEFINITIONS.mr6);
    expect(weapon.tryFire(clock.now,true,true)).toBe(true);
    clock.advance(150);
    expect(weapon.startReload(clock.now)).toBe(true);
    const frozenAt=clock.now;

    // Simulated real-world pause: neither clock nor weapon receives active time.
    weapon.update(clock.now);
    weapon.update(clock.now);
    expect(clock.now).toBe(frozenAt);
    expect(weapon.snapshot()).toMatchObject({
      magazineAmmo:7,reserveAmmo:32,isReloading:true,
    });

    let guard=0;
    while(weapon.isReloading&&guard++<100){
      clock.advance(100);
      weapon.update(clock.now);
    }
    expect(weapon.snapshot()).toMatchObject({
      magazineAmmo:8,reserveAmmo:31,isReloading:false,
    });
  });
});
