"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { LeadButton } from "@/components/lead/lead-button";
import { site } from "@/data/site";

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

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
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
