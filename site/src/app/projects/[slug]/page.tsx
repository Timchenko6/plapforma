import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { Section, SectionHeading } from "@/components/section";
import { CaseCard } from "@/components/cards";
import { LeadSection } from "@/components/lead/lead-section";
import { ph } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.name} - проекты Тимченко.про`, description: p.text };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();

  const others = projects.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <Section>
        <nav aria-label="Хлебные крошки" className="mb-10 text-sm text-dim">
          <Link href="/projects/" className="hover:text-mute">
            Проекты
          </Link>
        </nav>
        <h1 className="font-display max-w-[24ch] text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
          {p.name}
        </h1>
        <dl className="mt-8 grid max-w-[720px] grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
          <div>
            <dt className="text-sm text-dim">Город</dt>
            <dd className="mt-1 font-mono">{p.city}</dd>
          </div>
          <div>
            <dt className="text-sm text-dim">Площадь</dt>
            <dd className="mt-1 font-mono">{p.area}</dd>
          </div>
          <div>
            <dt className="text-sm text-dim">Срок</dt>
            <dd className="mt-1 font-mono">{p.term}</dd>
          </div>
          <div>
            <dt className="text-sm text-dim">Систем</dt>
            <dd className="mt-1 font-mono">{p.systems.length}</dd>
          </div>
        </dl>
        <div className="mt-12 aspect-[16/8] overflow-hidden rounded-md border border-line">
          {/* TODO: заменить на фото объекта */}
          <img src={ph(p.seed, 1600, 800)} alt={p.name} className="ph h-full w-full object-cover" />
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <p className="max-w-[64ch] text-lg leading-relaxed text-mute">{p.text}</p>
          <div>
            <p className="text-sm font-semibold text-dim">Системы на объекте</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.systems.map((s) => (
                <li key={s} className="rounded-sm border border-line-strong px-3 py-1.5 text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[`${p.seed}-a`, `${p.seed}-b`].map((seed) => (
            <div key={seed} className="aspect-[4/3] overflow-hidden rounded-md border border-line">
              {/* TODO: заменить на фото объекта */}
              <img src={ph(seed, 900, 680)} alt="" aria-hidden loading="lazy" className="ph h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading title="Другие объекты" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <CaseCard key={o.slug} project={o} />
          ))}
        </div>
      </Section>

      <LeadSection />
    </>
  );
}
