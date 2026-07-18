import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { directions } from "@/data/directions";
import { projects } from "@/data/projects";
import { products, categories } from "@/data/products";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { QuizSlot } from "@/components/quiz-slot";
import { CaseCard, ProductCard } from "@/components/cards";
import { LeadButton } from "@/components/lead/lead-button";
import { ph } from "@/lib/utils";

export function generateStaticParams() {
  return directions.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = directions.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: `${d.name} - Тимченко.про`,
    description: d.short,
  };
}

// Направление → категория каталога с релевантными продуктами
const relatedCategory: Record<string, string> = {
  vodosnabzhenie: "uzly",
  kotelnye: "kotelnye",
  otoplenie: "kotelnye",
  elektrika: "avtomatika",
};

export default async function DirectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = directions.find((x) => x.slug === slug);
  if (!d) notFound();

  const cases = projects.filter((p) => p.systems.some((s) => s.toLowerCase().startsWith(d.name.slice(0, 6).toLowerCase()))).slice(0, 2);
  const catSlug = relatedCategory[d.slug];
  const related = catSlug ? products.filter((p) => p.category === catSlug).slice(0, 2) : [];
  const relatedCat = categories.find((c) => c.slug === catSlug);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
              {d.name}
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg text-mute">{d.short}</p>
            <div className="mt-9">
              <LeadButton topic={d.name} />
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-line">
            {/* TODO: заменить на фото работ заказчика по направлению */}
            <img src={ph(d.seed, 1100, 825)} alt={d.name} className="ph h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading title="Что входит" />
        <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
          {d.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 border-b border-line pb-4">
              <Check size={20} aria-hidden className="mt-1 shrink-0 text-copper-soft" />
              <span className="text-lg">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-[64ch] text-mute">{d.priceNote}</p>
      </Section>

      <Section tone="alt">
        <QuizSlot topic={d.name} />
      </Section>

      {related.length > 0 && relatedCat ? (
        <Section>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title="Готовые решения по направлению" className="mb-0 md:mb-0" />
            <Link
              href={`/catalog/${relatedCat.slug}/`}
              className="text-sm font-semibold text-copper-soft underline-offset-4 hover:underline"
            >
              Вся категория «{relatedCat.name}»
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:max-w-[860px]">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Section>
      ) : null}

      {cases.length > 0 ? (
        <Section tone="alt">
          <SectionHeading title="Объекты с этой системой" />
          <div className="grid gap-5 md:grid-cols-2">
            {cases.map((p) => (
              <CaseCard key={p.slug} project={p} large />
            ))}
          </div>
        </Section>
      ) : null}

      <LeadSection topic={d.name} />
    </>
  );
}
