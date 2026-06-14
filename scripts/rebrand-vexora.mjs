import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") walk(full, files);
    else if (/\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

const replacements = [
  ["BLACKCROW", "VEXORA"],
  ["$CROW", "$VEXORA"],
  ["blackcrow_official", "vexora_official"],
  ["blackcrow-official", "vexora-official"],
  ["EXPLORE VEXORA", "EXPLORE VEXORA"], // idempotent
  ["EXPLORE BLACKCROW", "EXPLORE VEXORA"],
  ["OFFICIAL BLACKCROW CABAL", "OFFICIAL VEXORA CABAL"],
  ["BLACKCROW OFFICIAL", "VEXORA OFFICIAL"],
  ["Official BLACKCROW", "Official VEXORA"],
  ["The Roost", "Leaderboard"],
  ["The Nest", "Home"],
  ["blackcrow-favicon.png", "vexora-favicon.png"],
  ["blackcrow-official.png", "vexora-official.png"],
  ["CROW_TOKEN_MINT", "VEXORA_TOKEN_MINT"],
];

for (const file of walk(ROOT)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  for (const [from, to] of replacements) {
    if (from === to) continue;
    content = content.split(from).join(to);
  }

  // Primary buttons: ui-btn-primary supplies blue bg; drop legacy black CTA classes
  content = content.replace(/\sbg-foreground(?=\s)/g, "");
  content = content.replace(/\stext-background/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("updated", path.relative(process.cwd(), file));
  }
}
