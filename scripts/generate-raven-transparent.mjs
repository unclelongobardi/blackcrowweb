import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "public/images/raven-hero-cutout.png");
const OUTPUT = path.join(ROOT, "public/images/raven-hero-transparent.png");

function isBackdrop(r, g, b, a) {
  if (a < 8) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Remove black matte and its gray compression halo from the source asset.
  if (max < 105 && max - min < 32) return true;
  return false;
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.warn("raven source missing:", INPUT);
    return;
  }

  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels = new Uint8Array(data);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const idx = (x, y) => (y * width + x) * 4;
  const pi = (x, y) => y * width + x;

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y], [width - 1, y]);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const p = pi(x, y);
    if (visited[p]) continue;

    const i = idx(x, y);
    if (!isBackdrop(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) continue;

    visited[p] = 1;
    pixels[i + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Strip lingering low-contrast matte connected to the removed backdrop.
  for (let pass = 0; pass < 4; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = pi(x, y);
        if (visited[p]) continue;

        const i = idx(x, y);
        const max = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (max > 88) continue;

        let transparentNeighbors = 0;
        for (const [nx, ny] of [
          [x + 1, y],
          [x - 1, y],
          [x, y + 1],
          [x, y - 1],
        ]) {
          if (visited[pi(nx, ny)] || pixels[idx(nx, ny) + 3] < 8) transparentNeighbors++;
        }

        if (transparentNeighbors > 0) {
          visited[p] = 1;
          pixels[i + 3] = 0;
        }
      }
    }
  }

  // Feather only the outer silhouette edge (avoid a gray rectangular matte).
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const p = pi(x, y);
      if (visited[p] || pixels[idx(x, y) + 3] === 0) continue;

      let transparentNeighbors = 0;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (pixels[idx(nx, ny) + 3] < 8) transparentNeighbors++;
      }

      if (transparentNeighbors === 0) continue;

      const i = idx(x, y);
      const max = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
      if (max < 55) {
        pixels[i + 3] = Math.min(pixels[i + 3], Math.round(((max - 8) / 52) * 255));
      }
    }
  }

  const trimmed = await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .trim({ threshold: 1 })
    .toBuffer();

  await sharp(trimmed).png({ compressionLevel: 9 }).toFile(OUTPUT);

  console.log("wrote", path.relative(ROOT, OUTPUT));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
