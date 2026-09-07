import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MAX_TOKEN = Deno.env.get("MAX_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("MAX_WEBHOOK_SECRET") ?? "";
const API = "https://platform-api2.max.ru";
const ORG_SLUG = Deno.env.get("ORGANIZATION_SLUG") ?? "timchenko-pro";
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const enc = new TextEncoder();

type MaxUser = { user_id: number; first_name?: string; last_name?: string; username?: string };
type Button = { type: string; text: string; payload?: string; url?: string };

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function maxApi(path: string, body?: unknown) {
  if (!MAX_TOKEN) throw new Error("MAX_BOT_TOKEN_NOT_CONFIGURED");
  const response = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: MAX_TOKEN, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) throw new Error(data?.message || data?.error || `MAX_API_${response.status}`);
  return data;
}

const callback = (text: string, payload: string): Button => ({ type: "callback", text, payload });
const link = (text: string, url: string): Button => ({ type: "link", text, url });
const contact = (text: string): Button => ({ type: "request_contact", text });
const keyboard = (buttons: Button[][]) => [{ type: "inline_keyboard", payload: { buttons } }];

async function send(userId: number, text: string, buttons: Button[][] = []) {
  return await maxApi(`/messages?user_id=${encodeURIComponent(userId)}`, {
    text,
    format: "html",
    disable_link_preview: true,
    attachments: buttons.length ? keyboard(buttons) : [],
  });
}

async function answerCallback(callbackId: string, notification = "Готово") {
  if (!callbackId) return;
  try { await maxApi(`/answers?callback_id=${encodeURIComponent(callbackId)}`, { notification }); } catch (error) {
    console.error("MAX callback answer", error);
  }
}

async function orgContext() {
  const { data: org, error } = await db.from("organizations").select("id,name,slug").eq("slug", ORG_SLUG).single();
  if (error || !org) throw error || new Error("ORGANIZATION_NOT_FOUND");
  const { data: settings, error: settingsError } = await db.from("bot_settings").select("*").eq("organization_id", org.id).maybeSingle();
  if (settingsError) throw settingsError;
  return { org, settings: settings ?? {} };
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(key: string, value: string) {
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function secureEqual(left: string, right: string) {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index++) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(36));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function phoneNorm(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const ten = digits.length >= 10 ? digits.slice(-10) : digits;
  return ten.length === 10 ? `7${ten}` : null;
}

function displayName(user: MaxUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Клиент";
}

async function ensureIdentity(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, chatId?: number | null) {
  const maxId = Number(maxUser.user_id);
  if (!Number.isSafeInteger(maxId) || maxId <= 0) throw new Error("MAX_USER_REQUIRED");
  const { data: identity, error } = await db.from("messenger_identities").select("*,user:app_users(*)")
    .eq("organization_id", ctx.org.id).eq("provider", "max").eq("provider_user_id", maxId).maybeSingle();
  if (error) throw error;
  const now = new Date().toISOString();
  if (identity?.user) {
    await db.from("messenger_identities").update({
      chat_id: chatId ?? identity.chat_id,
      username: maxUser.username ?? identity.username,
      first_name: maxUser.first_name ?? identity.first_name,
      last_name: maxUser.last_name ?? identity.last_name,
      last_seen_at: now,
      updated_at: now,
    }).eq("id", identity.id);
    await db.from("app_users").update({
      first_name: maxUser.first_name ?? identity.user.first_name,
      last_name: maxUser.last_name ?? identity.user.last_name,
      last_seen_at: now,
    }).eq("id", identity.user.id);
    return identity.user;
  }
  const { data: user, error: userError } = await db.from("app_users").insert({
    first_name: maxUser.first_name ?? null,
    last_name: maxUser.last_name ?? null,
    role: "client",
    role_verified: false,
    onboarding_complete: false,
    phone_verified: false,
    status: "active",
    last_seen_at: now,
  }).select("*").single();
  if (userError) throw userError;
  const { error: identityError } = await db.from("messenger_identities").insert({
    organization_id: ctx.org.id,
    user_id: user.id,
    provider: "max",
    provider_user_id: maxId,
    chat_id: chatId ?? null,
    username: maxUser.username ?? null,
    first_name: maxUser.first_name ?? null,
    last_name: maxUser.last_name ?? null,
    last_seen_at: now,
  });
  if (identityError) throw identityError;
  return user;
}

async function linkPhone(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, currentUser: any, rawPhone: string) {
  const normalized = phoneNorm(rawPhone);
  if (!normalized) throw new Error("PHONE_INVALID");
  const { data: existing, error } = await db.from("app_users").select("*").eq("phone_normalized", normalized).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  const target = existing ?? currentUser;
  const values = {
    phone: rawPhone,
    phone_normalized: normalized,
    phone_verified: true,
    onboarding_complete: true,
    first_name: maxUser.first_name ?? target.first_name,
    last_name: maxUser.last_name ?? target.last_name,
    status: "active",
    last_seen_at: new Date().toISOString(),
  };
  const { data: user, error: updateError } = await db.from("app_users").update(values).eq("id", target.id).select("*").single();
  if (updateError) throw updateError;
  const { error: identityError } = await db.from("messenger_identities").update({ user_id: user.id, updated_at: new Date().toISOString() })
    .eq("organization_id", ctx.org.id).eq("provider", "max").eq("provider_user_id", Number(maxUser.user_id));
  if (identityError) throw identityError;
  return user;
}

async function mainMenu(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, user: any) {
  const greeting = ctx.settings.welcome_message || "🏠 <b>TIMCHENKO.PRO</b>\nИнженерные системы частных домов";
  const prefix = user.phone_verified ? "" : "\n\nДля личного кабинета и сохранения расчётов подтвердите номер телефона.";
  await send(maxUser.user_id, `${greeting}${prefix}`, [
    [callback("💧 Узел ввода воды", "quiz:engineering_nodes")],
    [callback("🏠 Инженерные системы дома", "quiz:home_engineering")],
    [callback("⚡ Электрика", "quiz:electrical")],
    [callback("🏗 Открыть платформу", "menu:portal")],
    [callback("📐 Заказать проектирование", "lead:design"), callback("📞 Консультация", "lead:consultation")],
  ]);
}

async function askPhone(maxUser: MaxUser) {
  await send(maxUser.user_id, "Подтвердите номер телефона из профиля MAX. Он нужен, чтобы связать заявки и объекты в одном кабинете.", [
    [contact("📱 Отправить мой номер")],
    [callback("🏠 Главное меню", "menu:home")],
  ]);
}

async function session(ctx: Awaited<ReturnType<typeof orgContext>>, maxId: number) {
  const { data, error } = await db.from("messenger_sessions").select("*").eq("organization_id", ctx.org.id)
    .eq("provider", "max").eq("provider_user_id", maxId).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (error) throw error;
  return data;
}

async function saveSession(ctx: Awaited<ReturnType<typeof orgContext>>, maxId: number, values: Record<string, unknown>) {
  const now = new Date().toISOString();
  const { error } = await db.from("messenger_sessions").upsert({
    ...values,
    organization_id: ctx.org.id,
    provider: "max",
    provider_user_id: maxId,
    updated_at: now,
    expires_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
  }, { onConflict: "organization_id,provider,provider_user_id" });
  if (error) throw error;
}

async function clearSession(ctx: Awaited<ReturnType<typeof orgContext>>, maxId: number) {
  const { error } = await db.from("messenger_sessions").delete().eq("organization_id", ctx.org.id).eq("provider", "max").eq("provider_user_id", maxId);
  if (error) throw error;
}

async function quizQuestions(quizId: string) {
  const { data, error } = await db.from("quiz_questions").select("id,key,prompt,input_type,required,sort_order,placeholder,min_value,max_value,quiz_options(id,key,label,value,sort_order)")
    .eq("quiz_id", quizId).eq("is_active", true).order("sort_order");
  if (error) throw error;
  return (data ?? []).map((question: any) => ({
    ...question,
    quiz_options: (question.quiz_options ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));
}

async function askQuestion(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, current: any) {
  const questions = await quizQuestions(current.context.quiz_id);
  const question = questions.find((item: any) => item.id === current.current_question_id) ?? questions[0];
  if (!question) return await finishQuiz(ctx, maxUser, current);
  const answers = current.answers ?? {};
  const options = question.quiz_options ?? [];
  let buttons: Button[][] = [];
  if (question.input_type === "single") {
    buttons = options.map((option: any) => [callback(option.label, `qa:${question.id}:${option.id}`)]);
  } else if (question.input_type === "multi") {
    const selected = Array.isArray(answers[question.key]) ? answers[question.key] : [];
    buttons = options.map((option: any) => [callback(`${selected.includes(option.value ?? option.key) ? "✓ " : ""}${option.label}`, `qm:${question.id}:${option.id}`)]);
    buttons.push([callback("Готово →", `qn:${question.id}`)]);
  } else if (!question.required) {
    buttons = [[callback("Пропустить →", `qs:${question.id}`)]];
  }
  buttons.push([callback("Отменить", "quiz:cancel")]);
  const hint = question.input_type === "number" ? "\n\nОтправьте число сообщением." : question.input_type === "text" ? "\n\nНапишите ответ сообщением." : question.input_type === "multi" ? "\n\nМожно выбрать несколько вариантов, затем нажмите «Готово»." : "";
  await send(maxUser.user_id, `<b>${current.context.quiz_title}</b>\n\n${question.prompt}${hint}`, buttons);
}

async function startQuiz(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, user: any, slug: string) {
  if (!user.phone_verified) return await askPhone(maxUser);
  const { data: quiz, error } = await db.from("quiz_definitions").select("id,slug,title,completion_message").eq("organization_id", ctx.org.id)
    .eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw error;
  if (!quiz) return await send(maxUser.user_id, "Этот расчёт пока недоступен.", [[callback("🏠 Главное меню", "menu:home")]]);
  const questions = await quizQuestions(quiz.id);
  if (!questions.length) return await send(maxUser.user_id, "В анкете пока нет вопросов.", [[callback("🏠 Главное меню", "menu:home")]]);
  await saveSession(ctx, maxUser.user_id, {
    user_id: user.id,
    flow: "quiz",
    step_key: questions[0].key,
    current_question_id: questions[0].id,
    answers: {},
    history: [],
    context: { quiz_id: quiz.id, quiz_slug: quiz.slug, quiz_title: quiz.title, completion_message: quiz.completion_message },
    started_at: new Date().toISOString(),
  });
  await askQuestion(ctx, maxUser, await session(ctx, maxUser.user_id));
}

async function advanceQuiz(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, current: any, answers: Record<string, unknown>) {
  const questions = await quizQuestions(current.context.quiz_id);
  const index = questions.findIndex((item: any) => item.id === current.current_question_id);
  const next = questions[index + 1];
  if (!next) return await finishQuiz(ctx, maxUser, { ...current, answers });
  await saveSession(ctx, maxUser.user_id, { ...current, answers, step_key: next.key, current_question_id: next.id });
  await askQuestion(ctx, maxUser, await session(ctx, maxUser.user_id));
}

async function finishQuiz(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, current: any) {
  const { data: identity, error: identityError } = await db.from("messenger_identities").select("user_id,user:app_users(*)")
    .eq("organization_id", ctx.org.id).eq("provider", "max").eq("provider_user_id", maxUser.user_id).single();
  if (identityError) throw identityError;
  const user: any = identity.user;
  const answers = current.answers ?? {};
  const now = new Date().toISOString();
  const { data: lead, error: leadError } = await db.from("leads").insert({
    organization_id: ctx.org.id,
    source: "max_quiz",
    name: displayName(maxUser),
    phone: user.phone,
    status: "new",
    pipeline_stage: "new",
    app_user_id: user.id,
    quiz_type: current.context.quiz_slug,
    payload: { provider: "max", max_user_id: maxUser.user_id, answers, submitted_at: now },
  }).select("id").single();
  if (leadError) throw leadError;
  const { error: submissionError } = await db.from("quiz_submissions").insert({
    organization_id: ctx.org.id,
    user_id: user.id,
    lead_id: lead.id,
    quiz_type: current.context.quiz_slug,
    source: "max_bot",
    answers,
    contact_name: displayName(maxUser),
    contact_phone: user.phone,
    preferred_channel: "max",
    status: "new",
  });
  if (submissionError) throw submissionError;
  await clearSession(ctx, maxUser.user_id);
  await send(maxUser.user_id, current.context.completion_message || "✅ Спасибо! Расчёт принят. Инженер изучит ответы и свяжется с вами.", [
    [callback("🏗 Открыть платформу", "menu:portal")],
    [callback("🏠 Главное меню", "menu:home")],
  ]);
}

async function selectOption(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, questionId: string, optionId: string, multi: boolean) {
  const current = await session(ctx, maxUser.user_id);
  if (!current || current.current_question_id !== questionId) return await send(maxUser.user_id, "Анкета устарела. Начните расчёт заново.", [[callback("🏠 Главное меню", "menu:home")]]);
  const { data: question, error } = await db.from("quiz_questions").select("id,key,input_type,quiz_options(id,key,label,value)").eq("id", questionId).single();
  if (error) throw error;
  const option = (question.quiz_options ?? []).find((item: any) => item.id === optionId);
  if (!option) throw new Error("QUIZ_OPTION_NOT_FOUND");
  const value = option.value ?? option.key;
  const answers = { ...(current.answers ?? {}) };
  if (multi) {
    const selected = new Set(Array.isArray(answers[question.key]) ? answers[question.key] as string[] : []);
    selected.has(value) ? selected.delete(value) : selected.add(value);
    answers[question.key] = Array.from(selected);
    await saveSession(ctx, maxUser.user_id, { ...current, answers });
    return option.label;
  }
  answers[question.key] = value;
  await advanceQuiz(ctx, maxUser, current, answers);
  return option.label;
}

async function portal(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, user: any) {
  if (!user.phone_verified) return await askPhone(maxUser);
  const token = randomToken();
  const hours = Math.max(1, Math.min(Number(ctx.settings.config?.portal_token_hours ?? 12), 72));
  const { error } = await db.from("client_portal_tokens").insert({
    organization_id: ctx.org.id,
    user_id: user.id,
    token_hash: await sha256(token),
    expires_at: new Date(Date.now() + hours * 3600_000).toISOString(),
    metadata: { source: "max_bot", max_user_id: maxUser.user_id },
  });
  if (error) throw error;
  const base = String(ctx.settings.miniapp_url || "").trim();
  if (!base) return await send(maxUser.user_id, "Платформа пока не опубликована.");
  const url = `${base}${base.includes("#") ? "&" : "#"}${new URLSearchParams({ token }).toString()}`;
  const { count } = await db.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", ctx.org.id)
    .or(`client_user_id.eq.${user.id},client_phone_normalized.eq.${user.phone_normalized}`);
  await send(maxUser.user_id, `🏗 <b>Личный кабинет</b>\n\nОбъектов найдено: <b>${count ?? 0}</b>`, [[link("🏗 Открыть платформу", url)], [callback("🏠 Главное меню", "menu:home")]]);
}

async function directLead(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, user: any, kind: "design" | "consultation") {
  if (!user.phone_verified) return await askPhone(maxUser);
  const label = kind === "design" ? "Проектирование инженерных систем" : "Консультация инженера";
  const { error } = await db.from("leads").insert({
    organization_id: ctx.org.id,
    source: `max_${kind}`,
    name: displayName(maxUser),
    phone: user.phone,
    status: "new",
    pipeline_stage: "new",
    app_user_id: user.id,
    quiz_type: kind === "design" ? "design" : null,
    comment: label,
    payload: { provider: "max", max_user_id: maxUser.user_id, request_type: kind },
  });
  if (error) throw error;
  await send(maxUser.user_id, `✅ Заявка «${label}» принята. Мы свяжемся с вами.`, [[callback("🏠 Главное меню", "menu:home")]]);
}

async function contactPhone(update: any, senderId: number) {
  const attachment = update?.message?.body?.attachments?.find((item: any) => item?.type === "contact");
  if (!attachment) return "";
  const info = attachment?.payload?.max_info ?? {};
  if (info.user_id && Number(info.user_id) !== senderId) throw new Error("CONTACT_MUST_BELONG_TO_SENDER");
  const vcard = String(attachment?.payload?.vcf_info ?? "");
  const receivedHash = String(attachment?.payload?.hash ?? "");
  if (!vcard || !receivedHash || !secureEqual(await hmacHex(MAX_TOKEN, vcard), receivedHash)) throw new Error("CONTACT_SIGNATURE_INVALID");
  const direct = info.phone ?? info.phone_number ?? attachment?.payload?.phone;
  if (direct) return String(direct);
  return vcard.match(/TEL[^:]*:([^\r\n]+)/i)?.[1]?.trim() ?? "";
}

async function textAnswer(ctx: Awaited<ReturnType<typeof orgContext>>, maxUser: MaxUser, text: string) {
  const current = await session(ctx, maxUser.user_id);
  if (!current || current.flow !== "quiz") return false;
  const { data: question, error } = await db.from("quiz_questions").select("id,key,input_type,required,min_value,max_value").eq("id", current.current_question_id).single();
  if (error) throw error;
  if (!["text", "number"].includes(question.input_type)) return false;
  let value: unknown = text.trim();
  if (question.input_type === "number") {
    const number = Number(String(value).replace(",", "."));
    if (!Number.isFinite(number)) { await send(maxUser.user_id, "Введите число, например: 180"); return true; }
    if (question.min_value != null && number < Number(question.min_value)) { await send(maxUser.user_id, `Минимальное значение: ${question.min_value}`); return true; }
    if (question.max_value != null && number > Number(question.max_value)) { await send(maxUser.user_id, `Максимальное значение: ${question.max_value}`); return true; }
    value = number;
  }
  await advanceQuiz(ctx, maxUser, current, { ...(current.answers ?? {}), [question.key]: value });
  return true;
}

function eventKey(update: any) {
  return String(update?.callback?.callback_id || update?.message?.body?.mid || update?.message?.body?.message_id || `${update?.update_type}:${update?.timestamp}:${update?.user?.user_id || update?.callback?.user?.user_id || update?.message?.sender?.user_id || "0"}`);
}

async function markEvent(update: any) {
  const { error } = await db.from("messenger_events").insert({ provider: "max", event_key: eventKey(update), event_type: String(update?.update_type || "unknown") });
  if (error?.code === "23505") return false;
  if (error) throw error;
  return true;
}

async function handleUpdate(update: any) {
  if (!await markEvent(update)) return;
  const ctx = await orgContext();
  const maxUser: MaxUser = update?.callback?.user ?? update?.message?.sender ?? update?.user;
  if (!maxUser?.user_id) return;
  let user = await ensureIdentity(ctx, maxUser, update?.chat_id ?? update?.message?.recipient?.chat_id ?? null);

  if (update.update_type === "bot_started") return await mainMenu(ctx, maxUser, user);

  if (update.update_type === "message_created") {
    let phone = "";
    try { phone = await contactPhone(update, maxUser.user_id); } catch (error) {
      console.error("MAX contact validation", error);
      await send(maxUser.user_id, "Не удалось подтвердить контакт. Нажмите кнопку «Отправить мой номер» ещё раз.", [[contact("📱 Отправить мой номер")]]);
      return;
    }
    if (phone) {
      user = await linkPhone(ctx, maxUser, user, phone);
      await send(maxUser.user_id, "✅ Номер подтверждён. Профиль MAX связан с платформой.");
      return await mainMenu(ctx, maxUser, user);
    }
    const text = String(update?.message?.body?.text ?? "").trim();
    if (["/start", "/menu", "меню", "главное меню"].includes(text.toLowerCase())) return await mainMenu(ctx, maxUser, user);
    if (["/cabinet", "кабинет", "платформа"].includes(text.toLowerCase())) return await portal(ctx, maxUser, user);
    if (await textAnswer(ctx, maxUser, text)) return;
    return await mainMenu(ctx, maxUser, user);
  }

  if (update.update_type === "message_callback") {
    const payload = String(update?.callback?.payload ?? "");
    const callbackId = String(update?.callback?.callback_id ?? "");
    if (payload === "menu:home") { await answerCallback(callbackId); return await mainMenu(ctx, maxUser, user); }
    if (payload === "menu:portal") { await answerCallback(callbackId, "Открываю кабинет"); return await portal(ctx, maxUser, user); }
    if (payload === "lead:design") { await answerCallback(callbackId); return await directLead(ctx, maxUser, user, "design"); }
    if (payload === "lead:consultation") { await answerCallback(callbackId); return await directLead(ctx, maxUser, user, "consultation"); }
    if (payload === "quiz:cancel") { await clearSession(ctx, maxUser.user_id); await answerCallback(callbackId, "Анкета отменена"); return await mainMenu(ctx, maxUser, user); }
    if (payload.startsWith("quiz:")) { await answerCallback(callbackId); return await startQuiz(ctx, maxUser, user, payload.slice(5)); }
    if (payload.startsWith("qa:") || payload.startsWith("qm:")) {
      const [kind, questionId, optionId] = payload.split(":");
      const label = await selectOption(ctx, maxUser, questionId, optionId, kind === "qm");
      return await answerCallback(callbackId, kind === "qm" ? `Выбор: ${label}` : "Ответ принят");
    }
    if (payload.startsWith("qn:") || payload.startsWith("qs:")) {
      const current = await session(ctx, maxUser.user_id);
      if (!current) return await answerCallback(callbackId, "Анкета устарела");
      const { data: question, error } = await db.from("quiz_questions").select("id,key,required").eq("id", payload.slice(3)).single();
      if (error) throw error;
      const value = current.answers?.[question.key];
      if (payload.startsWith("qn:") && question.required && (!Array.isArray(value) || !value.length)) return await answerCallback(callbackId, "Выберите хотя бы один вариант");
      await answerCallback(callbackId);
      return await advanceQuiz(ctx, maxUser, current, { ...(current.answers ?? {}), [question.key]: value ?? null });
    }
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "GET") return ok({ ok: true, service: "timchenko-max-bot-v1", configured: Boolean(MAX_TOKEN && WEBHOOK_SECRET) });
  if (request.method !== "POST") return ok({ error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_KEY || !MAX_TOKEN) return ok({ error: "server_not_configured" }, 503);
  if (WEBHOOK_SECRET && request.headers.get("x-max-bot-api-secret") !== WEBHOOK_SECRET) return ok({ error: "invalid_webhook_secret" }, 401);
  try {
    const update = await request.json();
    await handleUpdate(update);
    return ok({ ok: true });
  } catch (error) {
    console.error("MAX webhook", error);
    return ok({ error: error instanceof Error ? error.message : "internal_error" }, 500);
  }
});

