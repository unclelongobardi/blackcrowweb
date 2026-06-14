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

const trimmed = await sharp(source).trim({ threshold: 10 }).png().toBuffer();

// UI mark — transparent background for headers, footers, app shell
await sharp(trimmed)
  .resize(512, 512, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(images, "vexora-logo.png"));

// Favicon source — white canvas for browser tab / apple touch padding
await sharp(trimmed)
  .resize(460, 460, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .extend({
    top: 26,
    bottom: 26,
    left: 26,
    right: 26,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(images, "vexora-favicon-source.png"));

console.log("wrote public/images/vexora-logo.png");
console.log("wrote public/images/vexora-favicon-source.png");
