import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { DirectionsList } from "@/components/home/directions-list";
import { StepsStrip } from "@/components/home/steps-strip";
import { ProductionFeature } from "@/components/home/production-feature";
import { CatalogTeaser } from "@/components/home/catalog-teaser";
import { Engineer } from "@/components/home/engineer";
import { Brands } from "@/components/home/brands";
import { CaseCard } from "@/components/cards";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Светлая версия главной (лаборатория) - Тимченко.про",
  description: "Кандидат светлой темы: галерейный фон с графитовыми якорь-секциями.",
  robots: { index: false },
};

/**
 * Превью светлой темы: та же главная, но в .theme-light.
 * Производство и футер намеренно остаются графитовыми (один осознанный
 * color-block на страницу + тёмный финал), чтобы бренд не растворялся.
 */
export default function LightHomeLab() {
  return (
    <div className="theme-light bg-bg text-ink">
      <Header />
      <main>
        <Hero />
        <Stats />

        <Section id="directions">
          <SectionHeading
            title="Семь направлений. Один договор"
            lead="Все инженерные системы дома проектирует и монтирует одна команда, поэтому они не мешают друг другу ни в проекте, ни на стройке."
          />
          <DirectionsList />
        </Section>

        <Section tone="alt">
          <SectionHeading
            title="Полный цикл за семь шагов"
            lead="От первого выезда до сервисного обслуживания вы общаетесь с одним инженером."
          />
          <StepsStrip />
        </Section>

        <div className="theme-dark bg-bg text-ink">
          <ProductionFeature />
        </div>

        <Section>
          <SectionHeading
            title="Готовые решения в каталоге"
            lead="Узлы, котельные и автоматика с понятным составом и ориентировочной стоимостью."
          />
          <CatalogTeaser />
        </Section>

        <Section tone="alt">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
            <SectionHeading
              title="Наши объекты"
              lead="Дома, в которых инженерия работает незаметно."
              className="mb-0 md:mb-0"
            />
            <Link
              href="/projects/"
              className="text-sm font-semibold text-copper-soft underline-offset-4 hover:underline"
            >
              Все проекты
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {projects.slice(0, 2).map((p) => (
              <CaseCard key={p.slug} project={p} large />
            ))}
          </div>
        </Section>

        <Section>
          <Engineer />
        </Section>

        <Section tone="alt" className="border-t border-line">
          <SectionHeading title="Работаем с оборудованием, которому доверяем" />
          <Brands />
        </Section>

        <LeadSection />
      </main>
      <div className="theme-dark bg-bg text-ink">
        <Footer />
      </div>
    </div>
  );
}
