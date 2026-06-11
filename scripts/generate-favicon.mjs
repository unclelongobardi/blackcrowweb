import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const candidates = [
  path.join(root, "public", "images", "blackcrow-favicon-source.png"),
  path.join(root, "public", "images", "blackcrow-favicon.png"),
];

const source = candidates.find((p) => fs.existsSync(p));
if (!source) {
  console.error("Missing favicon source (blackcrow-favicon-source.png or blackcrow-favicon.png).");
  process.exit(1);
}

async function writePng(outPath, size) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
  console.log("wrote", path.relative(root, outPath), `(${size}x${size})`);
}

console.log("favicon source:", path.relative(root, source));

await writePng(path.join(root, "src", "app", "icon.png"), 32);
await writePng(path.join(root, "src", "app", "apple-icon.png"), 180);
await writePng(path.join(root, "public", "images", "blackcrow-favicon.png"), 512);

const icon32 = await sharp(path.join(root, "src", "app", "icon.png")).png().toBuffer();
const ico = await toIco([icon32], { resize: false });
const icoPath = path.join(root, "src", "app", "favicon.ico");
fs.writeFileSync(icoPath, ico);
console.log("wrote", path.relative(root, icoPath));
