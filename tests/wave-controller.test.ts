import {describe,expect,it,vi} from "vitest";
import {WaveController} from "../src/zombies/WaveController";
import type {Arena,ArenaWindow} from "../src/world/Arena";
import type {ZombieController} from "../src/zombies/ZombieController";
import {WAVE_CONFIG} from "../src/config/waves";

function fixture(){
  const windows=[
    {id:"north-east"},{id:"south-east"},
    {id:"south-west"},{id:"north-west"},
  ].map((window,index)=>({
    ...window,
    center:{x:index,y:0},
    insideEntry:{x:index,y:1},
    outsideSpawn:{x:index,y:-1},
  })) as unknown as readonly ArenaWindow[];
  let alive=0;
  const spawn=vi.fn(()=>{alive+=1;});
  const zombies={
    spawn,
    getAliveCount:()=>alive,
    clearAll:()=>{alive=0;},
  } as unknown as ZombieController;
  const arena={windows} as Arena;
  const controller=new WaveController(arena,zombies);
  return {
    controller,spawn,
    killAll:()=>{alive=0;},
    alive:()=>alive,
  };
}

describe("WaveController integration",()=>{
  it("spawns to the active cap, enters intermission, then starts the next round",()=>{
    const f=fixture();
    let now=0;
    for(let i=0;i<20;i++){
      f.controller.update(now);
      now+=1500;
      if(f.controller.snapshot(now).spawnedZombies>=6)break;
    }
    let snap=f.controller.snapshot(now);
    expect(snap.round).toBe(1);
    expect(snap.spawnedZombies).toBe(6);
    expect(snap.aliveZombies).toBeLessThanOrEqual(snap.maxAliveZombies);

    f.killAll();
    f.controller.update(now);
    snap=f.controller.snapshot(now);
    expect(snap.phase).toBe("intermission");
    expect(snap.nextRoundInMs).toBe(WAVE_CONFIG.intermissionMs);

    f.controller.update(now+WAVE_CONFIG.intermissionMs-1);
    expect(f.controller.snapshot(now+WAVE_CONFIG.intermissionMs-1).round).toBe(1);
    f.controller.update(now+WAVE_CONFIG.intermissionMs);
    snap=f.controller.snapshot(now+WAVE_CONFIG.intermissionMs);
    expect(snap).toMatchObject({round:2,phase:"active",spawnedZombies:0});
  });

  it("never exceeds round active cap while repeated spawn ticks run",()=>{
    const f=fixture();
    for(let now=0;now<120_000;now+=500){
      f.controller.update(now);
      const snap=f.controller.snapshot(now);
      expect(snap.aliveZombies).toBeLessThanOrEqual(snap.maxAliveZombies);
    }
  });

  it("debug round advance clears old actors and resets round counters",()=>{
    const f=fixture();
    f.controller.update(0);
    expect(f.alive()).toBe(1);
    f.controller.debugNextRound(1000);
    const snap=f.controller.snapshot(1000);
    expect(f.alive()).toBe(0);
    expect(snap).toMatchObject({
      round:2,phase:"active",spawnedZombies:0,aliveZombies:0,
    });
  });
});
