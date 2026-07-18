"use client";

import { useLead } from "@/components/lead/lead-provider";

/**
 * Слот под будущий квиз (design-direction.md §9).
 * Фаза 1: кнопка открывает заявку с предзаполненной темой.
 * Фаза 2: сюда монтируется квиз, вёрстка страниц не меняется.
 */
export function QuizSlot({ topic, title }: { topic: string; title?: string }) {
  const { openLead } = useLead();
  return (
    <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
      <p className="font-display text-lg font-medium">{title ?? "Подберём решение под ваш дом"}</p>
      <p className="mt-2 max-w-[52ch] text-mute">
        Ответьте на несколько вопросов, и инженер подготовит предварительный расчёт по направлению
        «{topic}».
      </p>
      <button
        onClick={() => openLead(topic)}
        className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-sm border border-copper px-6 text-sm font-semibold text-copper-soft transition-colors hover:bg-copper hover:text-copper-ink"
      >
        Подобрать по параметрам
      </button>
    </div>
  );
}
