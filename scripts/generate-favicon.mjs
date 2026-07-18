import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const candidates = [
  path.join(root, "public", "images", "gloria-favicon-source.png"),
  path.join(root, "public", "images", "gloria-logo.png"),
  path.join(root, "public", "images", "gloria-logo-source.png"),
];

const source = candidates.find((p) => fs.existsSync(p));
if (!source) {
  console.error("Missing favicon source. Run: node scripts/process-gloria-logo.mjs");
  process.exit(1);
}

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function writePng(outPath, size) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: TRANSPARENT,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
  console.log("wrote", path.relative(root, outPath), `(${size}x${size})`);
}

async function pngBuffer(size) {
  return sharp(source)
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

console.log("favicon source:", path.relative(root, source));

await writePng(path.join(root, "src", "app", "icon.png"), 32);
await writePng(path.join(root, "src", "app", "apple-icon.png"), 180);
await writePng(path.join(root, "public", "images", "gloria-favicon.png"), 512);

// Official avatar keeps a light canvas for profile readability
await sharp(source)
  .resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .png()
  .toFile(path.join(root, "public", "images", "gloria-official.png"));

const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(icoSizes.map((size) => pngBuffer(size)));
const ico = await toIco(icoBuffers, { resize: false });
const icoPath = path.join(root, "src", "app", "favicon.ico");
fs.writeFileSync(icoPath, ico);
console.log("wrote", path.relative(root, icoPath), `(${icoSizes.join(", ")}px, transparent)`);
