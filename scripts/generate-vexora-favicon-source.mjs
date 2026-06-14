import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/images/vexora-favicon-source.png");

// Blue V mark on white — used by generate-favicon.mjs
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#ffffff"/>
  <path d="M128 128 L256 384 L384 128 L340 128 L256 296 L172 128 Z" fill="#1652F0"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log("wrote", path.relative(ROOT, OUT));
