import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const envFile = path.join(root, ".env.cpanel");
if (!fs.existsSync(envFile)) {
    console.error("Missing .env.cpanel");
    process.exit(1);
}

for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) process.env[key] = value;
}

if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error("NEXT_PUBLIC_API_URL empty in .env.cpanel");
    process.exit(1);
}

console.log(`Building with NEXT_PUBLIC_API_URL=${process.env.NEXT_PUBLIC_API_URL}`);

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const build = spawnSync(npmCmd, ["run", "build"], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const outDir = path.join(root, "out");
if (!fs.existsSync(path.join(outDir, "index.html"))) {
    console.error("out/ missing after build");
    process.exit(1);
}

fs.copyFileSync(path.join(root, "scripts", "htaccess.deploy"), path.join(outDir, ".htaccess"));

const archive = path.join(root, "tamimi-fe-deploy.tar.gz");
if (fs.existsSync(archive)) fs.unlinkSync(archive);

const tar = spawnSync("tar", ["-czf", archive, "-C", outDir, "."], {
    stdio: "inherit",
    shell: process.platform === "win32",
});
if (tar.status !== 0) {
    console.error("tar failed — on Windows use Git Bash or ensure `tar` is available");
    process.exit(tar.status ?? 1);
}

console.log(`OK → ${archive}`);
console.log("Extract into the FE subdomain document root (e.g. public_html for tamimidash)");
