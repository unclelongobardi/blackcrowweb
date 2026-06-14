import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const images = path.join(root, "public", "images");

const source = path.join(images, "vexora-logo-source.png");
if (!fs.existsSync(source)) {
  console.error("Missing public/images/vexora-logo-source.png — add the official VEXORA logo PNG.");
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
await writeLogo(path.join(images, "vexora-logo.png"), 512);
await writeLogo(path.join(images, "vexora-favicon-source.png"), 512);

console.log("wrote public/images/vexora-logo.png");
console.log("wrote public/images/vexora-favicon-source.png");
