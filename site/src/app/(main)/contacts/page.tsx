import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/section";
import { LeadForm } from "@/components/lead/lead-form";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Контакты - Тимченко.про",
  description: `Свяжитесь с инженером: телефон, Telegram, WhatsApp. Работаем: ${site.geo.join(", ")}.`,
};

export default function ContactsPage() {
  return (
    <Section>
      <SectionHeading title="Контакты" />
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-sm font-semibold text-dim">Телефон</p>
          <a
            href={site.phoneHref}
            className="mt-2 block font-display text-3xl font-medium hover:text-copper-soft"
          >
            {site.phone}
          </a>

          <p className="mt-10 text-sm font-semibold text-dim">Мессенджеры</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {site.messengers.map((m) => (
              <a
                key={m.name}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:border-copper hover:text-copper-soft"
              >
                {m.name}
              </a>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold text-dim">География работ</p>
          <p className="mt-2 max-w-[40ch] text-lg text-mute">{site.geo.join(", ")} и Краснодарский край.</p>

          <p className="mt-10 text-sm font-semibold text-dim">Реквизиты</p>
          <p className="mt-2 text-mute">{site.legal}</p>
        </div>

        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <p className="font-display text-xl font-medium">Заявка на просчёт</p>
          <p className="mt-2 mb-6 text-sm text-mute">
            Оставьте номер, инженер перезвонит в удобное время.
          </p>
          <LeadForm idPrefix="lead-contacts" />
        </div>
      </div>
    </Section>
  );
}
