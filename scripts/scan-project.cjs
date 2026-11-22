const { execFileSync } = require("node:child_process");
const { lstatSync, readFileSync, realpathSync } = require("node:fs");
const path = require("node:path");

const hiddenGap = /(?<![ \t])[ \t]{100,}(?=\S)/;
const nodeInit = /\bnode(?:\.exe)?["']?[ \t]+["']?(?:\.[\\/])?init(?:\.[cm]?js)?(?=["'\s;&|<>)]|$)/i;
const utf8 = new TextDecoder("utf-8", { fatal: true });

function scanProject() {
  const root = realpathSync(execFileSync(
    "git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" },
  ).trimEnd());
  const listing = execFileSync(
    "git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  const files = new Set(listing.split("\0").filter(Boolean));
  let scanned = 0;
  let findings = 0;

  function report(file, location, reason) {
    findings++;
    console.error(JSON.stringify(file), location, reason);
  }

  for (const file of files) {
    const candidate = path.resolve(root, file);
    if (!lstatSync(candidate, { throwIfNoEntry: false })?.isFile()) continue;
    const resolved = realpathSync(candidate);
    if (path.relative(root, resolved) !== path.relative(root, candidate)) continue;

    const bytes = readFileSync(resolved);
    if (bytes.includes(0)) continue;

    let text;
    try {
      text = utf8.decode(bytes);
    } catch {
      continue;
    }

    scanned++;
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (hiddenGap.test(line)) {
        report(file, "line " + (index + 1), "Long whitespace before visible content");
      }
    }

    if (path.basename(file) !== "package.json") continue;

    let manifest;
    try {
      manifest = JSON.parse(text);
    } catch {
      report(file, "JSON", "Invalid package.json");
      continue;
    }

    for (const [name, command] of Object.entries(manifest?.scripts ?? {})) {
      if (typeof command === "string" && nodeInit.test(command)) {
        report(file, "scripts." + JSON.stringify(name), "Suspicious Node init command");
      }
    }
  }

  console.log("Scanned " + scanned + " text files. Findings: " + findings);
  if (findings) process.exitCode = 1;
}

try {
  scanProject();
} catch (error) {
  console.error("Scan failed:", error.message);
  process.exitCode = 2;
}