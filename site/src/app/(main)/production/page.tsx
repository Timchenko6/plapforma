import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoSlot, Callout } from "@/components/concept/photo-slot";

export const metadata: Metadata = {
  title: "Производство узлов - Тимченко.про",
  description:
    "Собственное производство готовых инженерных узлов: сборка, опрессовка и контроль качества в цехе, а не на объекте.",
};

const principles = [
  {
    title: "Сборка в цехе",
    text: "Узел собирается на верстаке, в спокойных условиях, с нормальным инструментом, а не на коленке в котловане под дождём. Аккуратность сборки напрямую переходит в надёжность соединений.",
  },
  {
    title: "Опрессовка до объекта",
    text: "Каждое изделие проходит испытание давлением выше рабочего ещё на производстве. Слабое соединение вскрывается в цехе, а не за подшитым потолком через полгода.",
  },
  {
    title: "Повторяемое качество",
    text: "Одинаковые узлы собираются по одной отработанной схеме. Результат не зависит от того, какая бригада сегодня на объекте и какое у неё настроение.",
  },
  {
    title: "Быстрый монтаж",
    text: "На объекте готовый узел встаёт на место за часы, а не за дни. Меньше работ на стройке — меньше поводов для ошибок и меньше времени до запуска.",
  },
  {
    title: "Цена известна заранее",
    text: "Состав узла и его стоимость определены до монтажа. Никаких «докупить по ходу»: смета на изделие закрыта ещё в цехе.",
  },
  {
    title: "Контроль на каждом этапе",
    text: "Сборку и опрессовку ведёт и принимает инженер. Узел не уезжает на объект, пока не пройдёт проверку.",
  },
];

export default function ProductionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bp-grid border-b border-line">
        <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-copper-soft uppercase">
              ключевое отличие
            </p>
            <h1 className="font-display mt-4 max-w-[18ch] text-4xl leading-[1.08] font-semibold tracking-tight md:text-5xl">
              Своё производство узлов
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-mute">
              Узлы ввода воды, обвязку котельных и коллекторные группы мы не собираем на объекте, а
              производим заранее. Коллекторный узел — это собранный блок, где сведены фильтрация,
              распределение, учёт и защита; от того, как он собран, зависит вся система.
            </p>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-mute">
              Полевой монтаж всегда компромисс: теснота, погода, спешка. Цех убирает эти переменные
              и превращает сборку узла в предсказуемый повторяемый процесс.
            </p>
            <div className="mt-9">
              <Link href="/catalog/" className={cn(buttonVariants({ size: "lg" }))}>
                Смотреть каталог изделий
              </Link>
            </div>
          </div>
          <div className="relative">
            <Callout
              label="узел ввода · опрессовка 6 бар · маркировка"
              align="right"
              delay={0.5}
              className="absolute -top-1 right-0 z-10 hidden -translate-y-full pb-2 sm:flex"
            />
            <PhotoSlot caption="цех · сборка коллекторного узла" aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* Принципы */}
      <Section>
        <SectionHeading
          title="Почему сборка в цехе надёжнее полевого монтажа"
          lead="Шесть причин, по которым готовый узел с производства служит дольше собранного на объекте."
        />
        <ul className="grid gap-x-16 gap-y-0 md:grid-cols-2">
          {principles.map((p, i) => (
            <li key={p.title} className="flex gap-5 border-b border-line py-6">
              <span className="font-mono text-sm text-copper-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-display text-lg font-medium">{p.title}</p>
                <p className="mt-2 max-w-[52ch] leading-relaxed text-mute">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Галерея цеха */}
      <Section tone="alt">
        <SectionHeading title="Как это выглядит" />
        <div className="grid gap-5 md:grid-cols-3">
          <PhotoSlot caption="верстак · сборка обвязки" aspect="aspect-[4/3]" />
          <PhotoSlot caption="опрессовка · испытание давлением" aspect="aspect-[4/3]" />
          <PhotoSlot caption="готовый узел · маркировка перед отгрузкой" aspect="aspect-[4/3]" />
        </div>
      </Section>

      <LeadSection topic="Готовый узел из каталога" />
    </>
  );
}
