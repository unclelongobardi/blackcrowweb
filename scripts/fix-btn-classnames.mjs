import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") walk(full, files);
    else if (full.endsWith(".tsx")) files.push(full);
  }
  return files;
}

for (const file of walk(path.join(process.cwd(), "src"))) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  content = content.replace(
    /className="\$\{uiBtnPrimary\}([^"]*)"/g,
    "className={`${uiBtnPrimary}$1`}",
  );

  if (content.includes("uiBtnPrimary") && !content.includes("uiClasses")) {
    const firstImport = content.indexOf("\nimport ");
    if (firstImport !== -1) {
      content =
        content.slice(0, firstImport + 1) +
        'import { uiBtnPrimary } from "@/lib/uiClasses";\n' +
        content.slice(firstImport + 1);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("fixed", path.relative(process.cwd(), file));
  }
}
