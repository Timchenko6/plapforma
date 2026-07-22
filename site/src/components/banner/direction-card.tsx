"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DirIcon } from "./primitives";
import type { BannerDirection } from "@/data/banner";

/**
 * Карточка направления: линейная иконка и текст в цвете направления,
 * рамка «прочерчивается» цветом направления при наведении (tz-site §6,
 * SVG stroke-dashoffset — отсылка к чертежу).
 */
export function DirectionCard({ dir, index }: { dir: BannerDirection; index: number }) {
  const reduce = useReducedMotion();

  return (
    <Link
      href={`/uslugi/${dir.slug}/`}
      className="group relative block overflow-hidden rounded-[20px] bg-surface p-7 transition-colors duration-300"
      style={{ ["--dir" as string]: dir.color }}
    >
      {/* Базовая рамка + прочерчиваемая цветная рамка поверх */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] border border-line"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <motion.rect
          x="0.5"
          y="0.5"
          width="99.5%"
          height="99.5%"
          rx="20"
          fill="none"
          stroke={dir.color}
          strokeWidth="1.5"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }}
          whileHover={reduce ? undefined : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="relative flex items-start justify-between">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-[16px] border"
          style={{ borderColor: dir.color }}
        >
          <DirIcon name={dir.icon} color={dir.color} />
        </span>
        <ArrowUpRight
          size={22}
          aria-hidden
          className="text-mute transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          style={{ color: "var(--dir)" }}
        />
      </div>

      <h3 className="font-heavy mt-8 text-xl leading-tight font-extrabold tracking-tight uppercase">
        {dir.name}
      </h3>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">{dir.lead}</p>
      <span className="mt-6 inline-block font-plex text-xs tracking-[0.12em] uppercase" style={{ color: dir.color }}>
        {String(index + 1).padStart(2, "0")} · подробнее
      </span>
    </Link>
  );
}
