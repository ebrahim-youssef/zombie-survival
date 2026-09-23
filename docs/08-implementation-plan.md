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

- main-menu best score/highest-round display.
- real pause overlay; Esc no longer abandons the run.
- pause resume/settings/restart/main-menu actions.
- shared settings panel.
- persisted master-volume setting.
- persisted damage-numbers toggle.
- mouse-sensitivity value retained in the persisted schema for future use.
- localStorage schema version 1.
- high score persisted at game over.
- highest round persisted at game over.
- game-over panel displays run and persisted records.
- lightweight generated Web Audio SFX hooks.
- shot/melee/hit/kill/hurt/weapon-switch cues.
- optional floating damage numbers controlled by settings.
- storage failure safely falls back to defaults.

No proprietary BO3 audio is included.

## Phase 8 — Mobile input

Status: **next**

- virtual movement.
- right-side aim.
- fire.
- melee.
- reload.
- interact.
- weapon swap.
- pause.
- safe-area responsive UI.

## Phase 9 — Polish/hardening

- original pixel-art assets.
- animations.
- expanded SFX.
- debug tooling.
- performance.
- full acceptance pass.

## Quality gate per phase

1. Typecheck.
2. Production build.
3. No new console errors.
4. Manual phase acceptance pass.
5. Keep debug tooling working once introduced.
