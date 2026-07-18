import Link from "next/link";
import { site } from "@/data/site";
import { directions } from "@/data/directions";
import { categories } from "@/data/products";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg2">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">
            Тимченко<span className="text-copper">.</span>про
          </p>
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-mute">{site.sub}</p>
          <a href={site.phoneHref} className="mt-5 block text-lg font-semibold hover:text-copper-soft">
            {site.phone}
          </a>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {site.messengers.map((m) => (
              <a
                key={m.name}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-mute transition-colors hover:text-copper-soft"
              >
                {m.name}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Направления">
          <p className="text-sm font-semibold text-dim">Направления</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {directions.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/services/${d.slug}/`}
                  className="text-sm text-mute transition-colors hover:text-ink"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Каталог">
          <p className="text-sm font-semibold text-dim">Каталог</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalog/${c.slug}/`}
                  className="text-sm text-mute transition-colors hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/production/" className="text-sm text-mute transition-colors hover:text-ink">
                Производство узлов
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Компания">
          <p className="text-sm font-semibold text-dim">Компания</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            <li>
              <Link href="/projects/" className="text-sm text-mute transition-colors hover:text-ink">
                Проекты
              </Link>
            </li>
            <li>
              <Link href="/company/" className="text-sm text-mute transition-colors hover:text-ink">
                О компании
              </Link>
            </li>
            <li>
              <Link href="/contacts/" className="text-sm text-mute transition-colors hover:text-ink">
                Контакты
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm font-semibold text-dim">Работаем</p>
          <p className="mt-2 text-sm text-mute">{site.geo.join(", ")}</p>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <p className="text-xs text-dim">{site.legal}</p>
          <p className="text-xs text-dim">© {new Date().getFullYear()} Тимченко.про</p>
        </div>
      </div>
    </footer>
  );
}
