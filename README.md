# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 1 — arena + player movement/aim foundation**

Current scaffold includes:

- Vite 8.
- TypeScript 7 in strict mode.
- Phaser 3.90.
- Arcade Physics configuration.
- Responsive 1280×720 logical canvas.
- Pseudo-isometric arena with four centered zombie windows.
- Player entity with Arcade Physics body.
- WASD + arrow movement.
- Deliberate 1.25× diagonal movement magnitude.
- Independent mouse aiming.
- Eight snapped visual facing directions.
- Custom crosshair.
- Camera follow/bounds foundation.
- Player confinement across the room perimeter.
- BO3-inspired zombie health/count functions.
- Device-neutral input contract.
- Full MVP planning/specification pack.
- GitHub CI for strict TypeScript + production Vite builds.

## Runtime

Node is pinned with `.node-version` to a Vite-8-compatible Node 22 release.

## Run locally

```bash
npm install
npm run dev
```

Typecheck:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
```

The production output directory is `dist/`.

## Cloudflare

Use:

- Build command: `npm run build`
- Build output directory: `dist`

The Vite config intentionally contains an explicit `plugins: []` array because Cloudflare's Vite integration may inspect or augment that array during deployment.

## Next implementation slice

**Phase 2 — combat foundation:** MR6, semi-auto firing, hitscan collision, tracer, muzzle flash, ammo/reload and melee.

See `docs/08-implementation-plan.md`.
