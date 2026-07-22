// Данные баннер-версии сайта (tz-site-timchenko).
// Контакты с баннера — отличаются от текущих плейсхолдеров.
export const bannerContact = {
  phone: "8 988 282 90 31",
  phoneHref: "tel:+79882829031",
  instagram: "@timchenko.group",
  instagramHref: "https://instagram.com/timchenko.group",
  messengers: [
    { name: "Telegram", href: "https://t.me/timchenko_pro" },
    { name: "MAX", href: "https://max.ru/" },
    { name: "WhatsApp", href: "https://wa.me/79882829031" },
    { name: "Instagram", href: "https://instagram.com/timchenko.group" },
  ],
  geo: ["Краснодар", "Сочи", "Геленджик", "Абрау-Дюрсо"],
  objectTypes: ["Квартиры", "Дома", "Офисы", "Коттеджи"],
};

export type BannerDirection = {
  slug: string;
  name: string;
  lead: string;
  color: string;
  icon: "drop" | "flame" | "bolt" | "wind";
  quizCta: string;
};

// Четыре направления с цветовым кодированием (tz-site §2.2).
export const bannerDirections: BannerDirection[] = [
  {
    slug: "vodosnabzhenie",
    name: "Водоснабжение и канализация",
    lead: "Ввод воды, водоподготовка, коллекторная разводка, септики и ливнёвка. Узлы собираем в цехе.",
    color: "#1B84EA",
    icon: "drop",
    quizCta: "Подобрать узел ввода",
  },
  {
    slug: "otoplenie",
    name: "Отопление и котельные",
    lead: "Котельные под ключ, радиаторы и тёплые полы, обвязка и погодозависимая автоматика.",
    color: "#FF6A2B",
    icon: "flame",
    quizCta: "Рассчитать котельную",
  },
  {
    slug: "elektrika",
    name: "Электрика и электрощиты",
    lead: "Электромонтаж по нормам, сборка и маркировка щитов, слаботочка, основа под умный дом.",
    color: "#78A700",
    icon: "bolt",
    quizCta: "Просчёт электрики и умного дома",
  },
  {
    slug: "ventilyaciya",
    name: "Вентиляция и кондиционирование",
    lead: "Приточно-вытяжные системы с рекуперацией, канальные сплит-системы, скрытый монтаж.",
    color: "#17B8B0",
    icon: "wind",
    quizCta: "Какие системы вам нужны",
  },
];

// Пять преимуществ с баннера (tz-site §4.5).
export const whyUs = [
  {
    title: "Профессиональный подход",
    text: "Работаем по проекту, а не «на глаз». Каждое решение обосновано расчётом.",
  },
  {
    title: "Комплексный монтаж",
    text: "От проекта до запуска: все системы дома в одних руках и под одним договором.",
  },
  {
    title: "Чисто и аккуратно",
    text: "Соблюдаем культуру монтажа: ровные трассы, подписанные узлы, убранный объект.",
  },
  {
    title: "Гарантия на работы и материалы",
    text: "Отвечаем и за монтаж, и за оборудование. Единая ответственность без перекладывания.",
  },
  {
    title: "Точные сроки",
    text: "График фиксируется в договоре, его ведёт один инженер. Сдаём в срок.",
  },
];

export const trust = [
  { value: 10, suffix: " лет", label: "на рынке инженерных систем" },
  { value: null as number | null, text: "Своё", label: "производство узлов" },
  { value: 2, suffix: " года", label: "гарантия на работы" },
  { value: 1, suffix: "", label: "подрядчик на весь объект" },
];
