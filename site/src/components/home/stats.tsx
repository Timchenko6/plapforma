import { site } from "@/data/site";
import { Reveal } from "@/components/reveal";

/** Строка display-цифр без карточек (design-direction.md §5.2). */
export function Stats() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-8 gap-y-10 px-5 py-14 sm:px-8 md:grid-cols-4 md:py-16">
        {site.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <p className="font-display text-4xl font-semibold text-copper md:text-5xl">{s.value}</p>
            <p className="mt-3 max-w-[20ch] text-sm leading-relaxed text-mute">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
