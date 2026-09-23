# 08 — Implementation Plan

## Phase 0 — Scaffold

Status: **complete**

## Phase 1 — Arena + player

Status: **complete**

- pseudo-isometric arena;
- four windows;
- player movement;
- 1.25× diagonal magnitude;
- independent aim;
- 8-direction facing;
- crosshair;
- camera foundation.

## Phase 2 — Combat foundation

Status: **complete**

- MR6.
- semi-auto cadence.
- hitscan.
- wall/window ray geometry.
- muzzle flash/tracer.
- ammo/reload.
- melee cone foundation.

## Phase 3 — Zombie vertical slice

Status: **complete**

- standard zombie entity.
- one test zombie per window.
- window entry.
- direct pursuit.
- zombie separation.
- attack range/cooldown.
- player damage/regen.
- gun + melee zombie hit resolution.
- BO3-style scoring.
- zombie death/corpse fade.
- basic game over/restart.

## Phase 4 — Waves

Status: **next**

- BO3 health/count functions.
- spawn scheduler.
- randomized anti-streak window selection.
- active-zombie cap.
- round completion.
- ~5-second intermission.
- increasing spawn pressure.
- round HUD becomes live rather than fixed.

## Phase 5 — Weapons + inventory

- Kuda.
- KN-44.
- KRM-262.
- BRM.
- Drakon.
- two-slot inventory.
- switching.
- shotgun pellets.

## Phase 6 — Economy/interactions

- wall buys.
- ammo refills.
- Mystery Box.
- prompts.
- insufficient-points feedback.

## Phase 7 — UI/audio/persistence

- complete HUD.
- menus.
- SFX.
- local high score/highest round/settings.

## Phase 8 — Mobile input

- virtual movement.
- aim.
- fire/melee/reload/interact/swap.
- safe-area responsive UI.

## Phase 9 — Polish/hardening

- original pixel-art assets.
- animations.
- feedback.
- performance.
- full acceptance pass.

## Quality gate per phase

1. Typecheck.
2. Production build.
3. No new console errors.
4. Manual phase acceptance pass.
5. Keep debug tooling working once introduced.
