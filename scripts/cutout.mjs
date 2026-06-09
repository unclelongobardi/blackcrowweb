// Removes the (baked-in) light checkerboard/white background from the generated
// raven by flood-filling the connected light region from the image borders.
// Produces a genuinely transparent PNG. The crow is dark so it survives;
// enclosed light areas (the eye) are preserved because they are not reachable
// from the border.
import sharp from "sharp";

const SRC = "public/images/raven-hero-clean.png";
const OUT = "public/images/raven-hero-cutout.png";

const LIGHT = 150; // luminance above this is "background-ish"
const EDGE = 120; // feather floor

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const run = async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const idx = (x, y) => (y * width + x) * channels;
  const bg = new Uint8Array(width * height);
  const queue = [];

  const consider = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (bg[p]) return;
    const i = idx(x, y);
    if (lum(data[i], data[i + 1], data[i + 2]) >= LIGHT) {
      bg[p] = 1;
      queue.push(x, y);
    }
  };

  for (let x = 0; x < width; x++) {
    consider(x, 0);
    consider(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    consider(0, y);
    consider(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    consider(x + 1, y);
    consider(x - 1, y);
    consider(x, y + 1);
    consider(x, y - 1);
  }

  // Apply: background -> fully transparent. Feather edge pixels that are light
  // but not flagged (anti-aliased ring) by scaling alpha with darkness.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      const i = idx(x, y);
      if (bg[p]) {
        data[i + 3] = 0;
        continue;
      }
      const l = lum(data[i], data[i + 1], data[i + 2]);
      // Only feather pixels adjacent to background to avoid touching the eye.
      const nearBg =
        (x > 0 && bg[p - 1]) ||
        (x < width - 1 && bg[p + 1]) ||
        (y > 0 && bg[p - width]) ||
        (y < height - 1 && bg[p + width]);
      if (nearBg && l > EDGE) {
        const a = Math.round(255 * (1 - Math.min(1, (l - EDGE) / (LIGHT - EDGE))));
        data[i + 3] = Math.min(data[i + 3], a);
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT);

  const transparent = [...bg].reduce((a, b) => a + b, 0);
  console.log(`Wrote ${OUT} (${width}x${height}). Background pixels removed: ${transparent}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
