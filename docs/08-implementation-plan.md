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

## Phase 9B — device QA and character presentation

Status: **browser-verified implementation complete; physical-device acceptance pending**

Implemented:
- game-over controls moved to a dedicated DOM overlay, isolated from the
  paused gameplay/touch layer;
- Restart / Main Menu buttons plus Enter/Space/Esc keyboard handling;
- full-viewport `Scale.RESIZE` replaces 1280×720 FIT letterboxing;
- responsive HUD, menus and virtual controls for landscape/portrait;
- mobile right-stick auto-fire with wall-aware forward-cone aim assist;
- optional auto-aim + FIRE and fully manual mobile modes persisted in settings;
- reliable DOM Pointer Events + pointer capture for simultaneous touch controls;
- right-stick release clears firing state;
- 48×64 original full-body angled player/zombie character frames;
- eight directional visual facings without rotating a top-down block;
- player idle/walk/shoot/melee/reload/hurt presentation states;
- zombie walk/attack/hurt/death presentation states;
- feet-centered physics bodies independent of the taller visual sprite.

Automated browser verification now covers:
- desktop game-over restart;
- mobile landscape canvas filling the viewport;
- portrait canvas filling the viewport;
- mobile touch mode activation;
- right-stick firing ammunition consumption;
- simultaneous movement + aim/fire;
- fire stopping after touch release;
- mobile Restart and Main Menu game-over interactions.

Still pending:
- physical Android Chrome acceptance;
- physical iPhone Safari acceptance including address-bar/safe-area behavior;
- visual review/tuning of the generated character frames on real devices;
- artist-authored final sprite sheets if the procedural preview is not accepted;
- final performance profiling and complete MVP acceptance checklist.
