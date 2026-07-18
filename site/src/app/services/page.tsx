import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { directions } from "@/data/directions";
import { Section, SectionHeading } from "@/components/section";
import { LeadSection } from "@/components/lead/lead-section";
import { ph } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Направления - Тимченко.про",
  description:
    "Инженерные системы частных домов под ключ: водоснабжение, канализация, отопление, котельные, электрика, вентиляция, кондиционирование.",
};

export default function ServicesPage() {
  return (
    <>
      <Section>
        <SectionHeading
          title="Направления"
          lead="Каждую систему можно заказать отдельно, но сильнее всего мы в комплексе: один проект, одна команда, один договор на весь дом."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {directions.map((d) => (
            <Link
              key={d.slug}
              href={`/services/${d.slug}/`}
              className="group grid overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong sm:grid-cols-[200px_1fr]"
            >
              <div className="hidden overflow-hidden sm:block">
                {/* TODO: заменить на фото работ заказчика */}
                <img
                  src={ph(d.seed, 400, 420)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="ph h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col justify-center p-6">
                <p className="font-display text-xl font-medium">{d.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-mute">{d.short}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper-soft">
                  Подробнее
                  <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <LeadSection />
    </>
  );
}
