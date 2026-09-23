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
Status: **implementation complete; device acceptance pending**

- Mobile touch detection chooses a single device-neutral input source.
- Left virtual movement stick with eight snapped directions.
- Right aim stick with persistent aim direction.
- Dedicated fire (held), melee, reload, interact, weapon swap and pause buttons.
- Multiple independent touch pointers tracked by pointer ID.
- Mobile controls are screen-space game objects; the world camera can move independently.
- Clear held inputs on pause, shutdown and touch release.
- Safe-area padding, 100dvh layout and a landscape-orientation hint.
- Desktop keyboard and mouse controls remain unchanged.

Device acceptance still required on a physical iPhone/Android device:
multitouch, screen orientation, safe areas, pause/resume and button hit targets.

## Phase 9 — Polish/hardening
Status: **next**

- original pixel-art assets and animations;
- expanded SFX;
- gameplay debug tooling;
- performance and full acceptance pass.

## Quality gate per phase
1. Typecheck.
2. Production build.
3. No browser console errors.
4. Manual phase acceptance pass.
5. Debug tooling remains usable once introduced.
