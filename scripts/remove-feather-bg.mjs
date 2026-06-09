import sharp from "sharp";
import { readFileSync } from "node:fs";

const src =
  process.argv[2] ||
  "../assets/c__Users_nueva_AppData_Roaming_Cursor_User_workspaceStorage_ecd335ae0c21fb7d0e4f114017269772_images_image-ad0aa5e9-22c2-4def-8461-92cc9e1e8161.png";
const out = process.argv[3] || "public/images/feather-icon.png";

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  // Remove near-black background; keep white feather edges crisp.
  if (r < 40 && g < 40 && b < 40) {
    data[i + 3] = 0;
  } else if (r > 200 && g > 200 && b > 200) {
    data[i + 3] = 255;
  } else {
    // Anti-aliased edge pixels: scale alpha by luminance.
    const lum = (r + g + b) / 3;
    data[i + 3] = Math.min(255, Math.round((lum / 255) * 255));
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(out);

console.log(`Saved transparent icon: ${out} (${info.width}x${info.height})`);
