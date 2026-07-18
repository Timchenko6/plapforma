import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Фото-плейсхолдер до получения фото объектов заказчика.
 * Файлы лежат в public/ph (скачаны с picsum по seed): по одному на seed,
 * в альбомной (l) или портретной (p) ориентации. Замена на реальные фото:
 * положить файл с тем же именем.
 */
export function ph(seed: string, w: number, h: number) {
  const orientation = h / w > 1.15 ? "p" : "l";
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/ph/${seed}-${orientation}.jpg`;
}
