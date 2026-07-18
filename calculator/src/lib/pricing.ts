/**
 * Pricing model for the water-inlet unit (узел ввода воды).
 *
 * The numbers mirror the public landing page tiers. The output is always a
 * range (±), never a hard quote: the final смета is produced by an engineer
 * after a site visit. Keep every rule here explainable to the customer —
 * each line item is shown in the UI breakdown.
 */

export type TierId = 'base' | 'comfort' | 'smart';

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  price: number;
  features: string[];
}

export const TIERS: Tier[] = [
  {
    id: 'base',
    name: 'База',
    tagline: 'для квартиры или небольшого дома',
    price: 99_000,
    features: [
      'Защита от протечек',
      'Редуктор давления',
      'Фильтр грубой очистки',
      'Узел учёта и обратные клапаны',
    ],
  },
  {
    id: 'comfort',
    name: 'Комфорт',
    tagline: 'баланс цены и возможностей',
    price: 155_000,
    features: [
      'Коллекторная разводка',
      'Защита Neptun',
      'Фильтры грубой и тонкой очистки',
      'Гаситель гидроудара',
      'Сантехнический щит',
    ],
  },
  {
    id: 'smart',
    name: 'Смарт',
    tagline: 'флагман для дома, умная защита',
    price: 259_000,
    features: [
      'Медь / нержавейка',
      'Умная защита Wi-Fi',
      'Каскад фильтрации',
      'Проточный водонагреватель',
      'Премиум-комплект',
    ],
  },
];

export interface OptionDef {
  id: string;
  name: string;
  hint: string;
  price: number;
  /** Options already included in these tiers are hidden/marked included. */
  includedIn?: TierId[];
}

export const OPTIONS: OptionDef[] = [
  {
    id: 'smartLeak',
    name: 'Умная защита Wi-Fi',
    hint: 'уведомления и перекрытие воды с телефона',
    price: 14_000,
    includedIn: ['smart'],
  },
  {
    id: 'softening',
    name: 'Доп. фильтрация / умягчение',
    hint: 'защита техники от накипи',
    price: 22_000,
  },
  {
    id: 'waterHeater',
    name: 'Проточный водонагреватель',
    hint: 'резерв горячей воды',
    price: 28_000,
    includedIn: ['smart'],
  },
  {
    id: 'heatingCollector',
    name: 'Коллектор отопления / тёплого пола',
    hint: 'в одном щите с узлом воды',
    price: 35_000,
  },
];

/** Every wet room beyond the first adds collector outputs + pipework. */
export const EXTRA_BATHROOM_PRICE = 8_500;

export interface CalcInput {
  objectType: 'house' | 'apartment';
  area: number;
  bathrooms: number;
  tier: TierId;
  options: string[];
}

export interface CalcLine {
  label: string;
  amount: number;
}

export interface CalcResult {
  lines: CalcLine[];
  total: number;
  low: number;
  high: number;
  recommendedTier: TierId;
}

export function recommendTier(area: number): TierId {
  if (area >= 380) return 'smart';
  if (area >= 180) return 'comfort';
  return 'base';
}

const round1000 = (n: number) => Math.round(n / 1000) * 1000;

export function calculate(input: CalcInput): CalcResult {
  const tier = TIERS.find((t) => t.id === input.tier) ?? TIERS[0];
  const lines: CalcLine[] = [{ label: `Узел «${tier.name}»`, amount: tier.price }];

  for (const opt of OPTIONS) {
    if (opt.includedIn?.includes(tier.id)) continue;
    if (input.options.includes(opt.id)) {
      lines.push({ label: opt.name, amount: opt.price });
    }
  }

  const extraBathrooms = Math.max(0, input.bathrooms - 1);
  if (extraBathrooms > 0) {
    lines.push({
      label: `Доп. санузлы × ${extraBathrooms} (выходы коллектора)`,
      amount: extraBathrooms * EXTRA_BATHROOM_PRICE,
    });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return {
    lines,
    total,
    low: round1000(total * 0.95),
    high: round1000(total * 1.1),
    recommendedTier: recommendTier(input.area),
  };
}

export function buildWhatsAppMessage(input: CalcInput, result: CalcResult): string {
  const tier = TIERS.find((t) => t.id === input.tier)!;
  const objectLabel = input.objectType === 'house' ? 'Дом' : 'Квартира';
  const opts = result.lines
    .slice(1)
    .map((l) => l.label)
    .join(', ');
  return (
    `Здравствуйте! Рассчитал узел ввода на сайте: ${objectLabel}, ${input.area} м², ` +
    `санузлов: ${input.bathrooms}. Комплектация «${tier.name}»` +
    (opts ? `, доп.: ${opts}` : '') +
    `. Ориентир: ${result.low.toLocaleString('ru-RU')}–${result.high.toLocaleString('ru-RU')} ₽.`
  );
}

export const PHONE = '79882829031';

export function waHref(text: string): string {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}
