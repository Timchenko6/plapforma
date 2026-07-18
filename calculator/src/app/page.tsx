import { UzelCalculator } from '@/components/calculator/uzel-calculator';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <header className="mb-8">
        <a
          href="https://timchenko6.github.io/plapforma/"
          className="font-sans text-lg font-bold tracking-tight hover:opacity-80"
        >
          TIMCHENKO<span className="text-gold">.PRO</span>
        </a>
        <div className="mt-6 max-w-2xl">
          <div className="font-mono text-xs font-medium uppercase tracking-widest text-[hsl(45_100%_30%)]">
            Калькулятор · узел ввода воды
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Соберите узел под свой дом — цена пересчитывается сразу
          </h1>
          <p className="mt-3 text-muted-foreground">
            Три шага: объект, комплектация, опции. Итог можно отправить нам в WhatsApp одной кнопкой —
            инженер уточнит детали и превратит ориентир в смету.
          </p>
        </div>
      </header>
      <UzelCalculator />
    </main>
  );
}
