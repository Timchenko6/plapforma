import type { Metadata } from "next";
import Link from "next/link";
import { Check, MapPin } from "@phosphor-icons/react/dist/ssr";
import { BannerHero } from "@/components/banner/banner-hero";
import { DirectionCard } from "@/components/banner/direction-card";
import { BadgePill, MicroLabel, SectionDivider } from "@/components/banner/primitives";
import { Counter } from "@/components/concept/counter";
import { Reveal } from "@/components/reveal";
import { Faq } from "@/components/sections/faq";
import { LeadSection } from "@/components/lead/lead-section";
import { Brands } from "@/components/home/brands";
import { bannerDirections, whyUs, trust, bannerContact } from "@/data/banner";
import { steps } from "@/data/steps";
import { projects } from "@/data/projects";
import { categories } from "@/data/products";
import { ph } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Баннер-концепт: чёрное поле, лайм, синий - Тимченко.про",
  description: "Концепт главной в фирменном коде баннера. На согласование тона.",
  robots: { index: false },
};

const nav = [
  { href: "/uslugi/vodosnabzhenie/", label: "Услуги" },
  { href: "/katalog/", label: "Каталог" },
  { href: "/raboty/", label: "Работы" },
  { href: "/o-kompanii/", label: "О компании" },
  { href: "/kontakty/", label: "Контакты" },
];

export default function BannerConcept() {
  return (
    <div className="theme-banner min-h-[100dvh] bg-bg text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-10">
          <Link href="/" className="font-heavy text-lg font-black tracking-tight uppercase">
            Тимченко<span style={{ color: "var(--lime)" }}>.</span>про
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="font-plex text-xs tracking-[0.1em] text-mute uppercase transition-colors hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <a href={bannerContact.phoneHref} className="hidden font-plex text-sm font-medium sm:block">
            {bannerContact.phone}
          </a>
        </div>
      </header>

      <BannerHero />
      <SectionDivider />

      {/* Лента доверия */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {trust.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.06}>
              <p className="font-plex text-4xl font-semibold md:text-5xl" style={{ color: "var(--lime-bright)" }}>
                {t.value === null ? t.text : (<><Counter to={t.value} />{t.suffix}</>)}
              </p>
              <p className="mt-2 max-w-[22ch] text-sm text-mute">{t.label}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <SectionDivider />

      {/* Направления */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <MicroLabel>направления</MicroLabel>
          <h2 className="font-heavy mt-4 max-w-[20ch] text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
            Четыре системы. Один подрядчик
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {bannerDirections.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 2) * 0.08}>
              <DirectionCard dir={d} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
      <SectionDivider />

      {/* Позиционирование */}
      <section className="mx-auto max-w-[1440px] px-5 py-28 sm:px-10 md:py-40">
        <Reveal>
          <p className="font-heavy mx-auto max-w-[20ch] text-center text-[clamp(1.6rem,4vw,3.4rem)] leading-[1.08] font-black tracking-[-0.01em] uppercase">
            Вся инженерия вашего дома{" "}
            <span style={{ color: "var(--lime-bright)" }}>в одних руках</span>. Один подрядчик. Один
            номер телефона. Никакой головной боли.
          </p>
        </Reveal>
      </section>
      <SectionDivider />

      {/* Почему мы */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <MicroLabel>почему мы</MicroLabel>
          <h2 className="font-heavy mt-4 max-w-[16ch] text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
            Качество и надёжность
          </h2>
        </Reveal>
        <Reveal>
          <ul className="mt-12 grid gap-x-12 gap-y-0 md:grid-cols-2">
            {whyUs.map((w) => (
              <li key={w.title} className="flex gap-4 border-b border-line py-6">
                <Check size={22} aria-hidden style={{ color: "var(--lime-bright)" }} className="mt-1 shrink-0" />
                <div>
                  <p className="font-heavy text-lg font-extrabold tracking-tight uppercase">{w.title}</p>
                  <p className="mt-2 max-w-[48ch] text-mute">{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
      <SectionDivider />

      {/* Процесс 7 шагов */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <MicroLabel>процесс</MicroLabel>
          <h2 className="font-heavy mt-4 max-w-[18ch] text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
            Семь шагов до готовой инженерии
          </h2>
        </Reveal>
        <Reveal>
          <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.name} className="flex gap-5 border-b border-line py-5">
                <span className="font-plex text-lg" style={{ color: "var(--lime-bright)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-heavy font-extrabold tracking-tight uppercase">{s.name}</p>
                  <p className="mt-1.5 max-w-[46ch] text-sm text-mute">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>
      <SectionDivider />

      {/* Готовые узлы (тизер каталога) */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <MicroLabel>каталог</MicroLabel>
          <h2 className="font-heavy mt-4 max-w-[18ch] text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
            Готовые решения нашего производства
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.07}>
              <Link href={`/katalog/${c.slug}/`} className="group block rounded-[20px] border border-line bg-surface p-7 transition-colors hover:border-line-strong">
                <div className="rifle mb-6 flex aspect-[16/10] items-center justify-center rounded-[16px]">
                  <span className="font-plex text-xs tracking-[0.16em] text-dim uppercase">фото изделия</span>
                </div>
                <p className="font-heavy text-lg font-extrabold tracking-tight uppercase">{c.name}</p>
                <p className="mt-2 text-sm text-mute">{c.short}</p>
                <span className="mt-5 inline-block font-plex text-xs tracking-[0.12em] uppercase" style={{ color: "var(--lime-bright)" }}>
                  смотреть →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <SectionDivider />

      {/* Наши работы */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <MicroLabel>портфолио</MicroLabel>
            <h2 className="font-heavy mt-4 max-w-[16ch] text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
              Наши работы
            </h2>
          </Reveal>
          <Link href="/raboty/" className="font-plex text-sm tracking-[0.1em] uppercase" style={{ color: "var(--lime-bright)" }}>
            все объекты →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {projects.slice(0, 8).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.06}>
              <Link href={`/raboty/${p.slug}/`} className="group block overflow-hidden rounded-[16px] border border-line bg-surface">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={ph(p.seed, 700, 525)} alt={`${p.name}, ${p.city}`} loading="lazy" className="ph h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="p-5">
                  <p className="font-heavy text-sm leading-tight font-bold tracking-tight uppercase">{p.name}</p>
                  <p className="mt-2 font-plex text-xs text-mute">{p.city} · {p.area}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <SectionDivider />

      {/* Оборудование партнёров */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10">
        <Reveal>
          <MicroLabel>оборудование партнёров</MicroLabel>
        </Reveal>
        <div className="mt-10">
          <Brands />
        </div>
      </section>
      <SectionDivider />

      {/* Гарантия + География */}
      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-10 md:py-32 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <MicroLabel>гарантия и сервис</MicroLabel>
          <h2 className="font-heavy mt-4 text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight font-black tracking-[-0.02em] uppercase">
            Остаёмся на связи после сдачи
          </h2>
          <ul className="mt-8 divide-y divide-line border-y border-line font-plex text-sm">
            {["Гарантия 2 года на работы", "Сервисное и гарантийное обслуживание", "Шеф-монтаж", "Выезд по гарантии"].map((g) => (
              <li key={g} className="flex items-center gap-3 py-3.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--lime-bright)" }} />
                {g}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <MicroLabel>география</MicroLabel>
          <h2 className="font-heavy mt-4 text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight font-black tracking-[-0.02em] uppercase">
            Краснодарский край
          </h2>
          <div className="rifle mt-8 flex flex-wrap gap-x-8 gap-y-4 rounded-[16px] p-8">
            {bannerContact.geo.map((c) => (
              <span key={c} className="flex items-center gap-2 font-plex text-sm">
                <MapPin size={16} aria-hidden style={{ color: "var(--lime-bright)" }} />
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </section>
      <SectionDivider />

      {/* FAQ */}
      <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <MicroLabel>вопросы</MicroLabel>
            <h2 className="font-heavy mt-4 max-w-[14ch] text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] font-black tracking-[-0.02em] uppercase">
              Частые вопросы
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </section>

      <LeadSection />

      {/* Футер */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10">
          <a href={bannerContact.phoneHref} className="font-heavy text-[clamp(2rem,5vw,3.6rem)] font-black tracking-tight">
            {bannerContact.phone}
          </a>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {bannerContact.messengers.map((m) => (
              <a key={m.name} href={m.href} target="_blank" rel="noopener noreferrer" className="font-plex text-sm text-mute transition-colors hover:text-ink" style={{ ["--tw-text-opacity" as string]: "1" }}>
                {m.name}
              </a>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-plex text-xs tracking-[0.16em] text-dim uppercase">
            {bannerContact.objectTypes.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="mt-10 font-plex text-xs text-dim">
            ИП Тимченко · реквизиты уточняются · Instagram {bannerContact.instagram}
          </p>
        </div>
      </footer>
    </div>
  );
}
