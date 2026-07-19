"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { steps } from "@/data/steps";
import { StepsStrip } from "@/components/home/steps-strip";
import { cn } from "@/lib/utils";

/**
 * Sticky-сторителлинг полного цикла (brief-redesign §8): секция «прилипает»,
 * шаги сменяются по мере скролла. GSAP + ScrollTrigger, pin по канону.
 * Мобильный и reduced-motion деградируют до горизонтальной ленты (StepsStrip).
 */
export function StepsSticky() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!desktop || !wrap.current) return;
    setEnabled(true);

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !wrap.current) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          ScrollTrigger.create({
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${steps.length * 60}%`,
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
              setActive(i);
            },
          });
        }, wrap);
      },
    );

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduce]);

  if (!enabled) {
    // Мобильный / reduced-motion: без пиннинга, привычная лента
    return (
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-28">
          <SectionTitle />
          <div className="mt-12">
            <StepsStrip />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="bp-grid relative min-h-[100dvh] border-b border-line">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col justify-center px-5 py-20 sm:px-10">
        <SectionTitle />
        <div className="mt-14 grid grid-cols-[auto_1fr] gap-x-12 gap-y-0">
          <ol className="flex flex-col gap-1">
            {steps.map((s, i) => (
              <li
                key={s.name}
                className={cn(
                  "flex items-baseline gap-4 py-2 transition-opacity duration-300",
                  i === active ? "opacity-100" : "opacity-35",
                )}
              >
                <span className="font-mono text-sm text-copper-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-medium">{s.name}</span>
              </li>
            ))}
          </ol>
          <div className="flex items-center border-l border-line pl-12">
            <div key={active} className="max-w-[40ch]">
              <p className="font-mono text-sm text-dim">
                шаг {active + 1} из {steps.length}
              </p>
              <p className="font-display mt-4 text-2xl leading-snug font-medium md:text-3xl">
                {steps[active].name}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-mute">{steps[active].text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle() {
  return (
    <div>
      <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">полный цикл</p>
      <h2 className="font-display mt-4 max-w-[22ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
        От выезда до сервиса за семь шагов
      </h2>
    </div>
  );
}
