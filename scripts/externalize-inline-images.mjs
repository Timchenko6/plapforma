#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [sourceArg, outputArg, publicPrefix = "assets/v48/inline"] = process.argv.slice(2);
if (!sourceArg || !outputArg) {
  throw new Error("Usage: node scripts/externalize-inline-images.mjs <source.html> <output-dir> [public-prefix]");
}

const source = path.resolve(sourceArg);
const outputDir = path.resolve(outputArg);
const html = await readFile(source, "utf8");
const pattern = /data:image\/(png|webp|jpe?g);base64,([A-Za-z0-9+/=]+)/g;
const matches = [...html.matchAll(pattern)];
await mkdir(outputDir, { recursive: true });

let index = 0;
const files = new Map();
const rewritten = html.replace(pattern, (_match, rawExtension, encoded) => {
  const bytes = Buffer.from(encoded, "base64");
  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const extension = rawExtension === "jpeg" ? "jpg" : rawExtension;
  const name = `image-${String(++index).padStart(2, "0")}-${digest}.${extension}`;
  files.set(name, bytes);
  return `${publicPrefix}/${name}`;
});

for (const [name, bytes] of files) await writeFile(path.join(outputDir, name), bytes);
await writeFile(source, rewritten, "utf8");
console.log(JSON.stringify({ source, images_externalized: matches.length, output_dir: outputDir }, null, 2));
