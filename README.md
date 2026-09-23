# Zombie Survival

Client-only pseudo-isometric zombie survival game prototype.

## Current status

**Phase 8 — mobile input implementation**

- Vite 8 + TypeScript 7 strict mode, Phaser 3.90 + Arcade Physics.
- Single-room zombie survival, wave progression, health and combat.
- Six weapon definitions, two-slot inventory, wall buys and Mystery Box.
- Pause/settings UI and browser-local score/settings persistence.
- Generated Web Audio SFX; no proprietary audio.
- Unified `InputFrame` adapter for desktop and touch gameplay.
- Touch: left movement stick, right aim stick, fire, melee, reload, interact, swap, pause.
- Multi-pointer controls and reset on pause/shutdown.
- Safe-area-aware canvas container and portrait rotation hint.
- Strict TypeScript and production Vite build in GitHub Actions.

## Run locally

Use Node 22.16.0 (see `.node-version`).

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

## Cloudflare

- Build command: `npm run build`
- Output directory: `dist`

## Validation status

CI verifies types and bundle. Mobile device ergonomics and real-browser gameplay still require manual testing; a successful build alone does not establish full gameplay acceptance.

## Next

**Phase 9 — polish and hardening**: art, animations, debug tools, gameplay acceptance and performance. See `docs/08-implementation-plan.md`.
