import Link from "next/link";
import { ConceptHero } from "@/components/concept/concept-hero";
import { Manifesto } from "@/components/concept/manifesto";
import { DirectionsGrid } from "@/components/concept/directions-grid";
import { StepsSticky } from "@/components/sections/steps-sticky";
import { ProductionFeature } from "@/components/sections/production-feature";
import { OpenEstimate } from "@/components/sections/open-estimate";
import { Founder } from "@/components/sections/founder";
import { Professionals } from "@/components/sections/professionals";
import { Glossary } from "@/components/sections/glossary";
import { Faq } from "@/components/sections/faq";
import { CatalogTeaser } from "@/components/home/catalog-teaser";
import { Brands } from "@/components/home/brands";
import { CaseCard } from "@/components/cards";
import { Reveal } from "@/components/reveal";
import { LeadSection } from "@/components/lead/lead-section";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <>
      <ConceptHero />
      <Manifesto />
      <DirectionsGrid />
      <StepsSticky />
      <ProductionFeature />
      <OpenEstimate />

      {/* Каталог (лид) */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">каталог</p>
            <h2 className="font-display mt-4 max-w-[24ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
              Готовые решения нашего производства
            </h2>
          </Reveal>
          <div className="mt-12">
            <CatalogTeaser />
          </div>
        </div>
      </section>

      {/* Наши объекты */}
      <section className="border-b border-line bg-bg2">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">портфолио</p>
              <h2 className="font-display mt-4 max-w-[20ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
                Дома, в которых инженерия работает незаметно
              </h2>
            </Reveal>
            <Link
              href="/projects/"
              className="font-mono text-sm text-copper-soft underline-offset-4 hover:underline"
            >
              все проекты →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {projects.slice(0, 3).map((p) => (
              <CaseCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      <Founder />
      <Professionals />
      <Glossary />

      {/* Партнёры */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-28">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">оборудование</p>
            <h2 className="font-display mt-4 max-w-[26ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl">
              Работаем с брендами, которым доверяем
            </h2>
          </Reveal>
          <div className="mt-12">
            <Brands />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-line bg-bg2">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">вопросы</p>
              <h2 className="font-display mt-4 max-w-[16ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
                Что обычно спрашивают владельцы домов
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Faq />
            </Reveal>
          </div>
        </div>
      </section>

      <LeadSection />
    </>
  );
}
