# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 5 — weapons + inventory**

Implemented:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- Pseudo-isometric arena and four zombie windows.
- player movement, independent aim and camera foundation.
- full wave progression and BO3-inspired round scaling.
- MR6, Kuda, KN-44, KRM-262, BRM and Drakon definitions.
- weapon-specific fire cadence, ammo, reload, damage falloff and spread.
- KRM 4-pellet hitscan.
- two weapon slots.
- MR6 starts in slot 1 and slot 2 starts empty.
- acquisition fills empty slot before replacing equipped slot.
- 1/2 and mouse-wheel switching.
- switching cancels reload without refilling.
- inventory HUD.
- gun/melee zombie damage, scoring, health/regen and game over.
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

**Phase 6 — economy + interactions:** MR6/Kuda wall buys, half-price owned-weapon ammo refills, Mystery Box, interaction prompts and insufficient-points feedback.

See `docs/08-implementation-plan.md`.
