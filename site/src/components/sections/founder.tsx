import { site } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { PhotoSlot } from "@/components/concept/photo-slot";

/** Об основателе + развёрнутые гарантии (brief-redesign §9). */
export function Founder() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <PhotoSlot caption="главный инженер · основатель · 10+ лет на объектах" aspect="aspect-[4/5]" className="max-w-[420px]" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">об основателе</p>
            <p className="font-display mt-5 max-w-[24ch] text-2xl leading-snug font-medium md:text-3xl">
              «Инженерные системы нельзя сдать и забыть: дом живёт годами. Поэтому мы остаёмся на
              связи после сдачи»
            </p>
            <p className="mt-6 max-w-[56ch] leading-relaxed text-mute">
              Компанию я строю вокруг простой идеи: за инженерию дома должен отвечать один человек,
              который видит все системы сразу. Мы проектируем, производим узлы и монтируем сами, без
              субподряда, поэтому отвечаем за результат целиком, а не за «свой кусок».
            </p>
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {site.guarantees.map((g) => (
                <li key={g.title} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-8">
                  <p className="font-display font-medium">{g.title}</p>
                  <p className="text-sm leading-relaxed text-mute">{g.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
