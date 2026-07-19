"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { faq } from "@/data/faq";
import { cn } from "@/lib/utils";

/** Тёмный FAQ-аккордеон с плавным раскрытием (brief-redesign §10). */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <ul className="border-t border-line">
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left"
            >
              <span className="flex items-start gap-4">
                <span className="mt-1 font-mono text-xs text-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg leading-snug font-medium">{item.q}</span>
              </span>
              <Plus
                size={20}
                aria-hidden
                className={cn(
                  "mt-1 shrink-0 text-copper-soft transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[70ch] pt-1 pb-6 pl-9 text-mute">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
