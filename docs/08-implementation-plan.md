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

- BO3-style zombie health/count functions.
- real Round 1 count.
- timed spawn scheduler.
- randomized window selection.
- maximum two consecutive spawns from one window.
- per-round active-zombie cap up to 24.
- increasing spawn pressure.
- modest zombie-speed scaling.
- round-clear detection.
- ~5-second intermission.
- automatic next round.
- live round/spawn/alive HUD.
- game over reports actual round.

Spawn interval and movement-speed scaling are explicit 2D adaptations, not claimed as exact BO3 engine timings.

## Phase 5 — Weapons + inventory

Status: **next**

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
