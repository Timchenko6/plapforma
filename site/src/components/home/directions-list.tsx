"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { directions } from "@/data/directions";
import { ph } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Интерактивный список направлений: строки слева, фото активного
 * направления справа (не «7 одинаковых карточек»).
 */
export function DirectionsList() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <ul>
        {directions.map((d, i) => (
          <li key={d.slug}>
            <Link
              href={`/services/${d.slug}/`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={cn(
                "group flex items-center justify-between gap-4 border-b border-line py-5 transition-colors md:py-6",
                i === 0 && "border-t",
              )}
            >
              <div>
                <span
                  className={cn(
                    "font-display text-xl font-medium transition-colors md:text-2xl",
                    active === i ? "text-copper-soft" : "text-ink",
                  )}
                >
                  {d.name}
                </span>
                <p className="mt-1 max-w-[52ch] text-sm text-mute lg:hidden">{d.short}</p>
              </div>
              <ArrowRight
                size={22}
                aria-hidden
                className={cn(
                  "shrink-0 transition-all",
                  active === i ? "translate-x-0 text-copper-soft opacity-100" : "-translate-x-2 text-dim opacity-40",
                )}
              />
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-md border border-line">
          <div className="relative aspect-[4/3]">
            {directions.map((d, i) => (
              // TODO: заменить на фото работ заказчика по направлению
              <img
                key={d.slug}
                src={ph(d.seed, 1000, 750)}
                alt=""
                aria-hidden
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "ph absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  active === i ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>
          <div className="border-t border-line bg-surface px-6 py-5">
            <p className="text-sm leading-relaxed text-mute">{directions[active].short}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
