"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Слот под реальное фото (brief §6): тёмная рамка с чертёжной сеткой,
 * координатные насечки по углам и моно-подпись. Реальный снимок вставляется
 * заменой содержимого без переверстки.
 */
export function PhotoSlot({
  caption,
  aspect = "aspect-[4/5]",
  className,
}: {
  caption: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "bp-grid relative overflow-hidden rounded-sm border border-line bg-surface",
          aspect,
        )}
      >
        {/* Угловые насечки */}
        {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map(
          (pos) => (
            <span key={pos} aria-hidden className={cn("absolute h-4 w-4 border-line-strong", pos)} />
          ),
        )}
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest text-dim uppercase">
          фото объекта
        </span>
      </div>
      <figcaption className="mt-3 font-mono text-xs text-mute">{caption}</figcaption>
    </figure>
  );
}

/**
 * Рисующаяся чертёжная выноска (brief §8): линия с насечками прочерчивается
 * при входе в вьюпорт, моно-подпись проявляется следом.
 */
export function Callout({
  label,
  width = 150,
  delay = 0,
  align = "left",
  className,
}: {
  label: string;
  width?: number;
  delay?: number;
  align?: "left" | "right";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: { once: true },
        transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "right" && "flex-row-reverse text-right",
        className,
      )}
    >
      <svg width={width} height="12" aria-hidden className="shrink-0 overflow-visible">
        <motion.line x1="0" y1="6" x2={width} y2="6" stroke="rgba(255,255,255,.4)" strokeWidth="1" {...draw} />
        <motion.line x1="0.5" y1="0" x2="0.5" y2="12" stroke="rgba(255,255,255,.4)" strokeWidth="1" {...draw} />
        <motion.line
          x1={width - 0.5}
          y1="0"
          x2={width - 0.5}
          y2="12"
          stroke="rgba(255,255,255,.4)"
          strokeWidth="1"
          {...draw}
        />
      </svg>
      <motion.span
        className="font-mono text-xs whitespace-nowrap text-mute"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: delay + 0.6 }}
      >
        {label}
      </motion.span>
    </div>
  );
}
