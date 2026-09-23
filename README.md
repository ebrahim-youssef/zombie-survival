# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 2 — combat foundation**

Implemented so far:

- Vite 8 + TypeScript 7 strict mode.
- Phaser 3.90 + Arcade Physics.
- Responsive 1280×720 logical canvas.
- Pseudo-isometric arena with four zombie windows.
- WASD/arrow movement.
- Deliberate 1.25× diagonal movement magnitude.
- Independent mouse aiming and 8-direction visual facing.
- Custom crosshair.
- Camera follow/bounds foundation.
- MR6 starting weapon.
- Semi-auto fire cadence.
- Hitscan ray math.
- Wall-segment ray blocking with open window gaps.
- Weapon spread.
- Muzzle flash + short-lived tracer.
- Magazine/reserve ammo.
- Manual reload and empty-mag auto reload.
- Reload HUD state.
- Melee cooldown + forward-cone debug/visual foundation.
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

`vite.config.ts` intentionally contains an explicit `plugins: []` array for Cloudflare's Vite integration.

## Next implementation slice

**Phase 3 — zombie vertical slice:** zombie entity, one-window-to-four-window spawn entry, direct pursuit, collision/separation, attacks, player damage/regen, zombie death/corpse and score events.

See `docs/08-implementation-plan.md`.
