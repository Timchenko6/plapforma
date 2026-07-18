// ВНИМАНИЕ: товарные данные - черновые плейсхолдеры (бриф §3).
// Названия, составы и цены заменить на реальные при наполнении.

export type ProductCategory = {
  slug: string;
  name: string;
  short: string;
  seed: string;
};

export type Product = {
  slug: string;
  category: string;
  name: string;
  short: string;
  specs: { label: string; value: string }[];
  forWhom: string;
  price: string;
  seed: string;
};

export const categories: ProductCategory[] = [
  {
    slug: "uzly",
    name: "Готовые узлы",
    short: "Узлы ввода воды и водоподготовки, собранные и опрессованные на нашем производстве.",
    seed: "timchenko-cat-uzly",
  },
  {
    slug: "kotelnye",
    name: "Котельные",
    short: "Скомпонованные котельные под площадь дома: котёл, обвязка, автоматика.",
    seed: "timchenko-cat-kotel",
  },
  {
    slug: "avtomatika",
    name: "Автоматика для котельных",
    short: "Погодозависимое управление, удалённый контроль, защита от аварий.",
    seed: "timchenko-cat-auto",
  },
];

export const products: Product[] = [
  {
    slug: "uzel-vvoda-standart",
    category: "uzly",
    name: "Узел ввода воды «Стандарт»",
    short: "Базовый узел ввода для квартиры или небольшого дома: фильтрация, редуктор, защита от протечек.",
    specs: [
      { label: "Подключение", value: "1/2\" или 3/4\"" },
      { label: "Фильтрация", value: "механика 100 мкм" },
      { label: "Редуктор давления", value: "есть" },
      { label: "Защита от протечек", value: "готов к подключению" },
      { label: "Сборка", value: "опрессован на производстве" },
    ],
    forWhom: "Квартиры и дома с готовой водоподготовкой, замена самодельных вводов.",
    price: "от 45 000 ₽",
    seed: "timchenko-uzel-1",
  },
  {
    slug: "uzel-vvoda-komfort",
    category: "uzly",
    name: "Узел ввода воды «Комфорт»",
    short: "Расширенный узел с магистральной фильтрацией и подготовкой под коллекторную разводку.",
    specs: [
      { label: "Подключение", value: "3/4\" или 1\"" },
      { label: "Фильтрация", value: "механика + магистральный фильтр" },
      { label: "Коллекторная группа", value: "в составе" },
      { label: "Защита от протечек", value: "в составе" },
      { label: "Сборка", value: "опрессован на производстве" },
    ],
    forWhom: "Частные дома с коллекторной разводкой воды.",
    price: "от 90 000 ₽",
    seed: "timchenko-uzel-2",
  },
  {
    slug: "kotelnaya-do-150",
    category: "kotelnye",
    name: "Котельная для дома до 150 м²",
    short: "Готовое решение: настенный котёл, обвязка, группа безопасности, базовая автоматика.",
    specs: [
      { label: "Площадь дома", value: "до 150 м²" },
      { label: "Котёл", value: "настенный, газовый" },
      { label: "Контуры", value: "радиаторы + тёплый пол" },
      { label: "Автоматика", value: "комнатный термостат" },
      { label: "Монтаж", value: "2-3 дня на объекте" },
    ],
    forWhom: "Дома и дачи до 150 м² с магистральным газом.",
    price: "от 350 000 ₽",
    seed: "timchenko-kotel-1",
  },
  {
    slug: "kotelnaya-do-300",
    category: "kotelnye",
    name: "Котельная для дома до 300 м²",
    short: "Котельная с гидрострелкой, несколькими контурами и погодозависимой автоматикой.",
    specs: [
      { label: "Площадь дома", value: "до 300 м²" },
      { label: "Котёл", value: "настенный или напольный" },
      { label: "Контуры", value: "до 4 независимых" },
      { label: "Автоматика", value: "погодозависимая" },
      { label: "Монтаж", value: "4-6 дней на объекте" },
    ],
    forWhom: "Дома 150-300 м² с тёплыми полами и несколькими зонами.",
    price: "от 650 000 ₽",
    seed: "timchenko-kotel-2",
  },
  {
    slug: "avtomatika-basic",
    category: "avtomatika",
    name: "Автоматика «Контроль»",
    short: "Удалённый контроль котельной со смартфона: температура, давление, аварийные уведомления.",
    specs: [
      { label: "Управление", value: "приложение на смартфоне" },
      { label: "Датчики", value: "температура, давление, протечка" },
      { label: "Уведомления", value: "авария, остановка котла" },
      { label: "Связь", value: "Wi-Fi или GSM" },
    ],
    forWhom: "Любая котельная, за которой хочется следить из города.",
    price: "от 60 000 ₽",
    seed: "timchenko-auto-1",
  },
  {
    slug: "avtomatika-pogoda",
    category: "avtomatika",
    name: "Автоматика «Погода»",
    short: "Погодозависимое управление контурами: дом сам держит температуру и экономит газ.",
    specs: [
      { label: "Управление", value: "погодозависимое, по зонам" },
      { label: "Контуры", value: "до 4" },
      { label: "Экономия газа", value: "до 15% за сезон" },
      { label: "Интеграция", value: "готова к умному дому" },
    ],
    forWhom: "Котельные с несколькими контурами и тёплыми полами.",
    price: "от 120 000 ₽",
    seed: "timchenko-auto-2",
  },
];
