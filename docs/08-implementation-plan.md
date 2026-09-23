# 08 — Implementation Plan

## Phase 0 — Scaffold

Status: **complete**

- Vite + TypeScript.
- Phaser boot.
- 1280×720 logical size.
- responsive scaling.
- Boot/Menu/Game/UI scenes.
- config foundation.

## Phase 1 — Arena + player

Status: **complete**

- pseudo-isometric arena;
- four windows;
- player;
- Arcade body;
- desktop movement;
- deliberate 1.25× diagonal speed;
- 8-direction aim facing;
- custom crosshair;
- camera controller.

## Phase 2 — Combat foundation

Status: **complete**

- MR6 weapon definition/state.
- semi-auto cadence.
- hitscan math.
- wall blocking with window gaps.
- muzzle flash.
- tracer.
- magazine/reserve ammo.
- manual reload.
- empty-mag auto reload.
- melee cooldown/cone visual foundation.
- HUD ammo/reload state.

Zombie hit resolution enters Phase 3 when zombie entities exist.

## Phase 3 — Zombie vertical slice

Status: **next**

- zombie entity;
- window entry;
- direct pursuit;
- collision/separation;
- attack;
- player damage/regen;
- death/corpse;
- points.

## Phase 4 — Waves

- BO3 health/count functions;
- spawn scheduler;
- anti-streak window selection;
- active cap;
- round completion/intermission;
- speed/spawn tuning.

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

- original pixel-art assets;
- animations;
- feedback;
- performance;
- full acceptance pass.

## Quality gate per phase

1. Typecheck.
2. Production build.
3. No new console errors.
4. Manual phase acceptance pass.
5. Keep debug tooling working once introduced.
