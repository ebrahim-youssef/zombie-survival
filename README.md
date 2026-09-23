# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 4 — waves**

Implemented:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- Responsive 1280×720 logical canvas.
- Pseudo-isometric arena with four zombie windows.
- Player movement/aiming/crosshair/camera foundation.
- MR6 semi-auto hitscan combat, ammo and reload.
- Zombie window entry, pursuit, attack, death and corpse fade.
- Player HP, damage feedback and regeneration.
- Gun/melee zombie damage and BO3-style point awards.
- Real Round 1 with 6 zombies.
- BO3-style zombie count and health scaling.
- Spawn scheduler with increasing round pressure.
- Randomized window selection.
- No more than two consecutive spawns from the same window.
- Per-round concurrent-alive cap up to 24.
- Round clear detection.
- ~5-second intermission.
- Automatic next-round start.
- Modest round-based zombie speed scaling.
- Live round/spawn/alive HUD.
- Game-over screen reports the actual current round.
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

**Phase 5 — weapons + inventory:** Kuda, KN-44, KRM-262, BRM, Drakon, two weapon slots, switching and shotgun pellet behavior.

See `docs/08-implementation-plan.md`.
