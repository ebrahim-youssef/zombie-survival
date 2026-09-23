# 11 — Original three-quarter adventure art direction and rendering contract

**Status:** Stage 3A design contract. Follow this before editing the room,
characters, sprites or effects. Inspiration is the angled top-down
readability of classic adventure games such as Zelda, **not their copyrighted
assets, exact maps, licensed characters, or distinctive iconography**.
The current pixel textures remain original and locally generated.

## Projection and framing

- Use **2D three-quarter/top-down orthographic art**, not camera rotation,
  actual 3D perspective or an Age-of-Zombies overhead silhouette. See a
  complete standing character including face, torso, short legs and feet.
- Show a straight rear wall, shallow angled side walls and **low cutaway**
  front edge. Taper must be modest, not an exaggerated diamond vanishing
  toward a single rear point. The floor feels like a navigable room.
- Keep Cartesian `x/y` movement and shared window-wall hit geometry;
  geometry and art projection must use the **same** polygon vertices.
- Stage 3B increases room play area to half-width **990** and half-height
  **470** from **730 × 330**, modest rear half-width ratio **0.78**
  (formerly 0.49). Viewport stays responsive with world camera zoom 1;
  camera follows the player through the larger room rather than fitting
  the whole map into a tiny phone display.
- Rendered player/zombies remain 64 × 64 authored frames, displayed 1.5×
  (96px) and anchored at feet; no changes to Stage 2 physics or damage.

## Canonical color ramps

`src/art/ArtManifest.ts` exports exact colors.

| Purpose | Hex | Role |
| --- | --- | --- |
| Night exterior | `#101E30` | Cool darkness, never mistaken for interior |
| Night sky midtone | `#28465C` | Windows, distant depth |
| Moon highlight | `#7897A3` | Restrained cool rim light |
| Planks | `#90623F` | Navigable ground |
| Plank highlight | `#B88956` | Top-left raised edges |
| Plank shadow | `#4F372F` | Recessed seams, wear |
| Structural shadow | `#352A29` | Wall thickness and supports |
| Wood rim | `#D0A070` | Selected edge highlights |
| Interaction gold | `#F5B740` | Lamps and mystery chest |
| HUD cream | `#FFE6A0` | Readable labels |
| Survivor | sage/olive + warm skin | Distinguishable from wood |
| Zombies | pale moss + cool blue-grey trousers | Distinguishable from player |
| Carpets | `#804653` | Ground-only accent |

Prefer 3–5 shades per material (shadow, base, light, small accent).
Do not scatter arbitrary RGB magic values through new art functions:
extend the manifest if a new material needs a deliberate hue.

## Pixel/shape language

- Keep clean **readable silhouettes**, especially at mobile scale.
  Compact body and short legs, slightly enlarged but rounded head,
  visible faces and shoulder/chest orientation across eight facings.
- Author whole characters on the existing 32-unit design grid rasterized
  at 64 × 64 for restrained subpixel curves. Preserve 96px visible size.
- Use clusters and selective 1–2px rim highlights; avoid large flat
  rectangular heads/limbs and noisy one-pixel confetti.
- Light comes from top-left moonlight plus **localized** warm lanterns.
  Shadows and outlines should never hide the zombie face or aimable body.
- Floor plank lines follow **horizontal world rows** with short staggered
  joins; perspective comes primarily from the cutaway wall faces and
  organic scenery, not from a shrinking physics plane.

## Absolute render/layer policy

Enforced by pure `src/art/worldLayers.ts` and tested:

1. `exterior` −80: cold night beyond cabin.
2. `floor` −60: floor and plank geometry.
3. `groundDecal` −55: **rug, scattered paper, blood, flat debris**.
   These NEVER use y-sort and NEVER obscure player or zombies.
4. `groundLight` −50: lantern and chest glow pools on the ground.
5. `windowBackdrop` −47: blue exterior visible through actual wall gaps.
   The backdrop sits **under outside zombies**, not over them.
6. `outsideActor` −45: zombies outside the window, behind wall face.
7. `rearWall` −40: rear and side wall faces, gaps and window frames.
8. `wallDecal` −35: wall-buy signage/posters; never occlude actors.
9. `actorDepth(y)` 100 + y/1000: player, inside zombies, corpses.
10. `tallPropDepth(footY)` actorDepth + 0.001: crates, shelves,
   barrels, lantern bodies and Mystery Box. They occlude actors only
   when physically **in front** by foot anchor; behind actors otherwise.
11. `foregroundWall` 800: low foreground cutaway wall/ledge only.
12. `combatEffects` 900; `hud` 2000+; `debug` 3500+.

**Layering invariants:** `groundDecal < windowBackdrop <
outsideActor < rearWall <
actorDepth < foregroundWall < hud`, and two inside actors should switch
occlusion ordering when their feet cross. Effects are presentation only:
a decal never becomes an invisible combat collider.

## QA gates

- Pure Node tests for palette contract, projection dimensions, window
  opening alignment and depth inequalities.
- Browser smoke verifies the rug/paper depth is below active zombies,
  player and damage numbers; tests actor y-sort and the enlarged room.
- Keep existing gun/melee/mobile controls, fixed source-pixel foot bodies
  and independent torso hurtboxes unchanged.
- Capture a real browser screenshot through CI. Visual QA on actual
  small-screen Android/iOS remains mandatory for final art approval.

### Window aperture invariant

Actual wooden wall faces must be rendered in two segments, split by the
SAME `windowGapFractions` as bullet collision. The blue opening pane lives
in `windowBackdrop`, below outside zombies; only frames and breakable-looking
decorative boards remain on the wall layer. Otherwise zombies would appear
to pop into the room after crossing an invisible solid wall.
