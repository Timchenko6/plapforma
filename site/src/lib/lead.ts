// Отправка заявки на просчёт. Лиды на старте падают в Telegram (бриф §9).
//
// Схема Фазы 1 (GitHub Pages, статика): POST на relay-endpoint (Cloudflare
// Worker или аналог), который пересылает сообщение в Telegram-бот заказчика.
// Endpoint задаётся переменной NEXT_PUBLIC_LEAD_ENDPOINT на сборке.
// Пока endpoint не настроен, форма показывает успех и предлагает мессенджеры.

export type Lead = {
  topic: string;
  phone: string;
  time: string;
};

const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

export async function sendLead(lead: Lead): Promise<{ delivered: boolean }> {
  const text = [
    "Заявка на просчёт с сайта",
    `Что просчитать: ${lead.topic}`,
    `Телефон: ${lead.phone}`,
    `Удобное время: ${lead.time}`,
  ].join("\n");

  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`lead endpoint responded ${res.status}`);
    return { delivered: true };
  }

  // Endpoint ещё не подключён: заявку не теряем молча, а честно сообщаем
  // в UI, что надёжнее написать в мессенджер.
  console.warn("NEXT_PUBLIC_LEAD_ENDPOINT is not configured; lead not delivered", text);
  return { delivered: false };
}
