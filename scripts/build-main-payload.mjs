#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const source = process.argv[2];
if (!source) {
  throw new Error("Usage: node scripts/build-main-payload.mjs <source.html>");
}

const outputDir = path.resolve("v40-final/payload");
const names = [
  "part-1.txt",
  "part-2a.txt",
  "part-2b.txt",
  "part-2c.txt",
  "part-3a.txt",
  "part-3b.txt",
  "part-3c.txt",
];
const html = await readFile(path.resolve(source));
const encoded = gzipSync(html, { level: 9, mtime: 0 }).toString("base64");
const chunkSize = Math.ceil(encoded.length / names.length / 4) * 4;

for (const [index, name] of names.entries()) {
  const chunk = encoded.slice(index * chunkSize, (index + 1) * chunkSize);
  await writeFile(path.join(outputDir, name), chunk, "utf8");
}

const digest = createHash("sha256").update(html).digest("hex");
console.log(JSON.stringify({
  source: path.resolve(source),
  html_bytes: html.length,
  payload_bytes: encoded.length,
  parts: names.length,
  sha256: digest,
}, null, 2));
