import { site } from "@/data/site";
import { ph } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

/** Персонификация инженера + гарантии (без карточек, через разделители). */
export function Engineer() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <Reveal>
        <div className="aspect-[4/5] max-w-[420px] overflow-hidden rounded-md border border-line">
          {/* TODO: заменить на портрет основателя */}
          <img
            src={ph("timchenko-engineer-portrait", 840, 1050)}
            alt="Основатель и главный инженер Тимченко.про"
            loading="lazy"
            className="ph h-full w-full object-cover"
          />
        </div>
        <p className="mt-5 font-display text-lg font-medium">Тимченко</p>
        <p className="mt-1 text-sm text-mute">Основатель и главный инженер, 10+ лет в инженерных системах</p>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="max-w-[56ch] text-lg leading-relaxed text-mute">
          «Инженерные системы нельзя сдать и забыть: дом живёт годами. Поэтому я строю компанию,
          которая проектирует, производит и монтирует сама, а после сдачи остаётся на связи».
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
  );
}
