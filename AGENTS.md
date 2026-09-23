# AGENTS.md

## Project rules

- Treat `docs/00-mvp-scope.md` and `docs/07-acceptance-criteria.md` as the MVP contract.
- Use TypeScript strict mode.
- Phaser is pinned to 3.90.0 for the MVP.
- Use Arcade Physics.
- Keep gameplay values in typed config modules; avoid magic numbers in systems/entities.
- Do not introduce React, an ECS, a state-management library, backend code or pathfinding without an explicit requirement.
- Keep desktop and touch input behind the device-neutral `InputFrame` contract.
- Use Cartesian world/physics coordinates; pseudo-isometric appearance is a rendering/art concern.
- Preserve deliberate diagonal movement speed at 1.25× straight speed.
- Hitscan is the source of truth for gun collision; tracers are visual only.
- Do not implement post-MVP features early.

## Quality gate

Before considering a phase complete:

1. `npm run typecheck`
2. `npm run build`
3. no new browser console errors
4. phase-specific acceptance criteria manually verified
5. debug tooling remains usable once implemented
