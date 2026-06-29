import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const images = path.join(root, "public", "images");

const source = path.join(images, "valore-logo-source.png");
if (!fs.existsSync(source)) {
  console.error("Missing public/images/valore-logo-source.png — add the official VALORE logo PNG.");
  process.exit(1);
}

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const trimmed = await sharp(source).trim({ threshold: 10 }).png().toBuffer();

async function writeLogo(outPath, size) {
  await sharp(trimmed)
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

// UI mark + favicon source — transparent only, no canvas padding
await writeLogo(path.join(images, "valore-logo.png"), 512);
await writeLogo(path.join(images, "valore-favicon-source.png"), 512);
await writeLogo(path.join(images, "valore-hero-illustration.png"), 1024);

console.log("wrote public/images/valore-logo.png");
console.log("wrote public/images/valore-favicon-source.png");
console.log("wrote public/images/valore-hero-illustration.png");
