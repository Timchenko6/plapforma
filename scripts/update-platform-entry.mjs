#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync, gzipSync } from "node:zlib";
import path from "node:path";

const names = [
  "part-1.txt",
  "part-2a.txt",
  "part-2b.txt",
  "part-2c.txt",
  "part-3a.txt",
  "part-3b.txt",
  "part-3c.txt",
];
const outputDir = path.resolve("v40-final/payload");
const encoded = (await Promise.all(names.map((name) => readFile(path.join(outputDir, name), "utf8")))).join("");
let html = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");

const replacements = [
  ["Telegram Mini App · готово", "TIMCHENKO PLATFORM · единый кабинет"],
  ["<h3 id=\"cabinetModalTitle\">Личный кабинет заказчика</h3>", "<h3 id=\"cabinetModalTitle\">Единая платформа объекта</h3>"],
  ["Рабочая версия уже собрана в том же тёмно-синем дизайне, который показан на первом экране сайта.", "Один вход для владельца и заказчика. Платформа автоматически открывает нужный режим по роли пользователя."],
  ["<div><b>Смета</b><br>Работы и оборудование разложены по этапам и системам.</div>", "<div><b>Владелец</b><br>Воронка, заявки, клиенты и управление всеми объектами.</div>"],
  ["<div><b>Фото</b><br>Скрытые работы открываются крупно с датой и комментарием инженера.</div>", "<div><b>Заказчик</b><br>Свой объект, этапы, сметы, документы и фотоотчёты.</div>"],
  ["<div><b>Этапы</b><br>Видно, что готово, что идёт сейчас и что будет дальше.</div>", "<div><b>Core v2</b><br>Системы, работы, материалы, закупки и история объекта.</div>"],
  ["https://timchenko-cabinet.irongrip-pro.chatgpt.site", "https://timchenko6.github.io/plapforma/client/"],
  ["<p style=\"margin:12px 0 0\"><b>В Telegram</b> этот же интерфейс откроется после привязки адреса приложения к вашему боту.</p>", "<p style=\"margin:12px 0 0\"><b>Вход через Telegram</b> безопасно определяет владельца или клиента и сохраняет доступ в браузере.</p>"],
];

for (const [from, to] of replacements) {
  if (!html.includes(from) && !html.includes(to)) throw new Error(`Payload marker not found: ${from}`);
  html = html.replaceAll(from, to);
}

const nextEncoded = gzipSync(Buffer.from(html, "utf8"), { level: 9, mtime: 0 }).toString("base64");
const chunkSize = Math.ceil(nextEncoded.length / names.length / 4) * 4;
for (const [index, name] of names.entries()) {
  await writeFile(path.join(outputDir, name), nextEncoded.slice(index * chunkSize, (index + 1) * chunkSize), "utf8");
}

console.log(JSON.stringify({ ok: true, html_bytes: Buffer.byteLength(html), payload_bytes: nextEncoded.length }, null, 2));
