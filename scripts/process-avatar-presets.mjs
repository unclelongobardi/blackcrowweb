import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [, , sourceDirArg] = process.argv;

if (!sourceDirArg) {
  console.error("Usage: node scripts/process-avatar-presets.mjs <generated-images-dir>");
  process.exit(1);
}

const sourceDir = path.resolve(sourceDirArg);
const alphaCutoff = 18;
const outputSize = 512;

const items = [
  ...Array.from({ length: 25 }, (_, i) => ({
    kind: "normal",
    id: `vex-normal-${String(i + 1).padStart(2, "0")}`,
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    kind: "vip",
    id: `vex-vip-${String(i + 1).padStart(2, "0")}`,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    kind: "election",
    id: `vex-election-${String(i + 1).padStart(2, "0")}`,
  })),
];

function removeGreenBackground(data, info) {
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;

      const maxOther = Math.max(r, b);
      const pureKeyDistance = Math.hypot(r, g - 255, b);
      const greenDominant = g > 58 && r < 150 && b < 150 && g - maxOther > 18;
      const alpha =
        pureKeyDistance < 90 || greenDominant
          ? 0
          : pureKeyDistance < 145 && g > r * 1.18 && g > b * 1.18
            ? Math.round(((pureKeyDistance - 90) / 45) * 255)
            : 255;

      data[idx + 3] = alpha;

      if (alpha > alphaCutoff) {
        // Despill near keyed edges without touching dark green clothing.
        if (g > 42 && g > maxOther + 8) {
          data[idx + 1] = Math.min(g, maxOther + 2);
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      } else {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { data, extract: { left: 0, top: 0, width: info.width, height: info.height } };
  }

  const pad = Math.round(Math.max(info.width, info.height) * 0.035);
  return {
    data,
    extract: {
      left: Math.max(0, minX - pad),
      top: Math.max(0, minY - pad),
      width: Math.min(info.width - Math.max(0, minX - pad), maxX - minX + pad * 2 + 1),
      height: Math.min(info.height - Math.max(0, minY - pad), maxY - minY + pad * 2 + 1),
    },
  };
}

function cleanResidualGreen(data, info) {
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;
      const a = data[idx + 3] ?? 0;
      const maxOther = Math.max(r, b);

      if (a > 0 && g > 10 && g > maxOther + 4 && r < 180 && b < 180) {
        if (a < 110) {
          data[idx + 3] = 0;
        } else {
          data[idx + 1] = Math.min(g, maxOther);
        }
      }
    }
  }

  return data;
}

async function main() {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const files = (
    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
        .map(async (entry) => {
          const filePath = path.join(sourceDir, entry.name);
          const stat = await fs.stat(filePath);
          return { filePath, mtimeMs: stat.mtimeMs };
        }),
    )
  ).sort((a, b) => a.mtimeMs - b.mtimeMs);

  const sources = files.slice(-50);
  if (sources.length !== 50) {
    throw new Error(`Expected 50 generated sources, found ${sources.length}.`);
  }

  for (const item of items) {
    await fs.mkdir(path.join("public", "images", "avatars", "presets", item.kind), {
      recursive: true,
    });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const source = sources[i];
    const { data, info } = await sharp(source.filePath).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });
    const keyed = removeGreenBackground(Buffer.from(data), info);
    const out = path.join(
      "public",
      "images",
      "avatars",
      "presets",
      item.kind,
      `${item.id}.png`,
    );

    const resized = await sharp(keyed.data, { raw: info })
      .extract(keyed.extract)
      .resize(outputSize, outputSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const cleaned = cleanResidualGreen(Buffer.from(resized.data), resized.info);

    await sharp(cleaned, { raw: resized.info })
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(out);
  }

  console.log(`Processed ${items.length} avatar presets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
