import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const botToken =
  Deno.env.get("TELEGRAM_BOT_TOKEN") ||
  Deno.env.get("BOT_TOKEN") ||
  Deno.env.get("TELEGRAM_TOKEN") ||
  "";
const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, apikey",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "cache-control": "no-store",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
const clean = (value: unknown, max = 1200) => String(value ?? "").trim().slice(0, max);
const validPhone = (value: string) => value.replace(/\D/g, "").length >= 10;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function organizationId() {
  const { data, error } = await db.from("organizations").select("id").eq("slug", "timchenko-pro").eq("status", "active").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("TIMCHENKO_ORGANIZATION_NOT_FOUND");
  return data.id as string;
}

async function notifyAdmins(text: string) {
  if (!botToken) return false;
  const { data } = await db.from("platform_admins").select("telegram_user_id").eq("is_active", true);
  const ids = (data ?? []).map((item: { telegram_user_id?: number }) => item.telegram_user_id).filter(Boolean);
  const results = await Promise.all(
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
  return results.some(Boolean);
}

async function handlePost(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (clean(body.website, 80)) return json({ ok: true });
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 80);
  const message = clean(body.message, 2000);
  const consent = body.consent === true || body.consent === "true" || body.consent === "on";
  if (!name || !validPhone(phone) || !message) return json({ error: "NAME_PHONE_MESSAGE_REQUIRED" }, 400);
  if (!consent) return json({ error: "CONSENT_REQUIRED" }, 400);

  const requestedSession = clean(body.session_id, 80);
  const sessionId = uuidPattern.test(requestedSession) ? requestedSession : crypto.randomUUID();
  const orgId = await organizationId();

  const { data: existing } = await db
    .from("leads")
    .select("id")
    .eq("organization_id", orgId)
    .eq("source", "website_chat")
    .contains("payload", { chat_session_id: sessionId })
    .limit(1)
    .maybeSingle();

  let leadId = existing?.id ?? null;
  if (!leadId) {
    const { data: lead, error } = await db
      .from("leads")
      .insert({
        organization_id: orgId,
        source: "website_chat",
        name,
        phone,
        quiz_type: "other",
        status: "new",
        pipeline_stage: "new",
        comment: message,
        payload: {
          chat_session_id: sessionId,
          page_url: clean(body.page_url, 500) || null,
          referrer: clean(body.referrer, 500) || null,
          preferred_channel: "telegram",
          consent_version: clean(body.consent_version, 80) || null,
        },
      })
      .select("id")
      .single();
    if (error) throw error;
    leadId = lead.id;
  } else {
    const { error } = await db.from("leads").update({
      name,
      phone,
      comment: message,
      payload: {
        chat_session_id: sessionId,
        page_url: clean(body.page_url, 500) || null,
        referrer: clean(body.referrer, 500) || null,
        preferred_channel: "telegram",
        consent_version: clean(body.consent_version, 80) || null,
      },
    }).eq("id", leadId);
    if (error) throw error;
  }

  const { data: saved, error: messageError } = await db
    .from("messages")
    .insert({
      project_id: null,
      user_id: null,
      direction: "user",
      channel: "website",
      body: message,
      metadata: {
        session_id: sessionId,
        lead_id: leadId,
        name,
        phone,
        page_url: clean(body.page_url, 500) || null,
      },
    })
    .select("id")
    .single();
  if (messageError) throw messageError;

  const queuedAt = new Date().toISOString();
  const { error: queueError } = await db.from("lead_notifications").upsert({
    lead_id: leadId,
    status: "pending",
    notified_at: null,
    last_error: null,
    updated_at: queuedAt,
  });
  if (queueError) throw queueError;

  const notified = await notifyAdmins(
    `💬 Чат сайта Timchenko.pro\n${name}\n${phone}\n\n${message}\n\n#sitechat:${sessionId}\nОтветьте на это сообщение — ответ появится у клиента на сайте.`,
  );
  if (notified) {
    await db.from("lead_notifications").update({ status: "sent", notified_at: queuedAt, updated_at: queuedAt }).eq("lead_id", leadId);
  }
  return json({ ok: true, session_id: sessionId, message_id: saved.id, lead_id: leadId, telegram_notified: notified, telegram_queued: !notified });
}

async function handleGet(req: Request) {
  const url = new URL(req.url);
  const sessionId = clean(url.searchParams.get("session_id"), 80);
  const after = clean(url.searchParams.get("after"), 80);
  if (!uuidPattern.test(sessionId)) return json({ error: "INVALID_SESSION" }, 400);

  let afterDate: string | null = null;
  if (uuidPattern.test(after)) {
    const { data } = await db.from("messages").select("created_at").eq("id", after).maybeSingle();
    afterDate = data?.created_at ?? null;
  }

  let query = db
    .from("messages")
    .select("id,body,created_at,direction")
    .eq("channel", "website")
    .contains("metadata", { session_id: sessionId })
    .in("direction", ["manager", "assistant"])
    .order("created_at", { ascending: true })
    .limit(30);
  if (afterDate) query = query.gt("created_at", afterDate);
  const { data, error } = await query;
  if (error) throw error;

  const formatter = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
  return json({
    ok: true,
    messages: (data ?? []).map((item) => ({
      id: item.id,
      text: item.body,
      time: formatter.format(new Date(item.created_at)),
    })),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  try {
    if (!supabaseUrl || !serviceKey) return json({ error: "SERVER_NOT_CONFIGURED" }, 503);
    if (req.method === "POST") return await handlePost(req);
    if (req.method === "GET") return await handleGet(req);
    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
