import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const input = path.join(root, "public/images/gloria-hero-illustration-source.png");
const output = path.join(root, "public/images/gloria-hero-illustration.png");

if (!fs.existsSync(input)) {
  console.log("skip: no hero illustration source");
  process.exit(0);
}

// The supplied hero is a finished square composition. Preserve its canvas and
// artwork exactly; prebuild only normalizes metadata and optimizes the PNG.
await sharp(input)
  .rotate()
  .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(output);

console.log("wrote public/images/gloria-hero-illustration.png");
