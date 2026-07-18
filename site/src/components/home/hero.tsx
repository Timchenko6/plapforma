import Link from "next/link";
import { site } from "@/data/site";
import { ph } from "@/lib/utils";
import { LeadButton } from "@/components/lead/lead-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Асимметричный сплит-hero: слоган слева, объект справа. */
export function Hero() {
  return (
    <section className="relative border-b border-line">
      <div className="mx-auto grid min-h-[calc(100dvh-68px)] max-w-[1400px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="hero-enter">
          <h1 className="font-display text-[2.1rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Проектируем.
            <br />
            Производим.
            <br />
            <span className="text-copper">Монтируем.</span>
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg text-mute sm:text-xl">{site.sub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <LeadButton />
            <Link href="/projects/" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              Смотреть проекты
            </Link>
          </div>
        </div>
        <div className="hero-enter-late relative hidden lg:block">
          <div className="aspect-[4/5] overflow-hidden rounded-md">
            {/* TODO: заменить на фото флагманского объекта заказчика */}
            <img
              src={ph("timchenko-hero-house", 1100, 1375)}
              alt="Частный дом с инженерными системами Тимченко.про"
              className="ph h-full w-full object-cover"
            />
          </div>
          <div className="absolute bottom-6 left-6 rounded-sm border border-line bg-bg/85 px-5 py-4 backdrop-blur-sm">
            <p className="font-mono text-sm text-mute">Один подрядчик на весь дом</p>
            <p className="mt-1 font-display text-lg font-medium">7 инженерных направлений</p>
          </div>
        </div>
      </div>
    </section>
  );
}
