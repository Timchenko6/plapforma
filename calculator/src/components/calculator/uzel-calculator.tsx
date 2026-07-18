'use client';

import * as React from 'react';
import { Check, Home, Building2, Minus, Plus, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatRub } from '@/lib/utils';
import {
  TIERS,
  OPTIONS,
  calculate,
  buildWhatsAppMessage,
  waHref,
  type CalcInput,
  type TierId,
} from '@/lib/pricing';

/* ---------- step scaffolding ---------- */

function StepHeader({
  n,
  title,
  done,
  hint,
}: {
  n: string;
  title: string;
  done: boolean;
  hint?: string;
}) {
  return (
    <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-[hsl(45_100%_30%)]">
          Шаг {n} из 3
        </div>
        <h2 className="mt-1.5 text-lg font-semibold">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      <span
        aria-hidden
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          done ? 'border-success bg-success text-success-foreground' : 'border-border-strong text-transparent'
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </CardHeader>
  );
}

function Stepper({ current, done }: { current: number; done: boolean[] }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Прогресс заполнения">
      {['Объект', 'Комплектация', 'Опции'].map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 items-center gap-2 rounded-sm border px-3 font-mono text-xs',
              done[i]
                ? 'border-success/40 bg-success/10 text-success'
                : i === current
                  ? 'border-primary/50 bg-primary/10 text-[hsl(45_100%_28%)]'
                  : 'border-border-strong/50 text-muted-foreground'
            )}
            aria-current={i === current ? 'step' : undefined}
          >
            {done[i] ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </span>
          {i < 2 && <span aria-hidden className="h-px w-4 bg-border-strong/50 sm:w-6" />}
        </li>
      ))}
    </ol>
  );
}

/* ---------- main component ---------- */

const AREA_MIN = 60;
const AREA_MAX = 600;

export function UzelCalculator() {
  const [input, setInput] = React.useState<CalcInput>({
    objectType: 'house',
    area: 200,
    bathrooms: 2,
    tier: 'comfort',
    options: [],
  });
  // step "touched" flags drive the progress feedback
  const [touched, setTouched] = React.useState({ object: false, tier: false, options: false });

  const result = React.useMemo(() => calculate(input), [input]);
  const tier = TIERS.find((t) => t.id === input.tier)!;

  // pulse the price on change (skipped automatically under prefers-reduced-motion)
  const [pulse, setPulse] = React.useState(0);
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPulse((p) => p + 1);
  }, [result.total]);

  const patch = (p: Partial<CalcInput>) => setInput((s) => ({ ...s, ...p }));

  const doneSteps = [touched.object, touched.tier, touched.options];
  const currentStep = doneSteps.findIndex((d) => !d);
  const waMessage = buildWhatsAppMessage(input, result);
  const showRecommend = result.recommendedTier !== input.tier;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
      {/* -------- left: steps -------- */}
      <div>
        <Stepper current={currentStep === -1 ? 2 : currentStep} done={doneSteps} />

        {/* Step 1: object */}
        <Card>
          <StepHeader n="1" title="Ваш объект" done={touched.object} />
          <CardContent className="space-y-6">
            <fieldset>
              <legend className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Тип объекта
              </legend>
              <RadioGroup
                className="grid grid-cols-2 gap-3"
                value={input.objectType}
                onValueChange={(v) => {
                  patch({ objectType: v as CalcInput['objectType'] });
                  setTouched((t) => ({ ...t, object: true }));
                }}
              >
                {(
                  [
                    { v: 'house', label: 'Дом', icon: Home },
                    { v: 'apartment', label: 'Квартира', icon: Building2 },
                  ] as const
                ).map(({ v, label, icon: Icon }) => (
                  <Label
                    key={v}
                    htmlFor={`obj-${v}`}
                    className={cn(
                      'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors',
                      input.objectType === v
                        ? 'border-primary bg-primary/5'
                        : 'border-border-strong/50 hover:border-border-strong'
                    )}
                  >
                    <RadioGroupItem value={v} id={`obj-${v}`} />
                    <Icon className="h-5 w-5 text-secondary" aria-hidden />
                    <span className="text-base">{label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <Label htmlFor="area-input" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Площадь
                </Label>
                <div className="flex items-baseline gap-1">
                  <input
                    id="area-input"
                    type="number"
                    inputMode="numeric"
                    min={AREA_MIN}
                    max={AREA_MAX}
                    value={input.area}
                    onChange={(e) => {
                      const v = Math.min(AREA_MAX, Math.max(AREA_MIN, +e.target.value || AREA_MIN));
                      patch({ area: v });
                      setTouched((t) => ({ ...t, object: true }));
                    }}
                    className="w-20 border-b-2 border-secondary bg-transparent text-right font-mono text-xl font-semibold focus:border-primary focus:outline-none"
                  />
                  <span className="font-mono text-sm text-muted-foreground">м²</span>
                </div>
              </div>
              <Slider
                min={AREA_MIN}
                max={AREA_MAX}
                step={10}
                value={[input.area]}
                onValueChange={([v]) => {
                  patch({ area: v });
                  setTouched((t) => ({ ...t, object: true }));
                }}
              />
              <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                <span>{AREA_MIN} м²</span>
                <span>{AREA_MAX} м²</span>
              </div>
            </div>

            <div>
              <Label htmlFor="bathrooms-value" className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Санузлов / мокрых зон
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Меньше санузлов"
                  disabled={input.bathrooms <= 1}
                  onClick={() => {
                    patch({ bathrooms: Math.max(1, input.bathrooms - 1) });
                    setTouched((t) => ({ ...t, object: true }));
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span id="bathrooms-value" className="w-8 text-center font-mono text-xl font-semibold" aria-live="polite">
                  {input.bathrooms}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Больше санузлов"
                  disabled={input.bathrooms >= 6}
                  onClick={() => {
                    patch({ bathrooms: Math.min(6, input.bathrooms + 1) });
                    setTouched((t) => ({ ...t, object: true }));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">первый включён, далее +{formatRub(8500)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: tier */}
        <Card className="mt-4">
          <StepHeader
            n="2"
            title="Комплектация узла"
            done={touched.tier}
            hint={showRecommend ? undefined : 'Подходит под вашу площадь'}
          />
          <CardContent>
            {showRecommend && (
              <button
                type="button"
                className="mb-4 flex w-full items-center gap-2 rounded-sm border border-primary/40 bg-primary/5 p-3 text-left text-sm transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  patch({ tier: result.recommendedTier });
                  setTouched((t) => ({ ...t, tier: true }));
                }}
              >
                <Badge>совет</Badge>
                <span>
                  Для {input.area} м² обычно берут «{TIERS.find((t) => t.id === result.recommendedTier)!.name}» — нажмите, чтобы выбрать
                </span>
              </button>
            )}
            <RadioGroup
              className="grid gap-3"
              value={input.tier}
              onValueChange={(v) => {
                patch({ tier: v as TierId });
                setTouched((t) => ({ ...t, tier: true }));
              }}
            >
              {TIERS.map((t) => (
                <Label
                  key={t.id}
                  htmlFor={`tier-${t.id}`}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-sm border p-4 transition-colors',
                    input.tier === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border-strong/50 hover:border-border-strong'
                  )}
                >
                  <RadioGroupItem value={t.id} id={`tier-${t.id}`} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-base font-semibold">{t.name}</span>
                      <span className="font-mono font-semibold">{formatRub(t.price)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.tagline}</p>
                    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-sm">
                          <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={3} aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 3: options */}
        <Card className="mt-4">
          <StepHeader n="3" title="Дополнительно" done={touched.options} hint="Можно ничего не выбирать" />
          <CardContent className="grid gap-3">
            {OPTIONS.map((opt) => {
              const included = opt.includedIn?.includes(input.tier);
              const checked = included || input.options.includes(opt.id);
              return (
                <Label
                  key={opt.id}
                  htmlFor={`opt-${opt.id}`}
                  className={cn(
                    'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-sm border p-4 transition-colors',
                    included
                      ? 'cursor-default border-success/40 bg-success/5'
                      : checked
                        ? 'border-primary bg-primary/5'
                        : 'border-border-strong/50 hover:border-border-strong'
                  )}
                >
                  <Checkbox
                    id={`opt-${opt.id}`}
                    checked={checked}
                    disabled={included}
                    onCheckedChange={(v) => {
                      patch({
                        options: v ? [...input.options, opt.id] : input.options.filter((o) => o !== opt.id),
                      });
                      setTouched((t) => ({ ...t, options: true }));
                    }}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{opt.name}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    {included ? <Badge variant="success">включено</Badge> : `+${formatRub(opt.price)}`}
                  </span>
                </Label>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* -------- right: sticky summary -------- */}
      <div className="lg:sticky lg:top-6">
        <Card className="overflow-hidden border-secondary bg-secondary text-secondary-foreground">
          <div className="blueprint-bg-dark p-6">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[hsl(214_56%_80%)]">
              <span>Ваш узел ввода</span>
              <span className="text-gold-bright">СХ-01</span>
            </div>
            <div className="mt-3 text-xl font-semibold">«{tier.name}» · {input.area} м²</div>

            <dl className="mt-4 space-y-2">
              {result.lines.map((l) => (
                <div key={l.label} className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="text-[hsl(214_56%_82%)]">{l.label}</dt>
                  <dd className="whitespace-nowrap font-mono">{formatRub(l.amount)}</dd>
                </div>
              ))}
            </dl>

            <Separator className="my-4 bg-white/15" />

            <div aria-live="polite" aria-atomic="true">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[hsl(214_56%_80%)]">
                Ориентировочно
              </div>
              <div key={pulse} className="mt-1 font-mono text-3xl font-bold motion-safe:animate-price-pulse">
                {result.low.toLocaleString('ru-RU')}–{result.high.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[hsl(214_56%_78%)]">
              Цифра черновая: точную смету по позициям инженер составит после выезда на объект. Гарантия 2 года
              на монтаж и сборку.
            </p>

            <div className="mt-5 grid gap-2">
              <Button variant="success" size="lg" asChild>
                <a href={waHref(waMessage)} target="_blank" rel="noopener">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Отправить расчёт в WhatsApp
                </a>
              </Button>
              <Button variant="outline" className="border-white/30 text-secondary-foreground hover:bg-white/10 hover:text-secondary-foreground" asChild>
                <a href="tel:+79882829031">
                  <Phone className="h-4 w-4" aria-hidden />
                  +7 988 282-90-31
                </a>
              </Button>
            </div>
          </div>
        </Card>
        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          Расчёт ни к чему не обязывает · Краснодар и край
        </p>
      </div>

      {/* -------- mobile sticky bottom bar -------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong/50 bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div aria-hidden>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ориентир</div>
            <div className="font-mono text-base font-bold">
              {result.low.toLocaleString('ru-RU')}–{result.high.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <Button variant="success" asChild>
            <a href={waHref(waMessage)} target="_blank" rel="noopener">
              <MessageCircle className="h-4 w-4" aria-hidden />
              В WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
