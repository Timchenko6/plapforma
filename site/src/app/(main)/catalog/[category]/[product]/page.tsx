import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, products } from "@/data/products";
import { Section, SectionHeading } from "@/components/section";
import { ProductCard } from "@/components/cards";
import { LeadSection } from "@/components/lead/lead-section";
import { LeadButton } from "@/components/lead/lead-button";
import { ph } from "@/lib/utils";

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, product: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}): Promise<Metadata> {
  const { product } = await params;
  const p = products.find((x) => x.slug === product);
  if (!p) return {};
  return { title: `${p.name} - Тимченко.про`, description: p.short };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category, product } = await params;
  const p = products.find((x) => x.slug === product && x.category === category);
  if (!p) notFound();

  const cat = categories.find((c) => c.slug === p.category)!;
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <Section>
        <nav aria-label="Хлебные крошки" className="mb-10 text-sm text-dim">
          <Link href="/catalog/" className="hover:text-mute">
            Каталог
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/catalog/${cat.slug}/`} className="hover:text-mute">
            {cat.name}
          </Link>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-line">
            {/* TODO: заменить на фото/рендер изделия */}
            <img src={ph(p.seed, 1200, 900)} alt={p.name} className="ph h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-3xl leading-[1.15] font-semibold tracking-tight md:text-4xl">
              {p.name}
            </h1>
            <p className="mt-5 text-lg text-mute">{p.short}</p>
            <p className="mt-7 font-mono text-2xl font-medium text-copper-soft">{p.price}</p>
            <p className="mt-2 text-sm text-dim">
              Стоимость ориентировочная, точную зафиксируем в договоре после уточнения объекта.
            </p>
            <div className="mt-8">
              <LeadButton topic={p.name}>Получить просчёт</LeadButton>
            </div>
            <div className="mt-10">
              <p className="text-sm font-semibold text-dim">Кому подходит</p>
              <p className="mt-2 max-w-[52ch] text-mute">{p.forWhom}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading title="Состав и характеристики" />
        <dl className="grid gap-x-16 gap-y-0 md:max-w-[820px]">
          {p.specs.map((s) => (
            <div
              key={s.label}
              className="grid grid-cols-[1fr_auto] items-baseline gap-6 border-b border-line py-4"
            >
              <dt className="text-mute">{s.label}</dt>
              <dd className="font-mono text-sm">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {related.length > 0 ? (
        <Section>
          <SectionHeading title="Ещё в этой категории" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ProductCard key={r.slug} product={r} />
            ))}
          </div>
        </Section>
      ) : null}

      <LeadSection topic={p.name} />
    </>
  );
}
