import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, products } from "@/data/products";
import { Section, SectionHeading } from "@/components/section";
import { ProductCard } from "@/components/cards";
import { LeadSection } from "@/components/lead/lead-section";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = categories.find((x) => x.slug === category);
  if (!c) return {};
  return { title: `${c.name} - каталог Тимченко.про`, description: c.short };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = categories.find((x) => x.slug === category);
  if (!c) notFound();

  const items = products.filter((p) => p.category === c.slug);

  return (
    <>
      <Section>
        <SectionHeading title={c.name} lead={c.short} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <p className="mt-10 max-w-[64ch] text-mute">
          Не нашли подходящее решение? Соберём узел под ваш объект: состав и стоимость посчитает
          инженер после замера.
        </p>
      </Section>
      <LeadSection topic={c.name} />
    </>
  );
}
