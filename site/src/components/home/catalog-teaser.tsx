import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { categories } from "@/data/products";
import { ph, cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

/** Витрина-тизер: асимметричная сетка 1 большая + 2 (не три одинаковые карточки). */
export function CatalogTeaser() {
  const [first, ...rest] = categories;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Reveal>
        <Link
          href={`/catalog/${first.slug}/`}
          className="group relative block h-full min-h-[420px] overflow-hidden rounded-md border border-line"
        >
          {/* TODO: заменить на фото изделий заказчика */}
          <img
            src={ph(first.seed, 1200, 1000)}
            alt=""
            aria-hidden
            loading="lazy"
            className="ph absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-7">
            <p className="font-display text-2xl font-medium">{first.name}</p>
            <p className="mt-2 max-w-[48ch] text-sm text-mute">{first.short}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper-soft">
              Смотреть категорию
              <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </Reveal>
      <div className="grid gap-5">
        {rest.map((c, i) => (
          <Reveal key={c.slug} delay={0.08 * (i + 1)}>
            <Link
              href={`/catalog/${c.slug}/`}
              className={cn(
                "group grid min-h-[200px] overflow-hidden rounded-md border border-line bg-surface sm:grid-cols-[1fr_220px]",
              )}
            >
              <div className="flex flex-col justify-center p-7">
                <p className="font-display text-xl font-medium">{c.name}</p>
                <p className="mt-2 text-sm text-mute">{c.short}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper-soft">
                  Смотреть категорию
                  <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <div className="hidden overflow-hidden sm:block">
                {/* TODO: заменить на фото изделий заказчика */}
                <img
                  src={ph(c.seed, 440, 400)}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="ph h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
