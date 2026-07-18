import Link from "next/link";
import { ph, cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

/** Продуктовая секция про собственное производство узлов (ключевая отстройка). */
export function ProductionFeature() {
  return (
    <section className="border-y border-line bg-bg2">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <h2 className="font-display max-w-[26ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
            Узлы собираем на своём производстве, а не на объекте
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal delay={0.1} className="order-2 lg:order-1">
            <p className="max-w-[52ch] text-lg text-mute">
              Узел ввода воды или обвязку котельной мы собираем и опрессовываем в цехе, в спокойных
              условиях. На объект приезжает готовое изделие: монтаж быстрее, соединения надёжнее,
              результат одинаково аккуратный в каждом доме.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              <li className="flex items-baseline justify-between gap-6 py-4">
                <span className="text-mute">Сборка и опрессовка</span>
                <span className="font-mono text-sm">в цехе, до монтажа</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-4">
                <span className="text-mute">Монтаж на объекте</span>
                <span className="font-mono text-sm">быстрее в разы</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-4">
                <span className="text-mute">Стоимость</span>
                <span className="font-mono text-sm">известна заранее</span>
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
          <Reveal delay={0.15} className="order-1 lg:order-2">
            <div className="aspect-[16/11] overflow-hidden rounded-md border border-line">
              {/* TODO: заменить на фото/рендер узла с производства заказчика */}
              <img
                src={ph("timchenko-production-unit", 1300, 900)}
                alt="Готовый узел ввода воды, собранный на производстве Тимченко.про"
                loading="lazy"
                className="ph h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
