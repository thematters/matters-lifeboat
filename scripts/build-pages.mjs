import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(new URL("./", import.meta.url).pathname, "..");
const out = resolve(root, "dist-pages");

console.log("→ clean", out);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

console.log("→ build app");
execSync("npm -w @matters/lifeboat-app run build", { cwd: root, stdio: "inherit" });

console.log("→ build landing");
execSync("node packages/landing/build.mjs", { cwd: root, stdio: "inherit" });

function copyDir(s, d) {
  mkdirSync(d, { recursive: true });
  for (const name of readdirSync(s)) {
    const sp = join(s, name);
    const dp = join(d, name);
    if (statSync(sp).isDirectory()) copyDir(sp, dp);
    else copyFileSync(sp, dp);
  }
}

console.log("→ assemble: landing → /, app → /app/");
copyDir(resolve(root, "packages/landing/dist"), out);
copyDir(resolve(root, "packages/app/dist"), join(out, "app"));

console.log("✓ ready", out);
