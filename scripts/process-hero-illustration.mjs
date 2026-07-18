import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const input = path.join(root, "public/images/gloria-hero-illustration-source.png");
const logo = path.join(root, "public/images/gloria-logo-source.svg");
const output = path.join(root, "public/images/gloria-hero-illustration.png");

if (!fs.existsSync(input)) {
  console.log("skip: no hero illustration source");
  process.exit(0);
}

const HARD = 246;
const SOFT = 228;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const strayWidth = Math.min(info.width, 120);
const strayHeight = Math.min(info.height, 60);
for (let y = 0; y < strayHeight; y++) {
  for (let x = 0; x < strayWidth; x++) {
    data[(y * info.width + x) * 4 + 3] = 0;
  }
}

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = max - min;

  if (lum >= HARD && sat < 28) {
    data[i + 3] = 0;
  } else if (lum >= SOFT && sat < 40) {
    const t = (lum - SOFT) / (HARD - SOFT);
    data[i + 3] = Math.round(data[i + 3] * (1 - Math.min(1, t)));
  }
}

const centerSize = Math.round(Math.min(info.width, info.height) * 0.29);
const markSize = Math.round(centerSize * 0.7);
const centerLeft = Math.round((info.width - centerSize) / 2);
const centerTop = Math.round((info.height - centerSize) / 2);
const mark = await sharp(logo).resize(markSize, markSize, { fit: "contain" }).png().toBuffer();
const medallion = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${centerSize}" height="${centerSize}">
    <circle cx="${centerSize / 2}" cy="${centerSize / 2}" r="${centerSize / 2 - 6}"
      fill="#ffffff" stroke="#1652f0" stroke-width="3"/>
  </svg>
`);

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .composite([
    { input: medallion, left: centerLeft, top: centerTop },
    {
      input: mark,
      left: Math.round((info.width - markSize) / 2),
      top: Math.round((info.height - markSize) / 2),
    },
  ])
  .trim({ threshold: 12 })
  .extend({ top: 24, right: 24, bottom: 24, left: 24, background: TRANSPARENT })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(output);

console.log("wrote public/images/gloria-hero-illustration.png");
