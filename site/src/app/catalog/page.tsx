import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { CatalogTeaser } from "@/components/home/catalog-teaser";
import { LeadSection } from "@/components/lead/lead-section";
import { QuizSlot } from "@/components/quiz-slot";

export const metadata: Metadata = {
  title: "Каталог готовых решений - Тимченко.про",
  description:
    "Готовые узлы ввода воды, котельные и автоматика собственного производства. Состав, характеристики и ориентировочная стоимость.",
};

export default function CatalogPage() {
  return (
    <>
      <Section>
        <SectionHeading
          title="Каталог готовых решений"
          lead="Изделия нашего производства: собраны, опрессованы и готовы к монтажу. Стоимость ориентировочная, точную считаем под ваш объект."
        />
        <CatalogTeaser />
      </Section>
      <Section tone="alt">
        <QuizSlot
          topic="Готовый узел из каталога"
          title="Не знаете, какой узел подойдёт?"
        />
      </Section>
      <LeadSection topic="Готовый узел из каталога" />
    </>
  );
}
