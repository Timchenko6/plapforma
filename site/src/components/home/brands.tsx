import { brands } from "@/data/brands";

/** Бренды-партнёры. TODO: заменить текстовые марки на SVG-логотипы (lunda.ru). */
export function Brands() {
  return (
    <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
      {brands.map((b) => (
        <span
          key={b}
          className="font-display text-lg font-medium text-dim transition-colors hover:text-mute"
        >
          {b}
        </span>
      ))}
    </div>
  );
}
