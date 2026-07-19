"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { directions } from "@/data/directions";

/** Функциональная цветовая кодировка направлений (brief §4): метки-теги, не заливки. */
const tagColor: Record<string, string> = {
  vodosnabzhenie: "#7fa6c9",
  kanalizaciya: "#8b93a1",
  otoplenie: "#c97f72",
  kotelnye: "#b78566",
  elektrika: "#c9a85c",
  ventilyaciya: "#6fbfaf",
  kondicionirovanie: "#7fb6c9",
};

export function DirectionsGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <div className="mb-14">
          <h2 className="font-display max-w-[24ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
            Семь направлений. Один договор
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {directions.map((d, i) => (
            <motion.li
              key={d.slug}
              className={i < 3 ? "lg:col-span-4" : "lg:col-span-3"}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/services/${d.slug}/`}
                className="group flex h-full flex-col rounded-sm border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong"
              >
                <span
                  className="font-mono text-xs tracking-[0.14em] uppercase transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: tagColor[d.slug] }}
                >
                  {String(i + 1).padStart(2, "0")} · {d.name}
                </span>
                <p className="mt-4 grow text-sm leading-relaxed text-mute">{d.short}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-copper-soft">
                  Подробнее
                  <ArrowRight
                    size={15}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
