import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ConceptHero } from "@/components/concept/concept-hero";
import { Manifesto } from "@/components/concept/manifesto";
import { DirectionsGrid } from "@/components/concept/directions-grid";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Концепт редизайна: графит и чертёжная подпись - Тимченко.про",
  description:
    "Дизайн-концепт первого экрана: глубокий графит, чертёжные выноски, премиальная система движения. На согласование тона.",
  robots: { index: false },
};

/**
 * Концепт по brief-redesign §14: герой + манифест + сетка направлений.
 * После утверждения тона визуальный язык раскатывается на весь сайт.
 */
export default function ConceptPage() {
  return (
    <div className="theme-concept bg-bg text-ink">
      <Header />
      <main>
        <ConceptHero />
        <Manifesto />
        <DirectionsGrid />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-10">
          <p className="font-mono text-xs text-dim">
            дизайн-концепт · на согласование · остальные секции после утверждения тона
          </p>
          <a href={site.phoneHref} className="font-mono text-xs text-mute hover:text-ink">
            {site.phone}
          </a>
        </div>
      </footer>
    </div>
  );
}
