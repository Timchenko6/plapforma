import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Warning } from "@phosphor-icons/react/dist/ssr";
import { directions } from "@/data/directions";
import { projects } from "@/data/projects";
import { products, categories } from "@/data/products";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { QuizSlot } from "@/components/quiz-slot";
import { CaseCard, ProductCard } from "@/components/cards";
import { LeadButton } from "@/components/lead/lead-button";
import { PhotoSlot, Callout } from "@/components/concept/photo-slot";

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
  return { title: `${d.name} - Тимченко.про`, description: d.short };
}

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

  const idx = directions.findIndex((x) => x.slug === d.slug);
  const cases = projects
    .filter((p) => p.systems.some((s) => s.toLowerCase().startsWith(d.name.slice(0, 6).toLowerCase())))
    .slice(0, 2);
  const catSlug = relatedCategory[d.slug];
  const related = catSlug ? products.filter((p) => p.category === catSlug).slice(0, 2) : [];
  const relatedCat = categories.find((c) => c.slug === catSlug);

  return (
    <>
      {/* Hero */}
      <section className="bp-grid border-b border-line">
        <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] uppercase" style={{ color: d.tag }}>
              {String(idx + 1).padStart(2, "0")} · направление
            </p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] font-semibold tracking-tight md:text-5xl">
              {d.name}
            </h1>
            {d.intro.map((p, i) => (
              <p key={i} className="mt-6 max-w-[54ch] text-lg leading-relaxed text-mute">
                {p}
              </p>
            ))}
            <div className="mt-9">
              <LeadButton topic={d.name} />
            </div>
          </div>
          <div className="relative">
            <Callout
              label={`${d.name.toLowerCase()} · проект и монтаж`}
              align="right"
              delay={0.5}
              className="absolute -top-1 right-0 z-10 hidden -translate-y-full pb-2 sm:flex"
            />
            <PhotoSlot caption={`объект · ${d.name.toLowerCase()} под ключ`} aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* Что входит */}
      <Section>
        <SectionHeading title="Что входит в систему" />
        <ul className="grid gap-x-12 gap-y-0 md:grid-cols-2">
          {d.includes.map((item) => (
            <li key={item} className="flex items-start gap-3 border-b border-line py-4">
              <Check size={20} aria-hidden className="mt-0.5 shrink-0 text-copper-soft" />
              <span className="text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Из чего складывается качество */}
      <Section tone="alt">
        <SectionHeading title="Из чего складывается качество" />
        <div className="grid gap-4 md:grid-cols-3">
          {d.quality.map((q) => (
            <div key={q.title} className="rounded-sm border border-line bg-surface p-6">
              <p className="font-display font-medium">{q.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-mute">{q.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Типовые ошибки */}
      <Section>
        <SectionHeading
          title="Типовые ошибки, которых мы избегаем"
          lead="То, что на монтаже определяют «на глаз», позже оборачивается переделками. Мы решаем это на проекте."
        />
        <ul className="divide-y divide-line border-y border-line">
          {d.mistakes.map((m) => (
            <li key={m} className="flex items-start gap-4 py-5">
              <Warning size={20} aria-hidden className="mt-0.5 shrink-0 text-copper-soft" />
              <span className="max-w-[80ch] text-mute">{m}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-[70ch] rounded-sm border border-line bg-surface p-6">
          <p className="font-mono text-xs tracking-[0.14em] text-dim uppercase">на выходе</p>
          <p className="mt-3 text-lg leading-relaxed">{d.result}</p>
        </div>
        <p className="mt-8 max-w-[64ch] text-sm text-mute">{d.priceNote}</p>
      </Section>

      {/* Слот квиза */}
      <Section tone="alt">
        <QuizSlot topic={d.name} />
      </Section>

      {related.length > 0 && relatedCat ? (
        <Section>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title="Готовые решения по направлению" className="mb-0 md:mb-0" />
            <Link
              href={`/catalog/${relatedCat.slug}/`}
              className="font-mono text-sm text-copper-soft underline-offset-4 hover:underline"
            >
              вся категория «{relatedCat.name}» →
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
