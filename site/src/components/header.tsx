"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { LeadButton } from "@/components/lead/lead-button";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/services/", label: "Направления" },
  { href: "/catalog/", label: "Каталог" },
  { href: "/production/", label: "Производство" },
  { href: "/projects/", label: "Проекты" },
  { href: "/company/", label: "О компании" },
  { href: "/contacts/", label: "Контакты" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-colors duration-300",
        scrolled ? "border-line bg-bg/90 backdrop-blur-md" : "border-transparent bg-bg/40 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 transition-[height] duration-300 sm:px-10",
          scrolled ? "h-[60px]" : "h-[76px]",
        )}
      >
        <Link href="/" className="font-display text-base font-semibold tracking-tight whitespace-nowrap">
          Тимченко<span className="text-copper">.</span>про
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-mute transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href={site.phoneHref} className="text-sm font-semibold text-ink hover:text-copper-soft">
            {site.phone}
          </a>
          <LeadButton size="md" />
        </div>

        <button
          className="cursor-pointer p-2 text-ink lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-bg px-5 pt-4 pb-8 lg:hidden">
          <nav className="flex flex-col" aria-label="Мобильная навигация">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg font-medium text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-4">
            <a href={site.phoneHref} className="text-lg font-semibold">
              {site.phone}
            </a>
            <LeadButton className="w-full" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
