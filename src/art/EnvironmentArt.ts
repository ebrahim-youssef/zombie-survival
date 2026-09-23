import Phaser from "phaser";

/** Original hand-defined pixel textures generated once and shared by props. */
export const CABIN_PALETTE = {
  night: 0x08182b,
  nightBlue: 0x183557,
  plank: 0x84512f,
  plankLight: 0xae7141,
  plankDark: 0x4b2e28,
  frame: 0x3b241f,
  gold: 0xf5b740,
  cream: 0xffe6a0,
  blood: 0x9b3033,
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
  crate: "cabin:crate",
  sign: "cabin:poster",
} as const;

type Canvas = Phaser.GameObjects.Graphics;
function rect(g: Canvas, color: number, x: number, y: number, w: number, h: number): void {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}
function edge(g: Canvas, color: number, x: number, y: number, w: number, h: number): void {
  g.lineStyle(2, color, 1);
  g.strokeRect(x, y, w, h);
}
function render(g: Canvas, key: string, w: number, h: number, paint: () => void): void {
  g.clear();
  paint();
  g.generateTexture(key, w, h);
}
function gun(g: Canvas, x: number, y: number, long: boolean, color: number): void {
  const w = long ? 33 : 24;
  rect(g, color, x, y + 4, w, 5);
  rect(g, color, x + 2, y, 11, 4);
  rect(g, color, x + w - 2, y + 3, long ? 18 : 8, 2);
  rect(g, color, x + 6, y + 8, 5, 11);
  rect(g, color, x + 12, y + 8, 8, 2);
  if (long) rect(g, color, x + 20, y + 9, 9, 4);
}

/** Generation is deterministic and does not allocate graphics each frame. */
export function ensureEnvironmentArt(scene: Phaser.Scene): void {
  if (scene.textures.exists(ENV_TEXTURES.chest)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  render(g, ENV_TEXTURES.lantern, 24, 40, () => {
    rect(g, 0x251e1c, 8, 31, 10, 6);
    rect(g, 0x8a5533, 9, 29, 8, 6);
    rect(g, 0x402d22, 5, 10, 15, 23);
    rect(g, 0xd69b37, 7, 9, 11, 3);
    rect(g, 0xf7b736, 7, 13, 11, 16);
    rect(g, 0xffdb61, 9, 15, 7, 12);
    rect(g, 0xfff3b4, 11, 16, 3, 9);
    rect(g, 0xa9672b, 5, 12, 3, 20);
    rect(g, 0xa9672b, 17, 12, 3, 20);
    rect(g, 0x372820, 7, 31, 13, 3);
    g.lineStyle(3, 0x5f412a);
    g.strokeRoundedRect(8, 3, 8, 10, 3);
    rect(g, 0xdaaa62, 10, 5, 4, 2);
  });

  render(g, ENV_TEXTURES.barrel, 44, 44, () => {
    rect(g, 0x1b181b, 3, 12, 37, 26);
    rect(g, 0x75452c, 5, 14, 33, 23);
    rect(g, 0xa87543, 8, 15, 5, 19);
    rect(g, 0x5a3327, 17, 14, 6, 23);
    rect(g, 0x9b6338, 28, 13, 7, 22);
    rect(g, 0x2c2828, 4, 20, 35, 4);
    rect(g, 0x2c2828, 5, 32, 34, 4);
    g.fillStyle(0x2f2825, 1); g.fillEllipse(22, 12, 38, 14);
    g.fillStyle(0x996b43, 1); g.fillEllipse(22, 10, 31, 8);
    g.fillStyle(0x634229, 1); g.fillEllipse(22, 10, 23, 5);
    g.lineStyle(2, 0x1b1c1e); g.strokeEllipse(22, 12, 36, 11);
  });

  render(g, ENV_TEXTURES.shelf, 68, 94, () => {
    rect(g, 0x20191c, 3, 7, 61, 83);
    rect(g, 0x75422c, 6, 10, 55, 78);
    rect(g, 0x9d6238, 9, 12, 49, 3);
    for (const y of [31, 55, 78]) {
      rect(g, 0x301f20, 9, y, 49, 5);
      rect(g, 0xa76a3b, 7, y - 2, 53, 4);
    }
    const bookColors = [0x354954, 0x977052, 0x536341, 0x935f41, 0x3e5261];
    for (let row = 0; row < 3; row += 1) {
      for (let b = 0; b < 7; b += 1) {
        const x = 11 + b * 7;
        const y = 19 + row * 23;
        rect(g, bookColors[(b + row * 2) % bookColors.length]!, x, y, 5, row === 1 ? 11 : 10);
        rect(g, 0xc49a69, x + 1, y + 2, 1, 6);
      }
    }
    rect(g, 0xb07742, 3, 4, 61, 7);
    rect(g, 0x3c2923, 5, 88, 13, 5);
    rect(g, 0x3c2923, 53, 88, 11, 5);
    rect(g, 0x854532, 28, 0, 17, 6);
    rect(g, 0x376346, 30, 0, 2, 3);
    rect(g, 0x579453, 36, 0, 5, 5);
  });

  render(g, ENV_TEXTURES.rug, 112, 75, () => {
    g.fillStyle(0x221d22, 0.5); g.fillEllipse(56, 43, 104, 50);
    rect(g, 0x4b242d, 8, 5, 98, 59);
    edge(g, 0x9c5541, 12, 9, 90, 51);
    edge(g, 0x673641, 18, 14, 78, 42);
    rect(g, 0x702f3a, 21, 18, 70, 34);
    for (let x = 25; x < 92; x += 13) {
      for (let y = 20; y < 49; y += 11) {
        rect(g, ((x + y) % 3) === 0 ? 0xae604e : 0x482c35, x, y, 6, 3);
      }
    }
    for (let x = 14; x < 101; x += 6) {
      rect(g, 0xd0a371, x, 3, 2, 4);
      rect(g, 0xd0a371, x, 62, 2, 5);
    }
  });

  render(g, ENV_TEXTURES.chest, 80, 60, () => {
    g.fillStyle(0x151923, 0.45); g.fillEllipse(41, 54, 72, 12);
    rect(g, 0x2b241d, 6, 23, 68, 28);
    rect(g, 0x885126, 8, 24, 64, 23);
    rect(g, 0xad7131, 12, 27, 55, 17);
    rect(g, 0x52341e, 18, 20, 5, 28);
    rect(g, 0xe0a540, 20, 23, 2, 20);
    rect(g, 0x52341e, 56, 20, 5, 28);
    rect(g, 0xe0a540, 58, 23, 2, 20);
    g.fillStyle(0x3e291b, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(8, 23),
      new Phaser.Math.Vector2(25, 8),
      new Phaser.Math.Vector2(69, 11),
      new Phaser.Math.Vector2(74, 23),
    ], true);
    g.fillStyle(0x9e6229, 1);
    g.fillPoints([
      new Phaser.Math.Vector2(13, 20),
      new Phaser.Math.Vector2(26, 11),
      new Phaser.Math.Vector2(64, 13),
      new Phaser.Math.Vector2(67, 21),
    ], true);
    rect(g, 0xd69b42, 27, 11, 4, 10);
    rect(g, 0xd69b42, 49, 11, 4, 11);
    edge(g, 0x281f1c, 7, 23, 66, 26);
    rect(g, 0xe7b64e, 36, 30, 9, 12);
    rect(g, 0xffe4a0, 38, 32, 5, 7);
    rect(g, 0x5c351f, 39, 38, 2, 7);
  });

  for (const [key, large] of [
    [ENV_TEXTURES.wallBuyMr6, false],
    [ENV_TEXTURES.wallBuyKuda, true],
  ] as const) {
    render(g, key, 94, 52, () => {
      rect(g, 0x211e20, 2, 3, 90, 44);
      rect(g, 0x513b2b, 5, 5, 84, 39);
      edge(g, 0x8f6944, 7, 6, 80, 35);
      gun(g, large ? 19 : 24, 13, large, 0xf2d287);
      rect(g, 0xe0b45d, 42, 36, 10, 3);
      rect(g, 0xa47e4d, 11, 43, 72, 2);
    });
  }

  render(g, ENV_TEXTURES.crate, 46, 41, () => {
    g.fillStyle(0x181a1b, .5); g.fillEllipse(24, 36, 40, 8);
    rect(g, 0x251d1b, 5, 8, 36, 29);
    rect(g, 0x865332, 7, 11, 32, 23);
    rect(g, 0xa77546, 9, 13, 29, 4);
    rect(g, 0x493123, 8, 18, 29, 3);
    rect(g, 0x493123, 12, 12, 4, 22);
    rect(g, 0x493123, 29, 12, 4, 22);
    rect(g, 0xc08a48, 15, 15, 3, 14);
  });

  render(g, ENV_TEXTURES.debris, 36, 27, () => {
    rect(g, 0x352523, 1, 16, 28, 4);
    rect(g, 0x895837, 2, 15, 27, 3);
    rect(g, 0x382921, 12, 6, 22, 3);
    rect(g, 0xb47c49, 13, 5, 21, 2);
    rect(g, 0x75543c, 6, 3, 7, 11);
    rect(g, 0x362d2b, 19, 20, 12, 3);
  });

  render(g, ENV_TEXTURES.sign, 70, 84, () => {
    rect(g, 0x392a23, 2, 3, 66, 77);
    rect(g, 0xd1bd98, 5, 6, 60, 71);
    rect(g, 0x9e806b, 7, 7, 56, 2);
    rect(g, 0x913e32, 7, 12, 4, 13);
    rect(g, 0xa94a3c, 60, 52, 4, 17);
    rect(g, 0x664d42, 11, 71, 49, 2);
  });

  g.destroy();
}
