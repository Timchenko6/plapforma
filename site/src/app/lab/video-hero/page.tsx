import type { Metadata } from "next";
import Link from "next/link";
import { VideoBackground } from "@/components/video-background";
import { LeadButton } from "@/components/lead/lead-button";
import { site } from "@/data/site";
import { ph, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Видео-hero (лаборатория) - Тимченко.про",
  description: "Экспериментальная версия главной с полноэкранным видеофоном.",
  robots: { index: false },
};

// TODO: заменить тестовый поток на HLS с реальным видео заказчика
// (облёт объекта дроном / съёмка монтажа), залитым в CDN с HLS-нарезкой.
const STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export default function VideoHeroLab() {
  return (
    <div className="theme-dark relative min-h-[100dvh] overflow-hidden bg-bg text-ink">
      <VideoBackground src={STREAM} poster={ph("timchenko-production-unit", 1300, 900)} />

      {/* Скрим: затемнение к низу и к левому краю, чтобы текст держал контраст на любом кадре */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-bg/15"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent"
      />

      {/* Стеклянная навигация */}
      <header className="fixed inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6">
        <div className="glass mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 rounded-md px-4 sm:px-7">
          <Link href="/" className="font-display text-base font-semibold tracking-tight">
            Тимченко<span className="text-copper">.</span>про
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Навигация">
            <Link href="/services/" className="text-sm font-medium text-mute transition-colors hover:text-ink">
              Направления
            </Link>
            <Link href="/projects/" className="text-sm font-medium text-mute transition-colors hover:text-ink">
              Проекты
            </Link>
            <Link href="/contacts/" className="text-sm font-medium text-mute transition-colors hover:text-ink">
              Контакты
            </Link>
          </nav>
          <LeadButton size="md" className="px-4 sm:px-6" />
        </div>
      </header>

      {/* Hero-контент в левом нижнем углу */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[1200px] px-5 pb-12 sm:px-6 md:pb-16">
          <h1 className="hero-enter font-display max-w-[16ch] text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Вся инженерия дома. Одна команда.
          </h1>
          <p className="hero-enter-late mt-5 max-w-[38ch] text-lg text-ink/85 sm:text-xl">
            {site.sub}. Полный цикл: от проекта до сервиса.
          </p>
          <div className="hero-enter-late mt-8 flex flex-wrap items-center gap-4">
            <LeadButton />
            <Link href="/projects/" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              Смотреть проекты
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
