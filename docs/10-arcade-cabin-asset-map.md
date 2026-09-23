# 10 — Original arcade-cabin asset map

This repository includes a fully original, runtime-generated low-resolution
art pass modeled on the approved warm-cabin arcade-zombie concept.
**No commercial or generated-reference art was copied into the game.**

## Sources and integration

| Source | Original asset group | Consumer |
| --- | --- | --- |
| `src/art/ArtManifest.ts` | Stable texture IDs and shared warm/night palette | All art |
| `src/art/CharacterArt.ts` | 32×32 original player/zombie frames, 8 facings, idle/walk/action/death | Player, Zombie |
| `src/art/EnvironmentArt.ts` | Wooden props, paper debris, shelf, rug, chest, lantern, wall-buy signs | Arena, MysteryBox, WallBuy |
| `src/art/HudArt.ts` | Pixel hearts, portrait border and illustrated weapon silhouette | HUD |
| `src/world/Arena.ts` | Dynamic floor planks, timbers, windows, cold night exterior, warm lighting | GameScene |
| `src/combat/CombatEffects.ts` | Muzzle bursts, blood-pixel hit flashes and melee arcs | CombatController |

Textures are generated **once per Phaser game** (guarded with
`scene.textures.exists`); none of these assets needs runtime external
network access. The native 32×32 character pixels are enlarged to 3× with
the existing pixelated canvas settings.

## World projection

The projected floor polygon has a flat back edge, wider cutaway front,
two sloping side walls and four window entrances. `Arena.createWindow`
and `Arena.createWallSegments` use matching edge interpolation ratios,
so the visible window and hitscan gap remain aligned. Zombie behaviour,
round scaling, ammo/economy and input semantics have not been changed.

## Visual hierarchy

- Warm wood orange/brown: playable room / wooden crates.
- Deep blue night: exterior visible through broken windows.
- Olive helmet, tan face, dark gun: player silhouette.
- Square green faces, pale eyes, torn shirts: original zombie silhouette.
- Amber glowing crate: interactive Mystery Box.
- Cream stencil weapons: wall-buy markers.
- Pixel hearts and portrait upper-left; gold score and round upper-right;
  ammo lower-left on desktop, repositioned for touch layouts.

## Art production upgrade path

For final externally authored sheets, export each direction/action into
32×32 frames at the same texture keys. Retain the 3× presentation scale,
origin `(0.5, 28/32)`, and the feet-centred collision circle. To swap
procedural props for standalone PNGs later, preserve the identifiers in
`ArtManifest.ts` and update the `ensureEnvironmentArt` loader.

## QA

GitHub Actions runs unit checks, TypeScript, production Vite build and
real Chromium tests. The successful run also uploads a
`cabin-art-preview` PNG artifact captured from the actual game canvas.
That screenshot is a **reviewable approximation**, not an artistic
acceptance decision. Run final visual checks on desktop and real mobile
devices, comparing the in-game scale, occlusion, target readability,
window alignment, control safety and framerate.
