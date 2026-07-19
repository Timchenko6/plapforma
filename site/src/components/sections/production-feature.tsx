import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { PhotoSlot, Callout } from "@/components/concept/photo-slot";

/** Производство узлов с чертёжными выносками (brief-redesign §7, §9). Ключевая отстройка. */
export function ProductionFeature() {
  return (
    <section className="bp-grid border-y border-line bg-bg2">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">производство</p>
          <h2 className="font-display mt-4 max-w-[26ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
            Узлы собираем в цехе, а не на объекте
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal delay={0.1}>
            <p className="max-w-[52ch] text-lg leading-relaxed text-mute">
              Узел ввода воды или обвязку котельной мы собираем и опрессовываем на производстве, в
              спокойных условиях и с нормальным инструментом. На объект приезжает готовое проверенное
              изделие: монтаж быстрее, соединения надёжнее, а качество одинаковое в каждом доме, а не
              зависит от того, какая бригада сегодня в котловане.
            </p>
            <ul className="mt-10 divide-y divide-line border-y border-line font-mono text-sm">
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">сборка и опрессовка</span>
                <span className="text-ink">в цехе, до монтажа</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">монтаж на объекте</span>
                <span className="text-ink">быстрее в разы</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">стоимость</span>
                <span className="text-ink">известна заранее</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">качество</span>
                <span className="text-ink">повторяемое, не «как получится»</span>
              </li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/catalog/uzly/" className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
                Готовые узлы в каталоге
              </Link>
              <Link href="/production/" className={cn(buttonVariants({ variant: "ghost", size: "md" }))}>
                Как устроено производство
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative">
              <Callout
                label="опрессовка · испытание давлением до объекта"
                align="right"
                delay={0.5}
                className="absolute -top-1 right-0 z-10 hidden -translate-y-full pb-2 sm:flex"
              />
              <PhotoSlot
                caption="узел ввода воды · сборка на производстве · опрессовка 6 бар"
                aspect="aspect-[4/5]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
