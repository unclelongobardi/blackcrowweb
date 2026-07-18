import fs from "node:fs";
import sharp from "sharp";

const [
  ,
  ,
  input,
  output,
  keyHex = "#ff00ff",
  transparentArg = "12",
  opaqueArg = "220",
] = process.argv;
const transparentDistance = Number(transparentArg);
const opaqueDistance = Number(opaqueArg);

if (
  !input ||
  !output ||
  !/^#[0-9a-f]{6}$/i.test(keyHex) ||
  !Number.isFinite(transparentDistance) ||
  !Number.isFinite(opaqueDistance) ||
  transparentDistance < 0 ||
  opaqueDistance <= transparentDistance
) {
  console.error(
    "Usage: node scripts/remove-chroma-background.mjs <input> <output> [#rrggbb] [transparent-distance] [opaque-distance]",
  );
  process.exit(1);
}

const key = [
  Number.parseInt(keyHex.slice(1, 3), 16),
  Number.parseInt(keyHex.slice(3, 5), 16),
  Number.parseInt(keyHex.slice(5, 7), 16),
];
const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const dr = data[i] - key[0];
  const dg = data[i + 1] - key[1];
  const db = data[i + 2] - key[2];
  const distance = Math.sqrt(dr * dr + dg * dg + db * db);
  const alpha = Math.max(
    0,
    Math.min(1, (distance - transparentDistance) / (opaqueDistance - transparentDistance)),
  );

  if (alpha <= 0) {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
    continue;
  }

  if (alpha < 1) {
    data[i] = Math.max(0, Math.min(255, Math.round((data[i] - key[0] * (1 - alpha)) / alpha)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round((data[i + 1] - key[1] * (1 - alpha)) / alpha)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round((data[i + 2] - key[2] * (1 - alpha)) / alpha)));
  }
  data[i + 3] = Math.round(alpha * 255);
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4,
  },
})
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(output);

const metadata = await sharp(output).metadata();
const stats = await sharp(output).stats();
const alpha = stats.channels[3];

if (!metadata.hasAlpha || !alpha || alpha.min !== 0 || alpha.max !== 255) {
  fs.rmSync(output, { force: true });
  throw new Error("Chroma-key output failed alpha validation.");
}

console.log(`wrote ${output} (${metadata.width}x${metadata.height}, alpha ${alpha.min}-${alpha.max})`);
