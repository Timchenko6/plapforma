"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { sendLead } from "@/lib/lead";
import { site } from "@/data/site";
import { directions } from "@/data/directions";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const TIMES = ["В любое время", "Утром (9:00-12:00)", "Днём (12:00-17:00)", "Вечером (17:00-20:00)"];

type Status = "idle" | "sending" | "sent" | "sent-offline" | "error";

/**
 * Единая форма «Заявка на просчёт» (бриф §8: что просчитать / телефон / время).
 * Используется в модалке и в финальной секции страниц.
 */
export function LeadForm({ defaultTopic, idPrefix = "lead" }: { defaultTopic?: string; idPrefix?: string }) {
  const [topic, setTopic] = useState(defaultTopic ?? "");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [phoneError, setPhoneError] = useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Укажите номер телефона, чтобы мы могли перезвонить");
      return;
    }
    setPhoneError(undefined);
    setStatus("sending");
    try {
      const { delivered } = await sendLead({ topic: topic || "Не указано", phone, time });
      setStatus(delivered ? "sent" : "sent-offline");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent" || status === "sent-offline") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-md border border-line bg-surface p-6">
        <CheckCircle size={32} weight="fill" className="text-ok" aria-hidden />
        <p className="text-lg font-semibold">Заявка принята</p>
        <p className="text-mute">
          {status === "sent"
            ? "Инженер свяжется с вами в выбранное время."
            : "Сайт работает в тестовом режиме. Чтобы заявка точно дошла, продублируйте её в мессенджер:"}
        </p>
        <div className="flex flex-wrap gap-3">
          {site.messengers.slice(0, 2).map((m) => (
            <a
              key={m.name}
              href={m.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-copper hover:text-copper-soft"
            >
              {m.name}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field label="Что просчитать" htmlFor={`${idPrefix}-topic`}>
        <Select id={`${idPrefix}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">Выберите направление</option>
          {defaultTopic && !directions.some((d) => d.name === defaultTopic) ? (
            <option value={defaultTopic}>{defaultTopic}</option>
          ) : null}
          {directions.map((d) => (
            <option key={d.slug} value={d.name}>
              {d.name}
            </option>
          ))}
          <option value="Готовый узел из каталога">Готовый узел из каталога</option>
          <option value="Весь дом под ключ">Весь дом под ключ</option>
        </Select>
      </Field>
      <Field label="Номер телефона" htmlFor={`${idPrefix}-phone`} error={phoneError}>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 ___ ___-__-__"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>
      <Field label="Удобное время для звонка" htmlFor={`${idPrefix}-time`}>
        <Select id={`${idPrefix}-time`} value={time} onChange={(e) => setTime(e.target.value)}>
          {TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>
      {status === "error" ? (
        <p role="alert" className="text-sm text-err">
          Не получилось отправить. Позвоните нам или напишите в мессенджер.
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={status === "sending"}>
        {status === "sending" ? "Отправляем…" : "Получить просчёт"}
      </Button>
      <p className="text-xs leading-relaxed text-dim">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
      </p>
    </form>
  );
}
