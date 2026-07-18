import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRub(n: number): string {
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`;
}
