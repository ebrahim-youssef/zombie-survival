import Phaser from "phaser";

export const HUD_TEXTURES = {
  heart: "hud:heart",
  heartEmpty: "hud:heart-empty",
  gun: "hud:gun",
  portraitFrame: "hud:portrait-frame",
} as const;

/** Compact, pixel-snapped HUD pieces matching the cabin's arcade palette. */
export function ensureHudArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(HUD_TEXTURES.heart)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const heart = [
    "01100110",
    "11111111",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
  ];
  for (const [key, fill] of [
    [HUD_TEXTURES.heart, 0xe5434d],
    [HUD_TEXTURES.heartEmpty, 0x34383c],
  ] as const) {
    g.clear();
    for (let y = 0; y < heart.length; y += 1) {
      for (let x = 0; x < heart[y]!.length; x += 1) {
        if (heart[y]![x] !== "1") continue;
        g.fillStyle(0x15191e, 1);
        g.fillRect(x * 2 - 1, y * 2 - 1, 4, 4);
      }
    }
    for (let y = 0; y < heart.length; y += 1) {
      for (let x = 0; x < heart[y]!.length; x += 1) {
        if (heart[y]![x] !== "1") continue;
        g.fillStyle(fill, 1);
        g.fillRect(x * 2, y * 2, 2, 2);
      }
    }
    g.generateTexture(key, 18, 16);
  }

  g.clear();
  g.fillStyle(0xffe7bc);
  g.fillRect(2, 7, 40, 5);
  g.fillRect(5, 4, 15, 4);
  g.fillRect(30, 5, 16, 3);
  g.fillRect(42, 7, 10, 2);
  g.fillRect(12, 11, 6, 11);
  g.fillRect(18, 11, 14, 3);
  g.fillRect(30, 11, 7, 6);
  g.generateTexture(HUD_TEXTURES.gun, 54, 25);

  g.clear();
  g.fillStyle(0x171c20, 1); g.fillRect(0, 0, 56, 56);
  g.fillStyle(0xd9c79d, 1); g.fillRect(2, 2, 52, 52);
  g.fillStyle(0x374043, 1); g.fillRect(5, 5, 46, 46);
  g.fillStyle(0x161d21, 1); g.fillRect(8, 8, 40, 40);
  g.generateTexture(HUD_TEXTURES.portraitFrame, 56, 56);
  g.destroy();
}
