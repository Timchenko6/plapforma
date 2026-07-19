import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { Founder } from "@/components/sections/founder";
import { StepsStrip } from "@/components/home/steps-strip";
import { Glossary } from "@/components/sections/glossary";
import { Brands } from "@/components/home/brands";
import { LeadSection } from "@/components/lead/lead-section";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "О компании - Тимченко.про",
  description:
    "Тимченко.про: 10 лет проектируем, производим и монтируем инженерные системы частных домов в Краснодарском крае. Без субподряда, с гарантией.",
};

const principles = [
  {
    t: "Полный цикл в одних руках",
    d: "Проект, производство узлов и монтаж делаем сами. Заказчик получает один договор и одного ответственного за весь дом.",
  },
  {
    t: "Инженер, а не менеджер",
    d: "Объект ведёт инженер, который понимает, как системы работают вместе. Решения принимаются по расчёту, а не по прайсу.",
  },
  {
    t: "Гарантия и сервис",
    d: "Гарантия от 2 лет и обслуживание после сдачи. Мы остаёмся на связи всё время, что дом живёт.",
  },
];

export default function CompanyPage() {
  return (
    <>
      <section className="bp-grid border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10 lg:py-28">
          <p className="font-mono text-xs tracking-[0.16em] text-copper-soft uppercase">
            о компании
          </p>
          <h1 className="font-display mt-4 max-w-[20ch] text-4xl leading-[1.08] font-semibold tracking-tight md:text-5xl">
            Инженерная компания полного цикла
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-mute">
            10 лет проектируем, производим узлы и монтируем инженерные системы частных домов в
            Краснодарском крае: {site.geo.join(", ")}. Работаем своими бригадами, без субподряда,
            поэтому отвечаем за результат целиком.
          </p>
        </div>
      </section>

      <Section>
        <SectionHeading title="Принципы, на которых мы работаем" />
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.t} className="rounded-sm border border-line bg-surface p-6">
              <p className="font-display font-medium">{p.t}</p>
              <p className="mt-3 text-sm leading-relaxed text-mute">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Founder />

      <Section tone="alt">
        <SectionHeading
          title="Как устроена работа над объектом"
          lead="Один график, один ответственный, семь шагов от первого выезда до сервиса."
        />
        <StepsStrip />
      </Section>

      <Glossary />

      <Section>
        <SectionHeading title="Оборудование, с которым работаем" />
        <Brands />
      </Section>

      <LeadSection />
    </>
  );
}
