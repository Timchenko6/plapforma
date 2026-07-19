import { Reveal } from "@/components/reveal";
import { LeadButton } from "@/components/lead/lead-button";

/** Раздел для профессионалов: B2B под дизайнеров, архитекторов, прорабов (brief-redesign §7, §9). */
export function Professionals() {
  const cards = [
    {
      who: "Дизайнерам и архитекторам",
      text: "Берём на себя инженерную часть проекта: считаем системы под вашу планировку так, чтобы они не спорили с интерьером. Трассы и оборудование прячутся, идея сохраняется.",
    },
    {
      who: "Прорабам и застройщикам",
      text: "Готовые узлы под ваши объекты и монтаж по нормам. Один субподрядчик на всю инженерию вместо пяти: меньше стыковок, единая ответственность, предсказуемый график.",
    },
    {
      who: "Бригадам",
      text: "Поставляем собранные и опрессованные узлы под монтаж. Вы ставите готовое проверенное изделие, а не собираете обвязку на объекте.",
    },
  ];

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">b2b</p>
          <h2 className="font-display mt-4 max-w-[24ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
            Для дизайнеров, архитекторов и прорабов
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.who} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-sm border border-line bg-surface p-6">
                <p className="font-mono text-xs tracking-[0.14em] text-copper-soft uppercase">
                  {c.who}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-mute">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} className="mt-10">
          <LeadButton topic="Сотрудничество (профессионалам)">Обсудить сотрудничество</LeadButton>
        </Reveal>
      </div>
    </section>
  );
}
