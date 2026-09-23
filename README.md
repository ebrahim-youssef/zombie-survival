# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 3 — zombie vertical slice**

Implemented so far:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- Responsive 1280×720 logical canvas.
- Pseudo-isometric arena with four zombie windows.
- WASD/arrow movement with deliberate 1.25× diagonal magnitude.
- Independent mouse aiming and 8-direction visual facing.
- Custom crosshair and camera follow foundation.
- MR6 semi-auto weapon with hitscan, spread, tracer and reload.
- Wall-segment ray blocking with open window gaps.
- Four-zombie vertical-slice spawn: one zombie enters through each window.
- Zombie direct chase after entry.
- Zombie-to-zombie Arcade separation.
- Zombie attack range/cooldown.
- Player HP, damage feedback and regeneration.
- Gun and melee damage against zombies.
- Corpse hold + fade.
- BO3-style +10 / +60 / +130 point awards.
- Kill count and point-gain popup.
- Basic game-over/restart flow.
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

**Phase 4 — waves:** BO3 round counts, spawn scheduler, randomized anti-streak windows, concurrent-alive cap, round completion/intermission, and increasing spawn pressure.

See `docs/08-implementation-plan.md`.
