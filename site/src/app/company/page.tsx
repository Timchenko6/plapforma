import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { Engineer } from "@/components/home/engineer";
import { Brands } from "@/components/home/brands";
import { StepsStrip } from "@/components/home/steps-strip";
import { LeadSection } from "@/components/lead/lead-section";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "О компании - Тимченко.про",
  description:
    "Тимченко.про: 10 лет проектируем, производим и монтируем инженерные системы частных домов в Краснодарском крае. Без субподряда, с гарантией.",
};

export default function CompanyPage() {
  return (
    <>
      <Section>
        <SectionHeading
          title="Инженерная компания полного цикла"
          lead={`10 лет делаем инженерные системы частных домов: ${site.geo.join(", ")}. Проектируем, производим узлы, монтируем своими бригадами и обслуживаем после сдачи.`}
        />
        <Engineer />
      </Section>

      <Section tone="alt">
        <SectionHeading title="Как мы работаем" />
        <StepsStrip />
      </Section>

      <Section>
        <SectionHeading title="Оборудование, с которым работаем" />
        <Brands />
      </Section>

      <LeadSection />
    </>
  );
}
