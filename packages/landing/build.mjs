import { mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = new URL("./", import.meta.url).pathname;
const src = resolve(root, "src");
const dist = resolve(root, "dist");

function copyDir(s, d) {
  mkdirSync(d, { recursive: true });
  for (const name of readdirSync(s)) {
    const sp = join(s, name);
    const dp = join(d, name);
    if (statSync(sp).isDirectory()) copyDir(sp, dp);
    else copyFileSync(sp, dp);
  }
}

copyDir(src, dist);
console.log(`built → ${dist}`);
