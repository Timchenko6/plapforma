"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BadgePill } from "./primitives";
import { Magnetic } from "@/components/concept/magnetic";
import { LeadButton } from "@/components/lead/lead-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Hero в характере баннера: тяжёлый уппер-кейс, синяя «САНТЕХНИКА», лаймовая «ЭЛЕКТРИКА». */
export function BannerHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pt-14 pb-20 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20 lg:pb-28">
        <div>
          <motion.div {...rise(0)}>
            <BadgePill>под ключ</BadgePill>
          </motion.div>
          <motion.h1
            {...rise(0.08)}
            className="font-heavy mt-6 text-[clamp(2.4rem,7vw,5.4rem)] leading-[0.98] font-black tracking-[-0.02em] uppercase"
          >
            Монтаж
            <br />
            инженерных
            <br />
            систем
          </motion.h1>
          <motion.p
            {...rise(0.16)}
            className="font-heavy mt-5 text-[clamp(1.1rem,2.4vw,1.9rem)] leading-tight font-extrabold tracking-tight uppercase"
          >
            <span style={{ color: "var(--blue)" }}>Сантехника</span>
            <span className="text-mute"> · </span>
            <span style={{ color: "var(--lime-bright)" }}>Электрика</span>
            <span className="text-mute"> · </span>
            <span className="text-white">Отопление</span>
            <span className="text-mute"> · </span>
            <span className="text-white">Вентиляция</span>
          </motion.p>
          <motion.p {...rise(0.22)} className="mt-7 max-w-[52ch] text-lg leading-relaxed text-mute">
            Полный цикл инженерии частного дома: проект, собственное производство узлов, монтаж
            своими бригадами и сервис после сдачи. Один подрядчик и один номер телефона на весь
            объект.
          </motion.p>
          <motion.div {...rise(0.3)} className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <LeadButton>Рассчитать стоимость</LeadButton>
            </Magnetic>
            <Link href="/raboty/" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              Смотреть работы
            </Link>
          </motion.div>
        </div>

        <motion.div
          {...(reduce
            ? {}
            : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, delay: 0.2, ease: EASE } })}
          className="relative"
        >
          <div className="rifle relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[16px]">
            <span className="font-plex text-xs tracking-[0.2em] text-dim uppercase">
              фото узла на пластине
            </span>
            {/* Моно-выноска поверх пластины */}
            <span
              className="absolute bottom-5 left-5 font-plex text-xs tracking-[0.12em] uppercase"
              style={{ color: "var(--lime-bright)" }}
            >
              узел ввода · сборка в цехе
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
