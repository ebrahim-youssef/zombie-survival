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
- Boot, Menu, Game and UI scenes.
- Pseudo-isometric arena with four centered zombie windows.
- Player entity with Arcade Physics body.
- WASD + arrow movement.
- Deliberate 1.25× diagonal movement magnitude.
- Independent mouse aiming.
- Eight snapped visual facing directions.
- Custom crosshair.
- Camera follow/bounds foundation.
- Player confinement across the room perimeter.
- Core player/economy/wave configuration.
- BO3-inspired zombie health/count functions.
- Device-neutral input contract.
- Full MVP planning/specification pack.

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

## Current Phase 1 slice

Implemented:

1. Pseudo-isometric diamond arena geometry.
2. Four centered window entrances and outside spawn markers.
3. Player entity with Arcade Physics body.
4. WASD/arrow movement.
5. Deliberate 1.25× diagonal movement magnitude.
6. Independent mouse aiming.
7. Eight snapped visual facing directions.
8. Custom world-space crosshair.
9. Camera follow/bounds foundation.
10. Player confinement across the full arena perimeter, including zombie-only window gaps.

Next: **Phase 2 — combat foundation (MR6, hitscan, tracer, ammo/reload and melee).**

See `docs/08-implementation-plan.md`.
