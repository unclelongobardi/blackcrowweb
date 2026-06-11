import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input =
  process.argv[2] ||
  path.join(root, "public", "images", "blackcrow-mark-source.png");

/** Dark / opaque pixels → white; existing transparency preserved. */
async function toWhiteTransparent(inputPath, outputPath, size) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (a < 12 && lum > 240) {
      data[i + 3] = 0;
      continue;
    }

    if (a < 12 && lum <= 240) {
      data[i + 3] = 0;
      continue;
    }

    const strength = Math.max(a / 255, (255 - lum) / 255);
    if (strength < 0.04) {
      data[i + 3] = 0;
      continue;
    }

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = Math.min(255, Math.round(strength * 255));
  }

  let pipeline = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png();

  if (size) {
    pipeline = pipeline.resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  await pipeline.toFile(outputPath);
  console.log("wrote", outputPath);
}

console.log("source", input);
await toWhiteTransparent(input, path.join(root, "public", "images", "blackcrow-mark-white.png"), 512);
