import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { buttonVariants } from "@/components/ui/button";
import { ph, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Производство узлов - Тимченко.про",
  description:
    "Собственное производство готовых инженерных узлов: сборка, опрессовка и контроль качества в цехе, а не на объекте.",
};

const principles = [
  {
    title: "Сборка в цехе",
    text: "Узел собирается на верстаке, в спокойных условиях, с нормальным инструментом. Не на коленке в котловане.",
  },
  {
    title: "Опрессовка до объекта",
    text: "Каждое изделие проходит испытание давлением ещё на производстве. На монтаж уезжает проверенный узел.",
  },
  {
    title: "Повторяемость",
    text: "Одинаковые узлы собираются по одной схеме. Качество не зависит от того, какая бригада сегодня на объекте.",
  },
  {
    title: "Быстрый монтаж",
    text: "На объекте готовый узел встаёт на место за часы, а не за дни. Меньше работ на стройке, меньше ошибок.",
  },
];

export default function ProductionPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div>
            <h1 className="font-display max-w-[18ch] text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
              Своё производство узлов
            </h1>
            <p className="mt-6 max-w-[50ch] text-lg text-mute">
              Главное отличие Тимченко.про: узлы ввода воды, обвязку котельных и коллекторные группы
              мы не собираем на объекте, а производим заранее.
            </p>
            <div className="mt-9">
              <Link href="/catalog/" className={cn(buttonVariants({ size: "lg" }))}>
                Смотреть каталог изделий
              </Link>
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-line">
            {/* TODO: заменить на фото производства заказчика */}
            <img
              src={ph("timchenko-production-shop", 1200, 900)}
              alt="Производство готовых инженерных узлов Тимченко.про"
              className="ph h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading title="Почему это важно для вашего дома" />
        <ul className="grid gap-x-16 gap-y-0 md:grid-cols-2">
          {principles.map((p) => (
            <li key={p.title} className="border-b border-line py-6">
              <p className="font-display text-lg font-medium">{p.title}</p>
              <p className="mt-2 max-w-[52ch] leading-relaxed text-mute">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="alt">
        <div className="grid gap-5 md:grid-cols-3">
          {["timchenko-shop-1", "timchenko-shop-2", "timchenko-shop-3"].map((seed) => (
            <div key={seed} className="aspect-[4/3] overflow-hidden rounded-md border border-line">
              {/* TODO: заменить на фото цеха и изделий */}
              <img src={ph(seed, 800, 600)} alt="" aria-hidden loading="lazy" className="ph h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </Section>

      <LeadSection topic="Готовый узел из каталога" />
    </>
  );
}
