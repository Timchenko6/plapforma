import { steps } from "@/data/steps";

/**
 * Полный цикл в 7 шагов: горизонтальная лента со scroll-snap.
 * Номера здесь семантические: порядок шагов и есть содержание секции.
 */
export function StepsStrip() {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
      {steps.map((step, i) => (
        <article
          key={step.name}
          className="w-[78vw] max-w-[320px] shrink-0 snap-start rounded-md border border-line bg-surface p-6 md:w-[300px]"
        >
          <p className="font-mono text-sm text-copper-soft">{i + 1}</p>
          <h3 className="font-display mt-4 text-lg leading-snug font-medium">{step.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-mute">{step.text}</p>
        </article>
      ))}
    </div>
  );
}
