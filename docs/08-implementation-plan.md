# 08 — Implementation Plan

## Phase 0 — Scaffold
Status: **complete**

## Phase 1 — Arena + player
Status: **complete**

## Phase 2 — Combat foundation
Status: **complete**

## Phase 3 — Zombie vertical slice
Status: **complete**

## Phase 4 — Waves
Status: **complete**

## Phase 5 — Weapons + inventory
Status: **complete**

## Phase 6 — Economy/interactions
Status: **complete**

## Phase 7 — UI/audio/persistence
Status: **complete**

## Phase 8 — Mobile input
Status: **implementation complete; physical-device acceptance pending**

## Phase 9 — Polish/hardening
Status: **in progress; initial hardening slice implemented**

Implemented in this slice:
- scene-local gameplay clock; pauses no longer advance survival/wave/reload timers;
- browser throttling delta capped to avoid huge time jumps;
- shared game audio context rather than duplicate per-combat context;
- shotgun hits aggregated per target per shot for correct scoring;
- weapon spread interpreted as full cone width;
- generated procedural player/zombie sprite details (placeholder improvement);
- clear HP bar and red damage flash;
- dev-only F3 diagnostic visualization: wall segments, spawn points,
  interaction/melee ranges, zombie hit/attack radii and recent hitscan rays;
- F6 +950 points, F7 refill, F8 kill all, F9 jump to next round and F10 god mode;
- automated tests for waves, inventory, firing/reload, economy, persistence,
  gameplay clock and multi-pellet scoring; GitHub CI gates on the test suite.

Still required for full Phase 9 acceptance:
- original production-quality sprite sheets and 8-way character animations;
- audio replacement/polish and performance profiling on modest devices;
- hands-on browser testing across desktop and physical mobile hardware;
- full MVP acceptance pass in docs/07 and bug fixes discovered from it.
The build/test pipeline is not a substitute for live gameplay acceptance.

## Quality gate
1. npm test.
2. npm run typecheck.
3. npm run build.
4. Manual desktop/mobile acceptance.
5. No recurring console errors or leaked effects.

## Phase 9B — device QA and character art

Status: **implementation in progress; physical-device acceptance pending**

- Game-over input moved into an independent overlay scene with buttons and Enter/Space.
- Full-viewport RESIZE removes 16:9 FIT letterboxing on mobile.
- Camera zoom and UI/action positions respond to landscape/portrait resize.
- Mobile right-stick firing and visible-target aim assist (default).
- Optional auto-aim + fire button and manual input modes, stored locally.
- Full-body angled character sprites and animation pass follows.
