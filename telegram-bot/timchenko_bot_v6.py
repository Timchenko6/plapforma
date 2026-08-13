#!/usr/bin/env python3
"""TimchenkoBot v6.1 — client Telegram gateway for Timchenko.pro.

Client rules:
- mandatory registration with verified Telegram contact;
- phone is the business identifier for linking a client to one or more objects;
- Telegram identity + short-lived portal token remain the security boundary;
- first menu item reuses the existing web calculator for the water inlet node;
- home-engineering and electrical flows are quizzes for preparing a commercial proposal;
- every flow has Back / Home navigation;
- design intake accepts plans, PDFs, DWG/DXF, images and design-project files at every step;
- bottom Telegram Menu button exposes the main commands;
- stale webhook is removed before long polling.
"""

import asyncio
import hashlib
import html
import json
import logging
import mimetypes
import os
import re
import secrets
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlencode

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    BotCommand,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    MenuButtonCommands,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    WebAppInfo,
)

ENV_FILE = os.getenv("ENV_FILE", "/opt/TimchenkoBot/.env")
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "").strip()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
ORG_SLUG = os.getenv("ORG_SLUG", "timchenko-pro").strip()
ENV_MINIAPP_URL = os.getenv("MINIAPP_URL", "").strip()

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is empty")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY is empty")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("timchenko_bot_v6")

bot = Bot(BOT_TOKEN)
dp = Dispatcher()

HOME = "🏠 Главная"
BACK = "⬅️ Назад"
SKIP = "Пропустить →"
UPLOAD_HINT = "📎 На любом шаге можно отправить план, PDF, DWG/DXF, фото или дизайн-проект через скрепку Telegram."

ORG_ID: Optional[str] = None
BOT_SETTINGS: dict[str, Any] = {}
CONFIG_LOADED_AT = 0.0
CONFIG_TTL_SECONDS = 30

QUIZ_TYPE_MAP = {
    "home_engineering": "engineering",
    "electrical": "electric",
    "engineering_nodes": "water_node",
}
ALLOWED_UPLOAD_EXTENSIONS = {
    ".pdf", ".dwg", ".dxf", ".jpg", ".jpeg", ".png", ".webp", ".heic",
    ".zip", ".rar", ".7z", ".doc", ".docx", ".xls", ".xlsx",
}
MAX_UPLOAD_BYTES = 20 * 1024 * 1024


def _headers(prefer: Optional[str] = None, content_type: str = "application/json") -> dict[str, str]:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": content_type,
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def db_request(method: str, table: str, *, params: Optional[dict[str, str]] = None, data: Any = None, prefer: Optional[str] = None) -> Any:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.request(method, url, headers=_headers(prefer), params=params or {}, json=data)
    if response.status_code >= 400:
        log.error("Supabase %s %s -> %s %s", method, table, response.status_code, response.text[:1200])
        response.raise_for_status()
    if not response.text:
        return None
    return response.json()


async def db_get(table: str, params: Optional[dict[str, str]] = None) -> list[dict]:
    return await db_request("GET", table, params=params) or []


async def db_insert(table: str, data: dict | list[dict], return_rows: bool = True) -> list[dict]:
    prefer = "return=representation" if return_rows else "return=minimal"
    return await db_request("POST", table, data=data, prefer=prefer) or []


async def db_patch(table: str, params: dict[str, str], data: dict, return_rows: bool = True) -> list[dict]:
    prefer = "return=representation" if return_rows else "return=minimal"
    return await db_request("PATCH", table, params=params, data=data, prefer=prefer) or []


async def db_upsert(table: str, data: dict, *, on_conflict: str, return_rows: bool = True) -> list[dict]:
    prefer = "resolution=merge-duplicates," + ("return=representation" if return_rows else "return=minimal")
    return await db_request("POST", table, params={"on_conflict": on_conflict}, data=data, prefer=prefer) or []


async def storage_upload(bucket: str, path: str, content: bytes, content_type: str) -> None:
    safe = "/".join(part for part in path.split("/") if part)
    url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{safe}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "false",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, content=content)
    if r.status_code >= 400:
        log.error("Storage upload -> %s %s", r.status_code, r.text[:1000])
        r.raise_for_status()


async def load_runtime_config(force: bool = False) -> None:
    global ORG_ID, BOT_SETTINGS, CONFIG_LOADED_AT
    now = time.monotonic()
    if not force and ORG_ID and (now - CONFIG_LOADED_AT) < CONFIG_TTL_SECONDS:
        return
    org = await db_get("organizations", {"slug": f"eq.{ORG_SLUG}", "select": "id,name,slug", "limit": "1"})
    if not org:
        raise RuntimeError(f"Organization {ORG_SLUG!r} not found")
    ORG_ID = org[0]["id"]
    settings = await db_get("bot_settings", {"organization_id": f"eq.{ORG_ID}", "select": "*", "limit": "1"})
    BOT_SETTINGS = settings[0] if settings else {}
    CONFIG_LOADED_AT = now


def esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""))


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        digits = "7" + digits
    elif len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    return digits or None


def as_int(value: Any) -> Optional[int]:
    if value is None or value == "":
        return None
    m = re.search(r"\d+", str(value))
    return int(m.group()) if m else None


def nice_value(value: Any) -> str:
    if value is None:
        return "—"
    if isinstance(value, list):
        return ", ".join(str(x) for x in value) if value else "—"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def inline_nav(*, back: bool = True, home: bool = True, skip: bool = False) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    if skip:
        rows.append([InlineKeyboardButton(text=SKIP, callback_data="nav:skip")])
    nav: list[InlineKeyboardButton] = []
    if back:
        nav.append(InlineKeyboardButton(text=BACK, callback_data="nav:back"))
    if home:
        nav.append(InlineKeyboardButton(text=HOME, callback_data="nav:home"))
    if nav:
        rows.append(nav)
    return InlineKeyboardMarkup(inline_keyboard=rows)


def reply_nav(*, with_phone: bool = False) -> ReplyKeyboardMarkup:
    rows: list[list[KeyboardButton]] = []
    if with_phone:
        rows.append([KeyboardButton(text="📱 Поделиться номером", request_contact=True)])
    rows.append([KeyboardButton(text=BACK), KeyboardButton(text=HOME)])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


async def notify_admin(text: str) -> bool:
    if not ADMIN_CHAT_ID:
        return False
    try:
        await bot.send_message(int(ADMIN_CHAT_ID), text, parse_mode="HTML")
        return True
    except Exception:
        log.exception("admin notification failed")
        return False


def queued_lead_text(lead: dict[str, Any]) -> str:
    payload = lead.get("payload") if isinstance(lead.get("payload"), dict) else {}
    if lead.get("source") == "website_chat":
        session_id = str(payload.get("chat_session_id") or "")
        marker = f"#sitechat:{session_id}" if session_id else ""
        return (
            "💬 <b>Чат сайта Timchenko.pro</b>\n"
            f"{esc(lead.get('name') or 'Клиент')}\n"
            f"{esc(lead.get('phone') or '—')}\n\n"
            f"{esc(lead.get('comment') or 'Новое сообщение')}\n\n"
            f"<code>{esc(marker)}</code>\n"
            "Ответьте на это сообщение — ответ появится у клиента на сайте."
        )

    labels = {
        "water_node": "Узел водоснабжения",
        "engineering": "Инженерные системы",
        "electric": "Электрика",
        "other": "Заявка с сайта",
    }
    files = payload.get("files") if isinstance(payload.get("files"), list) else []
    city = f"\n{esc(lead.get('city'))}" if lead.get("city") else ""
    file_line = f"\nФайлы: {len(files)}" if files else ""
    return (
        "🔧 <b>Новая заявка Timchenko.pro</b>\n"
        f"{esc(labels.get(lead.get('quiz_type'), lead.get('quiz_type') or 'Заявка с сайта'))}\n"
        f"{esc(lead.get('name') or 'Клиент')}\n"
        f"{esc(lead.get('phone') or '—')}{city}{file_line}\n"
        f"Lead: <code>{esc(lead.get('id'))}</code>"
    )


async def process_lead_notifications() -> None:
    """Deliver website leads through the bot that already owns BOT_TOKEN."""
    while True:
        try:
            if not ADMIN_CHAT_ID:
                await asyncio.sleep(30)
                continue
            pending = await db_get("lead_notifications", {
                "status": "eq.pending",
                "select": "lead_id",
                "order": "created_at.asc",
                "limit": "10",
            })
            for item in pending:
                lead_id = item.get("lead_id")
                rows = await db_get("leads", {
                    "id": f"eq.{lead_id}",
                    "select": "id,source,name,phone,city,quiz_type,comment,payload",
                    "limit": "1",
                })
                now = datetime.now(timezone.utc).isoformat()
                if not rows:
                    await db_patch("lead_notifications", {"lead_id": f"eq.{lead_id}"}, {
                        "status": "failed", "last_error": "lead not found", "updated_at": now,
                    }, return_rows=False)
                    continue
                delivered = await notify_admin(queued_lead_text(rows[0]))
                await db_patch("lead_notifications", {"lead_id": f"eq.{lead_id}"}, {
                    "status": "sent" if delivered else "pending",
                    "notified_at": now if delivered else None,
                    "last_error": None if delivered else "telegram delivery failed",
                    "updated_at": now,
                }, return_rows=False)
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("lead notification worker failed")
        await asyncio.sleep(12)


async def setup_bot_menu() -> None:
    commands = [
        BotCommand(command="menu", description="Главное меню"),
        BotCommand(command="cabinet", description="Открыть кабинет"),
        BotCommand(command="design", description="Заказать проектирование"),
        BotCommand(command="consultation", description="Записаться на консультацию"),
        BotCommand(command="start", description="Перезапустить диалог"),
    ]
    await bot.set_my_commands(commands)
    menu_button = MenuButtonCommands()
    await bot.set_chat_menu_button(menu_button=menu_button)
    admins = await db_get("platform_admins", {
        "is_active": "eq.true", "select": "telegram_user_id",
    })
    for admin in admins:
        await bot.set_chat_menu_button(
            chat_id=int(admin["telegram_user_id"]),
            menu_button=menu_button,
        )


async def get_user(tg_id: int) -> Optional[dict]:
    rows = await db_get("app_users", {"telegram_user_id": f"eq.{tg_id}", "select": "*", "limit": "1"})
    return rows[0] if rows else None


async def ensure_user_shell(m: Message) -> dict:
    user = await get_user(m.from_user.id)
    now = datetime.now(timezone.utc).isoformat()
    if user:
        await db_patch("app_users", {"id": f"eq.{user['id']}"}, {
            "telegram_username": m.from_user.username,
            "last_name": m.from_user.last_name,
            "last_seen_at": now,
        }, return_rows=False)
        return user
    created = await db_insert("app_users", {
        "telegram_user_id": m.from_user.id,
        "telegram_username": m.from_user.username,
        "last_name": m.from_user.last_name,
        "role": "client",
        "status": "active",
        "onboarding_complete": False,
        "phone_verified": False,
        "last_seen_at": now,
    })
    return created[0]


async def link_telegram_user(user: dict, m: Message) -> None:
    await load_runtime_config()
    existing = await db_get("telegram_links", {
        "user_id": f"eq.{user['id']}",
        "organization_id": f"eq.{ORG_ID}",
        "telegram_user_id": f"eq.{m.from_user.id}",
        "select": "id",
        "limit": "1",
    })
    payload = {
        "user_id": user["id"],
        "organization_id": ORG_ID,
        "telegram_user_id": m.from_user.id,
        "telegram_chat_id": m.chat.id,
        "telegram_username": m.from_user.username,
        "link_status": "active",
        "miniapp_enabled": True,
        "notifications_enabled": True,
        "last_seen_at": datetime.now(timezone.utc).isoformat(),
    }
    if existing:
        await db_patch("telegram_links", {"id": f"eq.{existing[0]['id']}"}, payload, return_rows=False)
    else:
        await db_insert("telegram_links", payload, return_rows=False)


async def get_session(tg_id: int) -> Optional[dict]:
    rows = await db_get("bot_sessions", {"telegram_user_id": f"eq.{tg_id}", "select": "*", "limit": "1"})
    return rows[0] if rows else None


async def set_session(tg_id: int, *, flow: Optional[str], step_key: Optional[str], user_id: Optional[str], answers: Optional[dict] = None, history: Optional[list] = None, current_question_id: Optional[str] = None) -> dict:
    now = datetime.now(timezone.utc)
    rows = await db_upsert("bot_sessions", {
        "telegram_user_id": tg_id,
        "flow": flow,
        "step_key": step_key,
        "user_id": user_id,
        "answers": answers or {},
        "history": history or [],
        "current_question_id": current_question_id,
        "updated_at": now.isoformat(),
        "expires_at": (now + timedelta(days=7)).isoformat(),
    }, on_conflict="telegram_user_id")
    return rows[0]


async def update_session(tg_id: int, **fields: Any) -> Optional[dict]:
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await db_patch("bot_sessions", {"telegram_user_id": f"eq.{tg_id}"}, fields)
    return rows[0] if rows else None


async def clear_session(tg_id: int, user_id: Optional[str] = None) -> None:
    await set_session(tg_id, flow=None, step_key=None, user_id=user_id, answers={}, history=[], current_question_id=None)


async def start_registration(m: Message, user: dict) -> None:
    await load_runtime_config()
    await set_session(m.from_user.id, flow="registration", step_key="name", user_id=user["id"], answers={}, history=[])
    message = BOT_SETTINGS.get("registration_message") or "Чтобы сохранять расчёты, документы и объекты, создадим ваш профиль."
    await m.answer(f"{message}\n\n<b>Как к вам обращаться?</b>", parse_mode="HTML", reply_markup=reply_nav())


async def ask_phone(m: Message, user_id: str, *, portal_only: bool = False) -> None:
    flow = "portal_phone" if portal_only else "registration"
    await set_session(m.from_user.id, flow=flow, step_key="phone", user_id=user_id, answers={}, history=[])
    await m.answer(
        "📱 <b>Подтвердите номер телефона</b>\n\n"
        "Нажмите кнопку «Поделиться номером». Этот подтверждённый номер будет идентификатором вашего клиентского профиля и позволит найти все ваши объекты.\n\n"
        "Сам номер не является паролем — доступ остаётся защищён Telegram-профилем.",
        parse_mode="HTML",
        reply_markup=reply_nav(with_phone=True),
    )


async def ask_city(m: Message, user_id: str) -> None:
    await update_session(m.from_user.id, flow="registration", step_key="city", user_id=user_id)
    await m.answer("В каком городе находится объект?", reply_markup=reply_nav())


async def finish_registration(m: Message, user_id: str, city: str) -> None:
    rows = await db_patch("app_users", {"id": f"eq.{user_id}"}, {
        "city": city.strip(),
        "onboarding_complete": True,
        "role": "client",
        "last_seen_at": datetime.now(timezone.utc).isoformat(),
    })
    user = rows[0]
    await link_telegram_user(user, m)
    await clear_session(m.from_user.id, user_id=user_id)
    await m.answer("✅ Профиль создан. Расчёты, документы и объекты будут сохраняться за этим профилем.", reply_markup=ReplyKeyboardRemove())
    await show_home(m, user)


async def menu_items() -> list[dict]:
    await load_runtime_config()
    return await db_get("bot_menu_items", {
        "organization_id": f"eq.{ORG_ID}", "is_active": "eq.true", "select": "*", "order": "sort_order.asc",
    })


async def home_markup() -> InlineKeyboardMarkup:
    items = await menu_items()
    return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=x["label"], callback_data=f"menu:{x['key']}")] for x in items])


async def show_home(m: Message, user: Optional[dict] = None) -> None:
    await load_runtime_config()
    user = user or await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        shell = user or await ensure_user_shell(m)
        await start_registration(m, shell)
        return
    await clear_session(m.from_user.id, user_id=user["id"])
    greeting = BOT_SETTINGS.get("welcome_message") or "🏠 <b>TIMCHENKO.PRO</b>\nИнженерные системы частных домов\n\nВыберите действие:"
    await m.answer(greeting, parse_mode="HTML", reply_markup=await home_markup())


async def show_home_callback(c: CallbackQuery) -> None:
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        if user:
            await start_registration(c.message, user)
        else:
            await c.message.answer("Отправьте /start для регистрации.")
        await c.answer()
        return
    await clear_session(c.from_user.id, user_id=user["id"])
    await load_runtime_config()
    greeting = BOT_SETTINGS.get("welcome_message") or "🏠 <b>TIMCHENKO.PRO</b>"
    await c.message.answer(greeting, parse_mode="HTML", reply_markup=await home_markup())
    await c.answer()


async def get_quiz(slug: str) -> Optional[dict]:
    await load_runtime_config()
    rows = await db_get("quiz_definitions", {
        "organization_id": f"eq.{ORG_ID}", "slug": f"eq.{slug}", "is_active": "eq.true", "select": "*", "limit": "1",
    })
    return rows[0] if rows else None


async def get_questions(quiz_id: str) -> list[dict]:
    return await db_get("quiz_questions", {"quiz_id": f"eq.{quiz_id}", "is_active": "eq.true", "select": "*", "order": "sort_order.asc"})


async def get_options(question_id: str) -> list[dict]:
    return await db_get("quiz_options", {"question_id": f"eq.{question_id}", "is_active": "eq.true", "select": "*", "order": "sort_order.asc"})


def question_visible(q: dict, answers: dict) -> bool:
    rule = q.get("visibility_rule") or {}
    when = rule.get("when") if isinstance(rule, dict) else None
    if not when:
        return True
    for key, allowed in when.items():
        actual = answers.get(key)
        allowed_set = set(allowed if isinstance(allowed, list) else [allowed])
        if isinstance(actual, list):
            if not (set(actual) & allowed_set):
                return False
        elif actual not in allowed_set:
            return False
    return True


async def first_or_next_question(quiz_id: str, answers: dict, after_key: Optional[str] = None) -> Optional[dict]:
    questions = await get_questions(quiz_id)
    passed = after_key is None
    for q in questions:
        if not passed:
            if q["key"] == after_key:
                passed = True
            continue
        if after_key is not None and q["key"] == after_key:
            continue
        if question_visible(q, answers):
            return q
    return None


async def question_position(quiz_id: str, q: dict, answers: dict) -> tuple[int, int]:
    visible = [x for x in await get_questions(quiz_id) if question_visible(x, answers) or x["id"] == q["id"]]
    ids = [x["id"] for x in visible]
    return (ids.index(q["id"]) + 1 if q["id"] in ids else 1, max(1, len(visible)))


async def question_text_and_markup(q: dict, answers: dict, quiz: dict) -> tuple[str, InlineKeyboardMarkup]:
    pos, total = await question_position(quiz["id"], q, answers)
    text = f"<b>{esc(q['prompt'])}</b>\n\n<i>Квиз для расчёта КП · шаг {pos} из {total}</i>"
    if q.get("help_text"):
        text += f"\n\n{esc(q['help_text'])}"
    if q.get("unit"):
        text += f"\nЕдиница: {esc(q['unit'])}"
    if q["input_type"] in ("single", "multi"):
        options = await get_options(q["id"])
        selected = answers.get(q["key"], [])
        if not isinstance(selected, list):
            selected = [selected] if selected else []
        rows: list[list[InlineKeyboardButton]] = []
        for option in options:
            value = option.get("value") or option["key"]
            label = option["label"]
            if q["input_type"] == "multi" and value in selected:
                label = "✅ " + label
            rows.append([InlineKeyboardButton(text=label, callback_data=f"qo:{option['id']}")])
        if q["input_type"] == "multi":
            rows.append([InlineKeyboardButton(text="Готово ✅", callback_data=f"qdone:{q['id']}")])
        if not q.get("required", True):
            rows.append([InlineKeyboardButton(text=SKIP, callback_data="nav:skip")])
        rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
        return text, InlineKeyboardMarkup(inline_keyboard=rows)
    return text, inline_nav(skip=not q.get("required", True))


async def render_question(m: Message, q: dict, answers: dict, quiz: dict) -> None:
    text, markup = await question_text_and_markup(q, answers, quiz)
    await m.answer(text, parse_mode="HTML", reply_markup=markup)


async def rerender_question(c: CallbackQuery, q: dict, answers: dict, quiz: dict) -> None:
    text, markup = await question_text_and_markup(q, answers, quiz)
    try:
        await c.message.edit_text(text, parse_mode="HTML", reply_markup=markup)
    except Exception:
        await c.message.answer(text, parse_mode="HTML", reply_markup=markup)


async def start_quiz_for_tg(m: Message, user: dict, slug: str, tg_id: int) -> None:
    quiz = await get_quiz(slug)
    if not quiz:
        await m.answer("Этот расчёт пока недоступен.", reply_markup=inline_nav())
        return
    q = await first_or_next_question(quiz["id"], {})
    if not q:
        await m.answer("В квизе пока нет вопросов.", reply_markup=inline_nav())
        return
    await set_session(tg_id, flow=f"quiz:{slug}", step_key=q["key"], user_id=user["id"], answers={}, history=[], current_question_id=q["id"])
    title = f"{quiz.get('icon') or ''} <b>{esc(quiz['title'])}</b>".strip()
    await m.answer(
        f"{title}\n\nКвиз для предварительного расчёта коммерческого предложения.\n{esc(quiz.get('start_message') or '')}",
        parse_mode="HTML",
    )
    await render_question(m, q, {}, quiz)


async def advance_quiz(m: Message, tg_id: int, session: dict, current_q: dict, answer_value: Any) -> None:
    answers = dict(session.get("answers") or {})
    history = list(session.get("history") or [])
    answers[current_q["key"]] = answer_value
    if not history or history[-1] != current_q["key"]:
        history.append(current_q["key"])
    slug = session["flow"].split(":", 1)[1]
    quiz = await get_quiz(slug)
    if not quiz:
        await m.answer("Расчёт больше недоступен.", reply_markup=inline_nav())
        return
    next_q = await first_or_next_question(quiz["id"], answers, after_key=current_q["key"])
    if not next_q:
        await complete_quiz(m, tg_id, session, quiz, answers)
        return
    await update_session(tg_id, step_key=next_q["key"], answers=answers, history=history, current_question_id=next_q["id"])
    await render_question(m, next_q, answers, quiz)


async def quiz_summary(quiz: dict, answers: dict) -> str:
    labels = {"area": "Площадь", "floors": "Этажность", "systems": "Системы", "construction_stage": "Стадия", "input_power": "Мощность", "electrical_scope": "Состав"}
    lines = [f"✅ <b>{esc(quiz['title'])}: квиз для КП сохранён</b>"]
    for key in ("area", "floors", "systems", "construction_stage", "input_power", "electrical_scope"):
        if key not in answers or answers[key] in (None, [], ""):
            continue
        unit = " м²" if key == "area" else (" кВт" if key == "input_power" else "")
        lines.append(f"<b>{labels.get(key,key)}:</b> {esc(nice_value(answers[key]))}{unit}")
    return "\n".join(lines)


async def complete_quiz(m: Message, tg_id: int, session: dict, quiz: dict, answers: dict) -> None:
    await load_runtime_config()
    user = await get_user(tg_id)
    user_id = user["id"] if user else session.get("user_id")
    stored_type = QUIZ_TYPE_MAP.get(quiz["slug"], "other")
    submission = await db_insert("quiz_submissions", {
        "user_id": user_id,
        "telegram_user_id": tg_id,
        "quiz_type": stored_type,
        "source": "telegram_bot",
        "answers": {**answers, "_flow_slug": quiz["slug"]},
        "contact_name": user.get("first_name") if user else None,
        "contact_phone": user.get("phone") if user else None,
        "city": user.get("city") if user else None,
        "status": "new",
        "organization_id": ORG_ID,
    })
    submission_id = submission[0]["id"] if submission else None
    lead_rows = await db_insert("leads", {
        "source": "telegram_quiz",
        "name": user.get("first_name") if user else None,
        "phone": user.get("phone") if user else None,
        "comment": f"Квиз для расчёта КП: {quiz['title']}",
        "status": "new",
        "telegram_user_id": tg_id,
        "app_user_id": user_id,
        "city": user.get("city") if user else None,
        "quiz_type": stored_type,
        "payload": {"answers": answers, "submission_id": submission_id, "flow_slug": quiz["slug"]},
        "organization_id": ORG_ID,
    })
    if submission_id and lead_rows:
        await db_patch("quiz_submissions", {"id": f"eq.{submission_id}"}, {"lead_id": lead_rows[0]["id"]}, return_rows=False)
    await clear_session(tg_id, user_id=user_id)
    rows: list[list[InlineKeyboardButton]] = []
    if submission_id:
        rows.append([InlineKeyboardButton(text="🏗 Создать объект из расчёта", callback_data=f"mkproj:{submission_id}")])
    rows += [
        [InlineKeyboardButton(text="🏗 Открыть личный кабинет", callback_data="portal:open")],
        [InlineKeyboardButton(text="☎️ Обсудить с инженером", callback_data="service:consultation")],
        [InlineKeyboardButton(text="📐 Заказать проектирование", callback_data="service:design")],
        [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ]
    await m.answer(f"{await quiz_summary(quiz, answers)}\n\n{esc(quiz.get('completion_message') or 'Расчёт сохранён.')}", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    await notify_admin(
        f"🔥 <b>Новый квиз для КП</b>\n{esc(quiz['title'])}\nКлиент: {esc(user.get('first_name') if user else '—')}\nТелефон: {esc(user.get('phone') if user else '—')}\nLead: {esc(lead_rows[0]['id'] if lead_rows else '—')}"
    )


async def quiz_back(m: Message, tg_id: int, session: dict) -> bool:
    history = list(session.get("history") or [])
    if not history:
        return False
    target_key = history[-1]
    new_history = history[:-1]
    answers = dict(session.get("answers") or {})
    answers.pop(target_key, None)
    slug = session["flow"].split(":", 1)[1]
    quiz = await get_quiz(slug)
    if not quiz:
        return False
    target = next((q for q in await get_questions(quiz["id"]) if q["key"] == target_key), None)
    if not target:
        return False
    await update_session(tg_id, step_key=target["key"], answers=answers, history=new_history, current_question_id=target["id"])
    await render_question(m, target, answers, quiz)
    return True


async def make_portal_url(user: dict) -> Optional[str]:
    await load_runtime_config()
    base_url = (BOT_SETTINGS.get("miniapp_url") or "").strip() or ENV_MINIAPP_URL
    if not base_url:
        return None
    raw_token = secrets.token_urlsafe(36)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    hours = int((BOT_SETTINGS.get("config") or {}).get("portal_token_hours", 12))
    await db_insert("client_portal_tokens", {
        "organization_id": ORG_ID,
        "user_id": user["id"],
        "token_hash": token_hash,
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=max(1, min(hours, 72)))).isoformat(),
        "metadata": {
            "source": "telegram_bot",
            "phone_normalized": user.get("phone_normalized"),
            "phone_verified": bool(user.get("phone_verified")),
        },
    }, return_rows=False)
    sep = "&" if "?" in base_url else "?"
    return f"{base_url}{sep}{urlencode({'token': raw_token})}"


async def project_count_for_user(user: dict) -> int:
    await load_runtime_config()
    if user.get("phone_verified") and user.get("phone_normalized"):
        rows = await db_get("projects", {
            "organization_id": f"eq.{ORG_ID}",
            "client_phone_normalized": f"eq.{user['phone_normalized']}",
            "select": "id",
        })
    else:
        rows = await db_get("projects", {"client_user_id": f"eq.{user['id']}", "select": "id"})
    return len(rows)


async def open_client_portal(m: Message, user: dict) -> None:
    if not user.get("phone_verified"):
        await ask_phone(m, user["id"], portal_only=True)
        return
    url = await make_portal_url(user)
    if not url:
        await m.answer("Личный кабинет ещё не опубликован.", reply_markup=inline_nav())
        return
    count = await project_count_for_user(user)
    text = (
        "🏗 <b>Личный кабинет</b>\n\n"
        "Объекты определяются по вашему подтверждённому номеру телефона. Один клиент может иметь несколько объектов — все они появятся в одном кабинете.\n\n"
        f"Объектов найдено: <b>{count}</b>"
    )
    await m.answer(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🏗 Открыть личный кабинет", web_app=WebAppInfo(url=url))],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ]))


async def create_project_from_submission(c: CallbackQuery, submission_id: str) -> None:
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    if not user.get("phone_verified"):
        await c.message.answer("Перед созданием объекта подтвердите телефон — он будет идентификатором клиента.", reply_markup=reply_nav(with_phone=True))
        await ask_phone(c.message, user["id"], portal_only=True)
        await c.answer()
        return
    await load_runtime_config()
    rows = await db_get("quiz_submissions", {
        "id": f"eq.{submission_id}", "user_id": f"eq.{user['id']}", "organization_id": f"eq.{ORG_ID}", "select": "*", "limit": "1",
    })
    if not rows:
        await c.answer("Расчёт не найден", show_alert=True)
        return
    sub = rows[0]
    if sub.get("project_id"):
        await c.message.answer("Этот расчёт уже привязан к объекту.", reply_markup=inline_nav())
        await c.answer()
        return
    answers = sub.get("answers") or {}
    area = answers.get("area")
    city = user.get("city") or sub.get("city")
    title = f"Дом {nice_value(area)} м²" if area else "Объект Timchenko.pro"
    if city:
        title += f" · {city}"
    created = await db_insert("projects", {
        "title": title,
        "client_user_id": user["id"],
        "client_phone_normalized": user.get("phone_normalized"),
        "created_by": user["id"],
        "city": city,
        "area_m2": area if isinstance(area, (int, float)) else None,
        "floors": as_int(answers.get("floors")),
        "bathrooms": as_int(answers.get("bathrooms")),
        "status": "survey",
        "current_stage": "Исходные данные",
        "progress_percent": 0,
        "paid_amount": 0,
        "notes": f"Создан из квиза {sub.get('quiz_type')}",
        "organization_id": ORG_ID,
    })
    if not created:
        await c.answer("Не удалось создать объект", show_alert=True)
        return
    project = created[0]
    await db_patch("quiz_submissions", {"id": f"eq.{submission_id}"}, {"project_id": project["id"], "status": "converted"}, return_rows=False)
    await c.message.answer(f"✅ <b>Объект создан</b>\n\n{esc(project['title'])}\nИдентификатор клиента — подтверждённый номер телефона.", parse_mode="HTML", reply_markup=inline_nav())
    await c.answer("Объект создан")


CONSULT_TOPICS = [
    ("nodes", "💧 Узел ввода воды"), ("engineering", "🏡 Инженерные системы"),
    ("electrical", "⚡ Электрика"), ("design", "📐 Проектирование"),
    ("project", "🏗 Текущий объект"), ("other", "❓ Другой вопрос"),
]
CONTACT_WINDOWS = [("now", "📞 Можно звонить сейчас"), ("morning", "🌅 Утром"), ("day", "☀️ Днём"), ("evening", "🌆 Вечером")]


def consultation_topic_markup() -> InlineKeyboardMarkup:
    rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_topic:{key}")] for key, label in CONSULT_TOPICS]
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def consultation_window_markup() -> InlineKeyboardMarkup:
    rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_window:{key}")] for key, label in CONTACT_WINDOWS]
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def design_scope_markup() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🏡 Все инженерные системы", callback_data="design_scope:all")],
        [InlineKeyboardButton(text="🔥 Отопление", callback_data="design_scope:heating")],
        [InlineKeyboardButton(text="💧 Водоснабжение и канализация", callback_data="design_scope:water")],
        [InlineKeyboardButton(text="⚡ Электрика", callback_data="design_scope:electrical")],
        [InlineKeyboardButton(text="🌬 Вентиляция / кондиционирование", callback_data="design_scope:ventilation")],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ])


def design_project_markup() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Да, есть", callback_data="design_project:yes")],
        [InlineKeyboardButton(text="📄 Есть часть проекта / планы", callback_data="design_project:partial")],
        [InlineKeyboardButton(text="❌ Нет", callback_data="design_project:no")],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ])


async def render_design_step(m: Message, session: dict) -> None:
    step = session.get("step_key")
    answers = dict(session.get("answers") or {})
    file_count = len(answers.get("design_document_ids") or [])
    suffix = f"\n\n{UPLOAD_HINT}\nЗагружено файлов: <b>{file_count}</b>"
    if step == "scope":
        await m.answer("📐 <b>Проектирование дома</b>\n\nЧто нужно спроектировать?" + suffix, parse_mode="HTML", reply_markup=design_scope_markup())
    elif step == "area":
        await m.answer("<b>Площадь дома, м²?</b>" + suffix, parse_mode="HTML", reply_markup=inline_nav())
    elif step == "project_ready":
        await m.answer("<b>Есть архитектурный проект, планы или дизайн-проект дома?</b>" + suffix, parse_mode="HTML", reply_markup=design_project_markup())
    elif step == "comment":
        await m.answer("<b>Коротко опишите задачу или особенности дома.</b>\nМожно пропустить." + suffix, parse_mode="HTML", reply_markup=inline_nav(skip=True))


async def start_service(m: Message, user: dict, kind: str, tg_id: int) -> None:
    if kind == "consultation":
        await set_session(tg_id, flow="service:consultation", step_key="topic", user_id=user["id"], answers={}, history=[])
        await m.answer("☎️ <b>Консультация инженера</b>\n\nПо какому вопросу хотите поговорить?", parse_mode="HTML", reply_markup=consultation_topic_markup())
        return
    if kind == "design":
        session = await set_session(tg_id, flow="service:design", step_key="scope", user_id=user["id"], answers={"design_document_ids": []}, history=[])
        await render_design_step(m, session)
        return
    await m.answer("Раздел пока недоступен.", reply_markup=inline_nav())


async def finish_consultation(m: Message, tg_id: int, session: dict, user: dict, window: str) -> None:
    await load_runtime_config()
    answers = dict(session.get("answers") or {})
    answers["contact_window"] = window
    topic = answers.get("topic", "other")
    await db_insert("service_requests", {
        "project_id": None, "created_by": user["id"], "category": "consultation",
        "title": f"Консультация: {topic}", "description": "Заявка из Telegram-бота",
        "priority": "normal", "status": "new",
        "metadata": {"source": "telegram", "topic": topic, "contact_window": window, "telegram_user_id": tg_id, "phone": user.get("phone"), "city": user.get("city")},
        "organization_id": ORG_ID,
    }, return_rows=False)
    await clear_session(tg_id, user_id=user["id"])
    await m.answer("✅ Записал. Заявка на консультацию создана.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=HOME, callback_data="nav:home")]]))
    await notify_admin(f"☎️ <b>Новая консультация</b>\n{esc(user.get('first_name') or 'Клиент')}\n{esc(user.get('phone') or '—')} / {esc(user.get('city') or '—')}\nТема: {esc(topic)}\nУдобно: {esc(window)}")


async def finish_design(m: Message, tg_id: int, session: dict, user: dict, comment: str = "") -> None:
    await load_runtime_config()
    answers = dict(session.get("answers") or {})
    if comment:
        answers["comment"] = comment
    doc_ids = list(answers.get("design_document_ids") or [])
    await db_insert("service_requests", {
        "project_id": None, "created_by": user["id"], "category": "design",
        "title": "Заявка на проектирование дома", "description": comment or "Заявка из Telegram-бота",
        "priority": "normal", "status": "new",
        "metadata": {"source": "telegram", "telegram_user_id": tg_id, "phone": user.get("phone"), "city": user.get("city"), **answers},
        "organization_id": ORG_ID,
    }, return_rows=False)
    await clear_session(tg_id, user_id=user["id"])
    await m.answer(
        f"✅ Заявка на проектирование создана.\nФайлов приложено: <b>{len(doc_ids)}</b>.",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="☎️ Записаться на консультацию", callback_data="service:consultation")],
            [InlineKeyboardButton(text="🏗 Личный кабинет", callback_data="portal:open")],
            [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )
    await notify_admin(f"📐 <b>Новая заявка на проектирование</b>\n{esc(user.get('first_name') or 'Клиент')}\n{esc(user.get('phone') or '—')} / {esc(user.get('city') or '—')}\nФайлов: {len(doc_ids)}\nДанные: <code>{esc(json.dumps(answers, ensure_ascii=False)[:1000])}</code>")


async def service_back(m: Message, tg_id: int, session: dict) -> bool:
    flow, step = session.get("flow"), session.get("step_key")
    if flow == "service:consultation":
        if step == "window":
            await update_session(tg_id, step_key="topic")
            await m.answer("По какому вопросу хотите поговорить?", reply_markup=consultation_topic_markup())
            return True
        return False
    if flow == "service:design":
        target = {"comment": "project_ready", "project_ready": "area", "area": "scope"}.get(step)
        if not target:
            return False
        updated = await update_session(tg_id, step_key=target)
        await render_design_step(m, updated or session)
        return True
    return False


async def save_design_upload(m: Message, user: dict, session: dict) -> None:
    document = m.document
    photo = m.photo[-1] if m.photo else None
    if document:
        name = document.file_name or f"document_{document.file_unique_id}"
        size = document.file_size or 0
        file_id = document.file_id
        content_type = document.mime_type or mimetypes.guess_type(name)[0] or "application/octet-stream"
    elif photo:
        name = f"photo_{photo.file_unique_id}.jpg"
        size = photo.file_size or 0
        file_id = photo.file_id
        content_type = "image/jpeg"
    else:
        return
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        await m.answer("Этот формат пока не принимаю. Подойдут PDF, DWG/DXF, JPG/PNG, архивы, Word и Excel.", reply_markup=inline_nav())
        return
    if size and size > MAX_UPLOAD_BYTES:
        await m.answer("Файл больше 20 МБ. Пришлите его архивом или уменьшите размер.", reply_markup=inline_nav())
        return
    tg_file = await bot.get_file(file_id)
    buf = await bot.download_file(tg_file.file_path)
    content = buf.read()
    if len(content) > MAX_UPLOAD_BYTES:
        await m.answer("Файл больше 20 МБ.", reply_markup=inline_nav())
        return
    stamp = datetime.now(timezone.utc)
    safe_name = re.sub(r"[^0-9A-Za-zА-Яа-я._-]+", "_", name)[:140]
    path = f"design-intake/{user['id']}/{stamp:%Y/%m}/{secrets.token_hex(5)}_{safe_name}"
    await storage_upload("project-documents", path, content, content_type)
    docs = await db_insert("documents", {
        "project_id": None,
        "owner_user_id": user["id"],
        "document_type": "project",
        "title": name,
        "storage_path": path,
        "external_url": None,
        "status": "draft",
        "version": 1,
        "metadata": {"source": "telegram_design", "telegram_user_id": m.from_user.id, "mime_type": content_type, "size": len(content)},
        "visibility": "client",
        "organization_id": ORG_ID,
    })
    answers = dict(session.get("answers") or {})
    ids = list(answers.get("design_document_ids") or [])
    if docs:
        ids.append(docs[0]["id"])
    answers["design_document_ids"] = ids
    updated = await update_session(m.from_user.id, answers=answers)
    await m.answer(f"✅ Файл «{esc(name)}» сохранён. Можно прислать ещё один или продолжить отвечать на текущий вопрос.", parse_mode="HTML")
    await render_design_step(m, updated or session)


@dp.message(CommandStart())
async def on_start(m: Message) -> None:
    user = await ensure_user_shell(m)
    if not user.get("onboarding_complete"):
        await start_registration(m, user)
        return

    await link_telegram_user(user, m)
    parts = (m.text or "").split(maxsplit=1)
    payload = parts[1].strip() if len(parts) > 1 else ""
    quiz_payloads = {
        "quiz_engineering_nodes": "engineering_nodes",
        "quiz_home_engineering": "home_engineering",
        "quiz_electrical": "electrical",
    }
    if payload in quiz_payloads:
        await start_quiz_for_tg(m, user, quiz_payloads[payload], m.from_user.id)
        return
    await show_home(m, user)


@dp.message(Command("menu", "home"))
async def on_menu(m: Message) -> None:
    await show_home(m)


@dp.message(Command("cabinet", "profile", "project"))
async def on_cabinet(m: Message) -> None:
    user = await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await on_start(m)
        return
    await open_client_portal(m, user)


@dp.message(Command("design"))
async def on_design_command(m: Message) -> None:
    user = await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await on_start(m)
        return
    await start_service(m, user, "design", m.from_user.id)


@dp.message(Command("consultation"))
async def on_consultation_command(m: Message) -> None:
    user = await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await on_start(m)
        return
    await start_service(m, user, "consultation", m.from_user.id)


@dp.callback_query(F.data == "nav:home")
async def on_nav_home(c: CallbackQuery) -> None:
    await show_home_callback(c)


@dp.callback_query(F.data == "nav:back")
async def on_nav_back(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    user = await get_user(c.from_user.id)
    if not session or not session.get("flow"):
        await show_home_callback(c)
        return
    flow = session["flow"]
    if flow.startswith("quiz:"):
        if await quiz_back(c.message, c.from_user.id, session):
            await c.answer()
            return
        await show_home_callback(c)
        return
    if flow == "registration":
        step = session.get("step_key")
        if step == "city":
            await ask_phone(c.message, user["id"])
        elif step == "phone":
            await update_session(c.from_user.id, step_key="name")
            await c.message.answer("Как к вам обращаться?", reply_markup=reply_nav())
        else:
            await c.message.answer("Как к вам обращаться?", reply_markup=reply_nav())
        await c.answer()
        return
    if flow == "portal_phone":
        await clear_session(c.from_user.id, user_id=user["id"] if user else None)
        await show_home_callback(c)
        return
    if flow.startswith("service:") and await service_back(c.message, c.from_user.id, session):
        await c.answer()
        return
    await clear_session(c.from_user.id, user_id=user["id"] if user else None)
    await show_home_callback(c)


@dp.callback_query(F.data == "nav:skip")
async def on_nav_skip(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    user = await get_user(c.from_user.id)
    if not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    flow = session.get("flow") or ""
    if flow.startswith("quiz:"):
        qrows = await db_get("quiz_questions", {"id": f"eq.{session.get('current_question_id')}", "select": "*", "limit": "1"})
        if not qrows:
            await c.answer("Вопрос не найден", show_alert=True)
            return
        q = qrows[0]
        if q.get("required", True):
            await c.answer("Этот вопрос обязателен", show_alert=True)
            return
        await advance_quiz(c.message, c.from_user.id, session, q, None)
        await c.answer()
        return
    if flow == "service:design" and session.get("step_key") == "comment" and user:
        await finish_design(c.message, c.from_user.id, session, user, "")
        await c.answer()
        return
    await c.answer("Здесь нельзя пропустить", show_alert=True)


@dp.callback_query(F.data.startswith("menu:"))
async def on_menu_item(c: CallbackQuery) -> None:
    await load_runtime_config()
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    key = c.data.split(":", 1)[1]
    rows = await db_get("bot_menu_items", {
        "organization_id": f"eq.{ORG_ID}", "key": f"eq.{key}", "is_active": "eq.true", "select": "*", "limit": "1",
    })
    if not rows:
        await c.answer("Раздел недоступен", show_alert=True)
        return
    item = rows[0]
    action_type, target = item["action_type"], item["action_target"]
    if action_type == "webapp":
        await c.message.answer(
            "💧 <b>Узел ввода воды</b>\n\nОткрываю уже готовый квиз/калькулятор с сайта — используем его без дублирования логики в Telegram.",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🧮 Открыть квиз для расчёта КП", web_app=WebAppInfo(url=target))],
                [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
            ]),
        )
    elif action_type == "quiz":
        await start_quiz_for_tg(c.message, user, target, c.from_user.id)
    elif action_type == "miniapp":
        await open_client_portal(c.message, user)
    elif action_type == "ai":
        await set_session(c.from_user.id, flow=f"ai:{target}", step_key="chat", user_id=user["id"], answers={}, history=[])
        agent = await db_get("ai_agents", {"organization_id": f"eq.{ORG_ID}", "slug": f"eq.{target}", "is_active": "eq.true", "select": "name,description", "limit": "1"})
        data = agent[0] if agent else {"name": "AI-инженер", "description": ""}
        await c.message.answer(f"🤖 <b>{esc(data['name'])}</b>\n\n{esc(data.get('description') or '')}\n\nПишите вопрос обычным сообщением.", parse_mode="HTML", reply_markup=inline_nav())
    elif action_type == "service":
        await start_service(c.message, user, target, c.from_user.id)
    else:
        await c.message.answer("Раздел пока в разработке.", reply_markup=inline_nav())
    await c.answer()


@dp.callback_query(F.data == "portal:open")
async def on_portal_open(c: CallbackQuery) -> None:
    user = await get_user(c.from_user.id)
    if not user:
        await c.answer("Сначала регистрация", show_alert=True)
        return
    await open_client_portal(c.message, user)
    await c.answer()


@dp.callback_query(F.data.startswith("mkproj:"))
async def on_make_project(c: CallbackQuery) -> None:
    await create_project_from_submission(c, c.data.split(":", 1)[1])


@dp.callback_query(F.data.startswith("qo:"))
async def on_quiz_option(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or not (session.get("flow") or "").startswith("quiz:"):
        await c.answer("Сессия закончилась", show_alert=True)
        return
    option_id = c.data.split(":", 1)[1]
    options = await db_get("quiz_options", {"id": f"eq.{option_id}", "select": "*", "limit": "1"})
    qrows = await db_get("quiz_questions", {"id": f"eq.{session.get('current_question_id')}", "select": "*", "limit": "1"})
    if not options or not qrows:
        await c.answer("Вариант больше недоступен", show_alert=True)
        return
    option, q = options[0], qrows[0]
    if option["question_id"] != q["id"]:
        await c.answer("Это вариант другого вопроса", show_alert=True)
        return
    value = option.get("value") or option["key"]
    if q["input_type"] == "single":
        await advance_quiz(c.message, c.from_user.id, session, q, value)
        await c.answer()
        return
    answers = dict(session.get("answers") or {})
    selected = list(answers.get(q["key"]) or [])
    if value in selected:
        selected.remove(value)
    else:
        if value == "none":
            selected = ["none"]
        else:
            selected = [x for x in selected if x != "none"]
            selected.append(value)
    answers[q["key"]] = selected
    await update_session(c.from_user.id, answers=answers)
    quiz = await get_quiz(session["flow"].split(":", 1)[1])
    if quiz:
        await rerender_question(c, q, answers, quiz)
    await c.answer()


@dp.callback_query(F.data.startswith("qdone:"))
async def on_quiz_multi_done(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or not (session.get("flow") or "").startswith("quiz:"):
        await c.answer("Сессия закончилась", show_alert=True)
        return
    qrows = await db_get("quiz_questions", {"id": f"eq.{session.get('current_question_id')}", "select": "*", "limit": "1"})
    if not qrows:
        await c.answer("Вопрос не найден", show_alert=True)
        return
    q = qrows[0]
    selected = list((session.get("answers") or {}).get(q["key"]) or [])
    if q.get("required", True) and not selected:
        await c.answer("Выберите хотя бы один вариант", show_alert=True)
        return
    await advance_quiz(c.message, c.from_user.id, session, q, selected)
    await c.answer()


@dp.callback_query(F.data.startswith("service:"))
async def on_service_quick(c: CallbackQuery) -> None:
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    await start_service(c.message, user, c.data.split(":", 1)[1], c.from_user.id)
    await c.answer()


@dp.callback_query(F.data.startswith("svc_topic:"))
async def on_consult_topic(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or session.get("flow") != "service:consultation":
        await c.answer("Сессия закончилась", show_alert=True)
        return
    answers = dict(session.get("answers") or {})
    answers["topic"] = c.data.split(":", 1)[1]
    await update_session(c.from_user.id, step_key="window", answers=answers)
    await c.message.answer("Когда удобнее связаться?", reply_markup=consultation_window_markup())
    await c.answer()


@dp.callback_query(F.data.startswith("svc_window:"))
async def on_consult_window(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    user = await get_user(c.from_user.id)
    if not session or session.get("flow") != "service:consultation" or not user:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    await finish_consultation(c.message, c.from_user.id, session, user, c.data.split(":", 1)[1])
    await c.answer()


@dp.callback_query(F.data.startswith("design_scope:"))
async def on_design_scope(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or session.get("flow") != "service:design":
        await c.answer("Сессия закончилась", show_alert=True)
        return
    answers = dict(session.get("answers") or {})
    answers["scope"] = c.data.split(":", 1)[1]
    updated = await update_session(c.from_user.id, step_key="area", answers=answers)
    await render_design_step(c.message, updated or session)
    await c.answer()


@dp.callback_query(F.data.startswith("design_project:"))
async def on_design_project(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or session.get("flow") != "service:design":
        await c.answer("Сессия закончилась", show_alert=True)
        return
    answers = dict(session.get("answers") or {})
    answers["project_ready"] = c.data.split(":", 1)[1]
    updated = await update_session(c.from_user.id, step_key="comment", answers=answers)
    await render_design_step(c.message, updated or session)
    await c.answer()


@dp.message(F.contact)
async def on_contact(m: Message) -> None:
    session = await get_session(m.from_user.id)
    user = await get_user(m.from_user.id)
    if not session or session.get("flow") not in ("registration", "portal_phone") or session.get("step_key") != "phone" or not user:
        return
    if m.contact.user_id and m.contact.user_id != m.from_user.id:
        await m.answer("Нужно поделиться своим номером.", reply_markup=reply_nav(with_phone=True))
        return
    phone = m.contact.phone_number
    normalized = normalize_phone(phone)
    rows = await db_patch("app_users", {"id": f"eq.{user['id']}"}, {
        "phone": phone,
        "phone_normalized": normalized,
        "phone_verified": True,
    })
    user = rows[0] if rows else user
    if session.get("flow") == "portal_phone":
        await clear_session(m.from_user.id, user_id=user["id"])
        await m.answer("✅ Номер подтверждён. По нему будем находить ваши объекты.", reply_markup=ReplyKeyboardRemove())
        await open_client_portal(m, user)
        return
    await ask_city(m, user["id"])


@dp.message(F.document | F.photo)
async def on_file_or_photo(m: Message) -> None:
    session = await get_session(m.from_user.id)
    user = await get_user(m.from_user.id)
    if session and session.get("flow") == "service:design" and user:
        await save_design_upload(m, user, session)
        return
    await m.answer("Файлы и планы лучше отправлять через раздел «📐 Заказать проектирование».", reply_markup=inline_nav())


async def handle_site_chat_admin_reply(m: Message) -> bool:
    """Route an owner's Telegram reply back to the matching website chat."""
    if not m.reply_to_message or not m.text:
        return False
    source = m.reply_to_message.text or m.reply_to_message.caption or ""
    match = re.search(r"#sitechat:([0-9a-fA-F-]{36})", source)
    if not match:
        return False
    admins = await db_get("platform_admins", {
        "telegram_user_id": f"eq.{m.from_user.id}",
        "is_active": "eq.true",
        "select": "id",
        "limit": "1",
    })
    if not admins:
        await m.answer("Ответ в чат сайта доступен только владельцу.")
        return True
    session_id = match.group(1).lower()
    body = m.text.strip()
    if not body:
        return True
    await db_insert("messages", {
        "project_id": None,
        "user_id": None,
        "direction": "manager",
        "channel": "website",
        "body": body,
        "metadata": {
            "session_id": session_id,
            "source": "telegram_admin_reply",
            "telegram_admin_id": m.from_user.id,
            "telegram_reply_to_message_id": m.reply_to_message.message_id,
        },
    }, return_rows=False)
    await m.answer("✅ Ответ отправлен клиенту в чат на сайте.")
    return True


@dp.message(F.text)
async def on_text(m: Message) -> None:
    text = (m.text or "").strip()
    if await handle_site_chat_admin_reply(m):
        return
    if text == HOME:
        await show_home(m)
        return
    session = await get_session(m.from_user.id)
    user = await get_user(m.from_user.id)
    if text == BACK:
        if not session or not session.get("flow"):
            await show_home(m, user)
            return
        flow = session["flow"]
        if flow.startswith("quiz:"):
            if not await quiz_back(m, m.from_user.id, session):
                await show_home(m, user)
            return
        if flow == "registration":
            if session.get("step_key") == "city":
                await ask_phone(m, user["id"])
            elif session.get("step_key") == "phone":
                await update_session(m.from_user.id, step_key="name")
                await m.answer("Как к вам обращаться?", reply_markup=reply_nav())
            else:
                await m.answer("Как к вам обращаться?", reply_markup=reply_nav())
            return
        if flow == "portal_phone":
            await clear_session(m.from_user.id, user_id=user["id"] if user else None)
            await show_home(m, user)
            return
        if flow.startswith("service:") and await service_back(m, m.from_user.id, session):
            return
        await show_home(m, user)
        return
    if not user:
        user = await ensure_user_shell(m)
    if not user.get("onboarding_complete") and (not session or session.get("flow") != "registration"):
        await start_registration(m, user)
        return
    if session and session.get("flow") == "registration":
        step = session.get("step_key")
        if step == "name":
            if len(text) < 2:
                await m.answer("Напишите имя.", reply_markup=reply_nav())
                return
            await db_patch("app_users", {"id": f"eq.{user['id']}"}, {"first_name": text}, return_rows=False)
            await ask_phone(m, user["id"])
            return
        if step == "phone":
            await m.answer("Для регистрации нажмите «📱 Поделиться номером». Введённый вручную номер не используется как подтверждённый идентификатор.", reply_markup=reply_nav(with_phone=True))
            return
        if step == "city":
            await finish_registration(m, user["id"], text)
            return
    if session and session.get("flow") == "portal_phone":
        await m.answer("Нажмите «📱 Поделиться номером» — это нужно один раз для безопасной привязки объектов.", reply_markup=reply_nav(with_phone=True))
        return
    if session and (session.get("flow") or "").startswith("quiz:"):
        qrows = await db_get("quiz_questions", {"id": f"eq.{session.get('current_question_id')}", "select": "*", "limit": "1"})
        if not qrows:
            await m.answer("Не удалось восстановить вопрос. Вернитесь на главную.", reply_markup=inline_nav())
            return
        q = qrows[0]
        if q["input_type"] == "number":
            try:
                value = float(text.replace(",", ".").replace(" ", ""))
            except ValueError:
                await m.answer("Введите число.", reply_markup=inline_nav(skip=not q.get("required", True)))
                return
            if q.get("min_value") is not None and value < float(q["min_value"]):
                await m.answer(f"Минимальное значение: {q['min_value']}", reply_markup=inline_nav())
                return
            if q.get("max_value") is not None and value > float(q["max_value"]):
                await m.answer(f"Максимальное значение: {q['max_value']}", reply_markup=inline_nav())
                return
            await advance_quiz(m, m.from_user.id, session, q, value)
            return
        if q["input_type"] == "text":
            await advance_quiz(m, m.from_user.id, session, q, text)
            return
    if session and (session.get("flow") or "").startswith("ai:"):
        await handle_ai_message(m, session, user)
        return
    if session and session.get("flow") == "service:design":
        step = session.get("step_key")
        answers = dict(session.get("answers") or {})
        if step == "area":
            try:
                area = float(text.replace(",", ".").replace(" ", ""))
            except ValueError:
                await m.answer("Введите площадь числом, например 280.\n\n" + UPLOAD_HINT, reply_markup=inline_nav())
                return
            if area < 20 or area > 5000:
                await m.answer("Проверьте площадь. Допустимый диапазон 20–5000 м².", reply_markup=inline_nav())
                return
            answers["area_m2"] = area
            updated = await update_session(m.from_user.id, step_key="project_ready", answers=answers)
            await render_design_step(m, updated or session)
            return
        if step == "comment":
            await finish_design(m, m.from_user.id, session, user, "" if text.lower() in ("нет", "no", "-") else text)
            return
    await m.answer("Выберите действие в главном меню.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=HOME, callback_data="nav:home")]]))


async def handle_ai_message(m: Message, session: dict, user: dict) -> None:
    body = (m.text or "").strip()
    if not body:
        return
    agent_slug = session["flow"].split(":", 1)[1]
    await db_insert("messages", {
        "project_id": None, "user_id": user["id"], "direction": "user", "channel": "telegram_bot",
        "body": body, "metadata": {"telegram_user_id": m.from_user.id, "agent": agent_slug},
    }, return_rows=False)
    await notify_admin(f"🤖 <b>Вопрос AI-инженеру</b>\n{esc(user.get('first_name') or 'Клиент')} / {esc(user.get('phone') or '—')}\n\n{esc(body)}")
    await m.answer("Вопрос сохранил. Полноценного сантехнического AI-агента подключим отдельным слоем; пока можно передать вопрос инженеру.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="☎️ Передать инженеру", callback_data="service:consultation")],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ]))


async def main() -> None:
    await load_runtime_config(force=True)
    me = await bot.get_me()
    await bot.delete_webhook(drop_pending_updates=False)
    await setup_bot_menu()
    log.info("TimchenkoBot v6.1 starting as @%s (id=%s)", me.username, me.id)
    notification_task = asyncio.create_task(process_lead_notifications())
    try:
        await dp.start_polling(bot, allowed_updates=["message", "callback_query"])
    finally:
        notification_task.cancel()
        await asyncio.gather(notification_task, return_exceptions=True)


if __name__ == "__main__":
    asyncio.run(main())
