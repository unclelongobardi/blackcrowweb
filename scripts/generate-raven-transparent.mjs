import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "public/images/raven-hero-cutout.png");
const OUTPUT = path.join(ROOT, "public/images/raven-hero-transparent.png");

function isBackground(r, g, b, a) {
  if (a < 8) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Uniform near-black backdrop from the source asset.
  if (max < 65 && max - min < 28) return true;
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
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (!isBackground(r, g, b, a)) continue;

    visited[p] = 1;
    pixels[i + 3] = 0;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Soften edges where dark feather meets removed backdrop.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = pi(x, y);
      if (visited[p]) continue;

      const i = idx(x, y);
      if (pixels[i + 3] === 0) continue;

      let transparentNeighbors = 0;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (visited[pi(nx, ny)]) transparentNeighbors++;
      }

      if (transparentNeighbors > 0) {
        const max = Math.max(pixels[i], pixels[i + 1], pixels[i + 2]);
        const feather = Math.min(255, Math.max(0, ((max - 20) / 80) * 255));
        pixels[i + 3] = Math.min(pixels[i + 3], Math.round(feather));
      }
    }
  }

  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT);

  console.log("wrote", path.relative(ROOT, OUTPUT));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
