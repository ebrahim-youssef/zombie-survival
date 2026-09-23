# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 6 — economy + interactions**

Implemented:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- pseudo-isometric arena and four zombie windows.
- player movement, independent aim and camera foundation.
- full wave progression and BO3-inspired round scaling.
- six weapon definitions and two-slot inventory.
- weapon switching and shotgun pellet behavior.
- MR6 wall buy: 500 / refill 250.
- Kuda wall buy: 1250 / refill 625.
- Mystery Box: 950.
- Mystery pool excludes currently owned weapons.
- Mystery cycling/reveal and 10-second pickup timeout.
- contextual E prompts.
- insufficient-points feedback.
- wall buys and Mystery Box share the same inventory acquisition rules.
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

**Phase 7 — UI/audio/persistence:** proper pause/settings flow, HUD pass, SFX hooks, local high score/highest round and settings persistence.

See `docs/08-implementation-plan.md`.
