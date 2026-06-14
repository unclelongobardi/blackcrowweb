import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") walk(full, files);
    else if (entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

for (const file of walk(path.join(process.cwd(), "src"))) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  content = content.replace(/bg-foreground/g, "bg-primary text-white");

  if (
    content.includes("font-bold") &&
    content.includes("rounded-xl") &&
    content.includes("uiBtnPrimary") === false &&
    /className=\{?[`"'][^`"']*rounded-xl[^`"']*font-bold/.test(content)
  ) {
    if (!content.includes("uiBtnPrimary") && !content.includes("uiClasses")) {
      const importLine = 'import { uiBtnPrimary } from "@/lib/uiClasses";\n';
      const lastImport = content.lastIndexOf('\nimport ');
      if (lastImport !== -1) {
        const end = content.indexOf("\n", lastImport + 1);
        content = content.slice(0, end + 1) + importLine + content.slice(end + 1);
      }
    }
  }

  content = content.replace(
    /className="([^"]*rounded-xl[^"]*font-bold[^"]*)"/g,
    (match, cls) => {
      if (
        cls.includes("uiBtnPrimary") ||
        cls.includes("border") ||
        cls.includes("bg-bull") ||
        cls.includes("bg-surface") ||
        cls.includes("text-muted") ||
        cls.includes("text-faint") ||
        cls.includes("bg-primary")
      ) {
        return match;
      }
      return 'className="' + "${uiBtnPrimary}" + " " + cls + '"';
    },
  );

  content = content.replace(
    /className=\{`([^`]*rounded-xl[^`]*font-bold[^`]*)`\}/g,
    (match, cls) => {
      if (
        cls.includes("uiBtnPrimary") ||
        cls.includes("border") ||
        cls.includes("bg-bull") ||
        cls.includes("bg-primary") ||
        cls.includes("${uiBtnPrimary}")
      ) {
        return match;
      }
      return `className={\`${"${uiBtnPrimary}"} ${cls}\`}`;
    },
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("fixed", path.relative(process.cwd(), file));
  }
}
