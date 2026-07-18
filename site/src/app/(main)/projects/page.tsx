import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { Section, SectionHeading } from "@/components/section";
import { CaseCard } from "@/components/cards";
import { LeadSection } from "@/components/lead/lead-section";

export const metadata: Metadata = {
  title: "Проекты - Тимченко.про",
  description:
    "Реализованные объекты: частные дома Краснодара, Сочи, Геленджика и Абрау-Дюрсо с инженерными системами под ключ.",
};

export default function ProjectsPage() {
  return (
    <>
      <Section>
        <SectionHeading
          title="Наши объекты"
          lead="Дома, в которых мы делали инженерию под ключ или отдельные системы. У каждого объекта: площадь, состав систем и сроки."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <CaseCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>
      <LeadSection />
    </>
  );
}
