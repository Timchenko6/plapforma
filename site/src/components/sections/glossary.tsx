import { glossary } from "@/data/glossary";
import { Reveal } from "@/components/reveal";

/** Мини-глоссарий инженерным языком (brief-redesign §7): технические сноски. */
export function Glossary() {
  return (
    <section className="border-b border-line bg-bg2">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-10 md:py-32">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.18em] text-dim uppercase">
            инженерным языком
          </p>
          <h2 className="font-display mt-4 max-w-[22ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.6rem]">
            Короткий словарь терминов
          </h2>
        </Reveal>
        <dl className="mt-12 grid gap-x-16 gap-y-0 md:grid-cols-2">
          {glossary.map((g, i) => (
            <Reveal key={g.term} delay={(i % 2) * 0.06}>
              <div className="border-t border-line py-6">
                <dt className="font-mono text-sm text-copper-soft">{g.term}</dt>
                <dd className="mt-2 max-w-[54ch] text-sm leading-relaxed text-mute">{g.def}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
