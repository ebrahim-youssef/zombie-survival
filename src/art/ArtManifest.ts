/**
 * Original, warm three-quarter adventure palette (no third-party game art).
 * Every environment and character texture should draw from these ramps.
 * New colors require an update to docs/11-art-direction-and-depth-rules.md.
 */
export const CABIN_PALETTE = {
  night: 0x101e30,
  nightBlue: 0x28465c,
  moonHighlight: 0x7897a3,
  plank: 0x90623f,
  plankLight: 0xb88956,
  plankDark: 0x4f372f,
  woodShadow: 0x352a29,
  woodEdge: 0xd0a070,
  frame: 0x3b302b,
  gold: 0xf5b740,
  cream: 0xffe6a0,
  blood: 0x9b3033,
  groundDetail: 0x594133,
  carpet: 0x804653,
  nightShadow: 0x15273b,
} as const;

export const CHARACTER_PALETTE = {
  survivor: {
    ink: "#29302e", skin: "#d4a074", skinLight: "#f0c698",
    skinDark: "#a76d4d", shirt: "#53694f", shirtLight: "#92a076",
    shirtShade: "#334a41", trousers: "#405a5d",
    trouserLight: "#769086", boots: "#2a3031",
    hat: "#647449", hatLight: "#abb17a", hatShade: "#415445",
    eye: "#292726", wound: "#9f503b", metal: "#778686",
  },
  zombie: {
    ink: "#30332e", skin: "#96a67a", skinLight: "#c4ca9c",
    skinDark: "#677955", shirt: "#bfbba6", shirtLight: "#e0d7bd",
    shirtShade: "#7e8575", trousers: "#485a67",
    trouserLight: "#70868c", boots: "#2d3335",
    hat: "#6b7d59", hatLight: "#a7b18a", hatShade: "#485746",
    eye: "#f6e9a0", wound: "#a54646", metal: "#717e7c",
  },
} as const;

export const ENV_TEXTURES = {
  lantern: "cabin:lantern",
  barrel: "cabin:barrel",
  shelf: "cabin:shelf",
  rug: "cabin:rug",
  chest: "cabin:mystery-chest",
  wallBuyMr6: "cabin:wall-mr6",
  wallBuyKuda: "cabin:wall-kuda",
  debris: "cabin:debris",
  paper: "cabin:paper",
  crate: "cabin:crate",
  sign: "cabin:poster",
} as const;

export const HUD_TEXTURES = {
  heart: "hud:heart",
  heartEmpty: "hud:heart-empty",
  gun: "hud:gun",
  portraitFrame: "hud:portrait-frame",
} as const;
