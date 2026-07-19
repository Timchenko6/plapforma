import { Reveal } from "@/components/reveal";
import { Callout } from "@/components/concept/photo-slot";

/** Открытая смета: снимает страх скрытых доплат (brief-redesign §7, §9). */
export function OpenEstimate() {
  return (
    <section className="bp-grid border-b border-line bg-bg2">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">
              как мы считаем
            </p>
            <h2 className="font-display mt-4 max-w-[18ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
              Открытая смета до начала работ
            </h2>
            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-mute">
              «Скрытые доплаты» почти всегда рождаются из недосчитанного проекта: подрядчик берёт
              объект по заниженной смете, а потом добирает на «непредвиденном». Мы считаем иначе.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ol className="divide-y divide-line border-y border-line">
              {[
                {
                  n: "01",
                  t: "Проект до сметы",
                  d: "Сначала проект всех систем, потом расчёт по нему. Считаем то, что действительно будет смонтировано.",
                },
                {
                  n: "02",
                  t: "Смета зафиксирована в договоре",
                  d: "Цена работ закреплена до старта. Изменения возможны только по вашему решению об изменении объёма.",
                },
                {
                  n: "03",
                  t: "Материалы прозрачны",
                  d: "Оборудование и его стоимость понятны заранее. Никаких наценок «по факту».",
                },
                {
                  n: "04",
                  t: "Этапы и оплата по факту",
                  d: "Оплата идёт за выполненные этапы, а не авансом за весь объём вслепую.",
                },
              ].map((row) => (
                <li key={row.n} className="grid gap-2 py-5 sm:grid-cols-[auto_1fr] sm:gap-6">
                  <span className="font-mono text-sm text-copper-soft">{row.n}</span>
                  <div>
                    <p className="font-display font-medium">{row.t}</p>
                    <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-mute">{row.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8">
              <Callout label="итог: цена в договоре не растёт по ходу стройки" width={180} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
