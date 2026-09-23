# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 0 — scaffold**

Current scaffold includes:

- Vite 8.
- TypeScript 7 in strict mode.
- Phaser 3.90.
- Arcade Physics configuration.
- Responsive 1280×720 logical canvas.
- Boot, Menu, Game and UI scenes.
- Initial pseudo-isometric arena placeholder.
- Core player/economy/wave configuration.
- BO3-inspired zombie health/count functions.
- Device-neutral input contract.
- Asset directory structure.
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

## Next implementation slice

Phase 1:

1. Arena geometry.
2. Four windows and player-blocking boundaries.
3. Player entity.
4. WASD/arrow movement.
5. Deliberate 1.25× diagonal movement.
6. Independent mouse aiming.
7. Eight visual facing directions.
8. Custom crosshair.
9. Camera controller.

See `docs/08-implementation-plan.md`.
