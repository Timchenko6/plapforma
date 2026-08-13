import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const botToken =
  Deno.env.get("TELEGRAM_BOT_TOKEN") ||
  Deno.env.get("BOT_TOKEN") ||
  Deno.env.get("TELEGRAM_TOKEN") ||
  "";

const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, apikey",
  "access-control-allow-methods": "POST,OPTIONS",
  "cache-control": "no-store",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });

const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);
const phoneIsValid = (value: string) => value.replace(/\D/g, "").length >= 10;
const safeFileName = (value: string) =>
  value.replace(/[^0-9A-Za-zА-Яа-я._-]+/g, "_").replace(/^_+|_+$/g, "").slice(-140) || "file";

const quizTypes: Record<string, string> = {
  water: "water_node",
  water_node: "water_node",
  engineering_nodes: "water_node",
  engineering: "engineering",
  engineering_calculator: "engineering",
  home_engineering: "engineering",
  electric: "electric",
  electrical: "electric",
  live_chat: "other",
  other: "other",
};

const allowedExtensions = new Set([
  ".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png", ".webp", ".heic",
  ".zip", ".rar", ".7z", ".doc", ".docx", ".xls", ".xlsx",
]);

type Input = Record<string, unknown>;

function maybeJson(value: unknown) {
  if (typeof value !== "string") return value;
  const source = value.trim();
  if (!source || (!source.startsWith("{") && !source.startsWith("["))) return value;
  try {
    return JSON.parse(source);
  } catch {
    return value;
  }
}

async function readInput(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    const body = (await req.json().catch(() => ({}))) as Input;
    return { body, files: [] as File[] };
  }

  const form = await req.formData();
  const body: Input = {};
  const files: File[] = [];
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      if (value.size > 0) files.push(value);
      continue;
    }
    body[key.replace(/\[\]$/, "")] = maybeJson(value);
  }
  return { body, files };
}

function buildAnswers(body: Input) {
  const source = maybeJson(body.answers);
  const answers = source && typeof source === "object" && !Array.isArray(source) ? { ...source } : {};
  const calculator = maybeJson(body.calculator_snapshot);
  if (calculator && typeof calculator === "object" && !Array.isArray(calculator)) {
    Object.assign(answers, calculator);
  }
  for (const key of ["area_m2", "floors", "bathrooms", "systems", "total", "range", "service", "stage"]) {
    if (body[key] !== undefined && body[key] !== "") answers[key] = maybeJson(body[key]);
  }
  return answers;
}

async function notifyAdmins(text: string) {
  if (!botToken) return false;
  const { data } = await db.from("platform_admins").select("telegram_user_id").eq("is_active", true);
  const ids = (data ?? []).map((item: { telegram_user_id?: number }) => item.telegram_user_id).filter(Boolean);
  if (!ids.length) return false;
  const delivered = await Promise.all(
    ids.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
        return response.ok;
      } catch {
        return false;
      }
    }),
  );
  return delivered.some(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: true, service: "timchenko-public-lead-api", version: 2 });

  try {
    if (!supabaseUrl || !serviceKey) return json({ error: "SERVER_NOT_CONFIGURED" }, 503);
    const { body, files } = await readInput(req);
    if (clean(body.website, 80)) return json({ ok: true });

    const name = clean(body.name, 120);
    const phone = clean(body.phone, 80);
    const city = clean(body.city, 120) || null;
    const preferredChannel = clean(body.preferred_channel, 40) || "Телефон";
    const rawQuizType = clean(body.quiz_type, 40).toLowerCase();
    const quizType = quizTypes[rawQuizType] || "other";
    if (!name || !phoneIsValid(phone)) return json({ error: "NAME_AND_PHONE_REQUIRED" }, 400);
    if (files.length > 5) return json({ error: "TOO_MANY_FILES" }, 413);
    if (files.some((file) => file.size > 20 * 1024 * 1024)) return json({ error: "FILE_TOO_LARGE" }, 413);
    if (files.reduce((total, file) => total + file.size, 0) > 40 * 1024 * 1024) {
      return json({ error: "FILES_TOTAL_TOO_LARGE" }, 413);
    }

    const answers = buildAnswers(body);
    if (JSON.stringify(answers).length > 24_000) return json({ error: "ANSWERS_TOO_LARGE" }, 413);

    const { data: organization, error: organizationError } = await db
      .from("organizations")
      .select("id")
      .eq("slug", "timchenko-pro")
      .eq("status", "active")
      .maybeSingle();
    if (organizationError) throw organizationError;
    if (!organization) throw new Error("TIMCHENKO_ORGANIZATION_NOT_FOUND");

    const payload: Record<string, unknown> = {
      answers,
      preferred_channel: preferredChannel,
      page_url: clean(body.page_url, 500) || null,
      referrer: clean(body.referrer, 500) || null,
      form: clean(body.form, 60) || "website_quiz",
      area_m2: body.area_m2 == null ? null : Number(body.area_m2) || null,
      stage: clean(body.stage, 120) || null,
      submitted_at: new Date().toISOString(),
      consent: body.consent === true || body.consent === "true" || body.consent === "on",
      consent_version: clean(body.consent_version, 80) || null,
    };

    const { data: lead, error: leadError } = await db
      .from("leads")
      .insert({
        source: "website",
        name,
        phone,
        city,
        quiz_type: quizType,
        payload,
        status: "new",
        pipeline_stage: "new",
        organization_id: organization.id,
        comment: clean(body.comment ?? body.message, 1200) || null,
      })
      .select("id")
      .single();
    if (leadError) throw leadError;

    const uploaded: Array<Record<string, unknown>> = [];
    const uploadErrors: string[] = [];
    for (const file of files) {
      const dot = file.name.lastIndexOf(".");
      const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
      if (!allowedExtensions.has(extension)) {
        uploadErrors.push(`${file.name}: неподдерживаемый формат`);
        continue;
      }
      const path = `lead-intake/${organization.id}/${lead.id}/${crypto.randomUUID()}_${safeFileName(file.name)}`;
      const { error } = await db.storage.from("project-documents").upload(path, file, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        uploadErrors.push(`${file.name}: ошибка загрузки`);
        continue;
      }
      uploaded.push({
        bucket: "project-documents",
        path,
        name: file.name,
        size: file.size,
        mime_type: file.type || "application/octet-stream",
      });
    }

    if (uploaded.length || uploadErrors.length) {
      payload.files = uploaded;
      payload.upload_errors = uploadErrors;
      const { error } = await db.from("leads").update({ payload }).eq("id", lead.id);
      if (error) throw error;
    }

    const { data: submission, error: submissionError } = await db
      .from("quiz_submissions")
      .insert({
        lead_id: lead.id,
        quiz_type: quizType,
        source: "website",
        answers: { ...answers, files: uploaded.map(({ name, size, mime_type }) => ({ name, size, mime_type })) },
        contact_name: name,
        contact_phone: phone,
        city,
        preferred_channel: preferredChannel,
        status: "new",
        organization_id: organization.id,
      })
      .select("id")
      .single();
    if (submissionError) throw submissionError;

    const queuedAt = new Date().toISOString();
    const { error: queueError } = await db.from("lead_notifications").upsert({
      lead_id: lead.id,
      status: "pending",
      notified_at: null,
      last_error: null,
      updated_at: queuedAt,
    });
    if (queueError) throw queueError;

    const labels: Record<string, string> = {
      water_node: "Узел водоснабжения",
      engineering: "Инженерные системы",
      electric: "Электрика",
      other: "Заявка с сайта",
    };
    const fileLine = uploaded.length ? `\nФайлы: ${uploaded.length}` : "";
    const notified = await notifyAdmins(
      `🔧 Новая заявка Timchenko.pro\n${labels[quizType] || quizType}\n${name}\n${phone}${city ? `\n${city}` : ""}\nКанал: ${preferredChannel}${fileLine}`,
    );
    if (notified) {
      await db.from("lead_notifications").update({ status: "sent", notified_at: queuedAt, updated_at: queuedAt }).eq("lead_id", lead.id);
    }

    return json({
      ok: true,
      lead_id: lead.id,
      submission_id: submission.id,
      telegram_notified: notified,
      telegram_queued: !notified,
      uploaded_files: uploaded.length,
      upload_errors: uploadErrors,
    });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
