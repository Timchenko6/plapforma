#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import path from "node:path";

const root = process.cwd();
const loader = await readFile(path.join(root, "index.html"), "utf8");
const partNames = [...loader.matchAll(/['"](v40-final\/payload\/part-[^'"]+?\.txt)(?:\?[^'"]*)?['"]/g)].map((match) => match[1]);
if (partNames.length !== 7) throw new Error(`Expected 7 payload parts, found ${partNames.length}`);

const encoded = (await Promise.all(partNames.map((name) => readFile(path.join(root, name), "utf8")))).join("");
const html = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
const required = [
  "show('estimate')",
  "systemCabinetMount",
  "system-cabinet-preview",
  "https://zzeeqwrndhpqdxyzpsqo.supabase.co/functions/v1/public-lead-api",
  "https://zzeeqwrndhpqdxyzpsqo.supabase.co/functions/v1/public-chat-api",
  "https://timchenko6.github.io/plapforma/client/",
  "https://t.me/uzelpro_bot",
];
for (const value of required) if (!html.includes(value)) throw new Error(`Missing release marker: ${value}`);

const forbidden = ["show('object')", "/api/lead.php", "/api/chat.php", "https://t.me/Timchenko_pro", "https://timchenko-cabinet.irongrip-pro.chatgpt.site", "data:image/"];
for (const value of forbidden) if (html.includes(value)) throw new Error(`Forbidden legacy marker: ${value}`);

const assetNames = [...new Set([...html.matchAll(/assets\/[A-Za-z0-9_./-]+/g)].map((match) => match[0]))];
for (const name of assetNames) await access(path.join(root, name));

const executableScripts = [...html.matchAll(/<script(?![^>]*type=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
for (const source of executableScripts) new Function(source);

for (const name of ["privacy.html", "consent.html", "security.html", "terms.html"]) await access(path.join(root, name));

console.log(JSON.stringify({
  ok: true,
  html_bytes: Buffer.byteLength(html),
  payload_bytes: Buffer.byteLength(encoded),
  referenced_assets: assetNames.length,
  executable_scripts: executableScripts.length,
}, null, 2));
