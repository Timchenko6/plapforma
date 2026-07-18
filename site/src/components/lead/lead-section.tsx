import { site } from "@/data/site";
import { LeadForm } from "./lead-form";

/** Финальная секция каждой страницы: заявка + мессенджеры (единый интент). */
export function LeadSection({ topic }: { topic?: string }) {
  return (
    <section id="request" className="border-t border-line bg-bg2">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:gap-20 md:py-28">
        <div>
          <h2 className="font-display max-w-[20ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl">
            Рассчитаем ваш дом
          </h2>
          <p className="mt-5 max-w-[48ch] text-lg text-mute">
            Оставьте номер, и инженер перезвонит в удобное время: обсудим задачу и подготовим
            предварительный просчёт.
          </p>
          <a
            href={site.phoneHref}
            className="mt-8 block font-display text-2xl font-medium hover:text-copper-soft"
          >
            {site.phone}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            {site.messengers.map((m) => (
              <a
                key={m.name}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-copper hover:text-copper-soft"
              >
                {m.name}
              </a>
            ))}
          </div>
          <p className="mt-10 text-sm text-dim">Работаем: {site.geo.join(", ")}</p>
        </div>
        <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
          <LeadForm defaultTopic={topic} idPrefix="lead-page" />
        </div>
      </div>
    </section>
  );
}
