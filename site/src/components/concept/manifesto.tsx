import { Reveal } from "@/components/reveal";

/** Манифест «Почему одна команда, а не пять подрядчиков» (brief §7, ядро позиционирования). */
export function Manifesto() {
  return (
    <section className="border-b border-line bg-bg2">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">
            почему одна команда
          </p>
          <h2 className="font-display mt-4 max-w-[22ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
            Пять подрядчиков строят пять систем. Мы строим один дом
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <Reveal delay={0.08}>
            <p className="text-lg leading-relaxed text-mute">
              Обычная стройка выглядит так: сантехник разводит трубы, не заглядывая в проект
              электрика. Вентиляционщик приезжает, когда потолки уже подшиты. Каждый отвечает за
              свой узел, и никто за дом целиком. Коллизии вскрываются на монтаже, и за каждую платит
              заказчик: штробы по свежей стяжке, перенос трасс, недели простоя и споры о том, кто
              виноват.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-mute">
              Мы устроены иначе. Все семь систем проектирует один инженер, поэтому конфликты
              решаются на чертеже, где исправление стоит ноль рублей. Монтаж ведут наши бригады по
              общему графику: никто никого не ждёт и не переделывает чужую работу.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lg leading-relaxed text-mute">
              Для вас это означает три вещи. Дом сдаётся в срок, потому что график один и им
              управляет один человек. Цена не растёт по ходу, потому что смета зафиксирована в
              договоре до начала работ. А когда стройка закончится, по любому вопросу об инженерке
              вы звоните на один номер: и так все годы, что дом живёт.
            </p>
            <ul className="mt-8 divide-y divide-line border-y border-line font-mono text-sm">
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">коллизия на чертеже</span>
                <span className="text-ink">0 ₽</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">та же коллизия на стройке</span>
                <span className="text-ink">штробы, переносы, простой</span>
              </li>
              <li className="flex items-baseline justify-between gap-6 py-3.5">
                <span className="text-mute">ответственный за результат</span>
                <span className="text-ink">один инженер</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
