# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 7 — UI, audio and persistence**

Implemented:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- pseudo-isometric arena and zombie-window loop.
- player movement, aim, combat and regeneration.
- BO3-inspired wave progression.
- six weapons and two-slot inventory.
- wall buys and Mystery Box economy.
- contextual interaction prompts.
- real pause/resume overlay.
- pause settings/restart/main-menu actions.
- settings panel with master volume and damage-number toggle.
- localStorage versioned persistence.
- persisted high score and highest round.
- menu and game-over record display.
- generated Web Audio SFX hooks; no proprietary audio assets.
- optional floating damage numbers.
- GitHub CI running strict TypeScript + production Vite build.

## Runtime

Node is pinned with `.node-version` to Node 22.16.0.

## Run locally

```bash
npm install
npm run dev
```

Verification:

```bash
npm run typecheck
npm run build
```

Production output: `dist/`.

## Cloudflare

- Build command: `npm run build`
- Build output directory: `dist`

## Next implementation slice

**Phase 8 — mobile input:** virtual movement, touch aiming, fire/melee/reload/interact/swap/pause controls and safe-area-aware responsive positioning.

See `docs/08-implementation-plan.md`.
