"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { LeadButton } from "@/components/lead/lead-button";
import { Magnetic } from "./magnetic";
import { PhotoSlot, Callout } from "./photo-slot";
import { Counter } from "./counter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function Rise({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: 10, suffix: " лет", label: "проектируем и монтируем инженерные системы" },
  { value: 7, suffix: "", label: "направлений закрываем одним договором" },
  { value: 2, suffix: " года", label: "гарантии минимум, с сервисом после сдачи" },
  { value: null, text: "цех", label: "собираем и опрессовываем узлы до объекта" },
] as const;

export function ConceptHero() {
  return (
    <section className="bp-grid relative border-b border-line">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 pb-14 sm:px-10 lg:pt-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <Rise>
              <h1 className="font-display max-w-[21ch] text-[1.9rem] leading-[1.12] font-semibold tracking-tight sm:text-4xl lg:text-[2.9rem]">
                Инженерные системы дома под ключ.{" "}
                <span className="text-copper">Без переделок и скрытых доплат.</span>
              </h1>
            </Rise>
            <Rise delay={0.12}>
              <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-mute">
                Отопление, котельные, водоснабжение, канализация, электрика, вентиляция и
                кондиционирование от одной команды. Все системы проектирует один инженер, поэтому
                они не конфликтуют на стройке. Смета фиксируется в договоре до начала работ, а после
                сдачи у вашего дома остаётся один номер телефона на все вопросы.
              </p>
            </Rise>
            <Rise delay={0.22} className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <LeadButton />
              </Magnetic>
              <Link href="/projects/" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
                Смотреть проекты
              </Link>
            </Rise>
          </div>

          <Rise delay={0.18} className="relative">
            <Callout
              label="узел ввода · сборка и опрессовка в цехе"
              align="right"
              delay={0.7}
              className="absolute -top-1 right-0 z-10 hidden -translate-y-full pb-2 sm:flex"
            />
            <PhotoSlot caption="объект · Геленджик · 320 м² · отопление, вентиляция, электрика" />
          </Rise>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Rise key={s.label} delay={0.3 + i * 0.08}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-mono text-3xl font-medium text-copper md:text-4xl">
                {s.value === null ? s.text : (
                  <>
                    <Counter to={s.value} />
                    {s.suffix}
                  </>
                )}
              </dd>
              <p className="mt-2 max-w-[24ch] text-sm leading-relaxed text-mute">{s.label}</p>
            </Rise>
          ))}
        </dl>
      </div>
    </section>
  );
}
