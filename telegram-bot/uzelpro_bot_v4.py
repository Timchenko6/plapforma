#!/usr/bin/env python3
"""
TimchenkoBot v4 — thin Telegram client for Timchenko.pro platform.

Core principles:
- registration is mandatory;
- main menu and quiz definitions live in Supabase;
- every flow has Back/Home navigation;
- quiz progress persists in bot_sessions, so restart does not lose progress;
- quiz submissions are saved to quiz_submissions and leads;
- client portal / ready assemblies / AI engineer are entry points for the next platform layers.

Required env:
BOT_TOKEN=...
ADMIN_CHAT_ID=...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_KEY=...
ORG_SLUG=timchenko-pro
MINIAPP_URL=...  # optional; bot_settings.miniapp_url has priority
"""

import asyncio
import json
import logging
import os
import re
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    WebAppInfo,
)

# ---------------------------------------------------------------------
# env without extra dependencies
# ---------------------------------------------------------------------

ENV_FILE = os.getenv("ENV_FILE", "/opt/TimchenkoBot/.env")
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
ORG_SLUG = os.getenv("ORG_SLUG", "timchenko-pro")
ENV_MINIAPP_URL = os.getenv("MINIAPP_URL", "").strip()

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is empty")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY is empty")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("timchenko_bot_v4")

bot = Bot(BOT_TOKEN)
dp = Dispatcher()

ORG_ID: Optional[str] = None
BOT_SETTINGS: dict[str, Any] = {}

HOME = "🏠 Главная"
BACK = "⬅️ Назад"

# ---------------------------------------------------------------------
# Supabase REST
# ---------------------------------------------------------------------

def _headers(prefer: Optional[str] = None) -> dict[str, str]:
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    return h


async def db_request(
    method: str,
    table: str,
    *,
    params: Optional[dict[str, str]] = None,
    data: Any = None,
    prefer: Optional[str] = None,
) -> Any:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.request(
            method,
            url,
            headers=_headers(prefer),
            params=params or {},
            json=data,
        )
        if r.status_code >= 400:
            log.error("Supabase %s %s -> %s %s", method, table, r.status_code, r.text[:800])
            r.raise_for_status()
        if not r.text:
            return None
        return r.json()


async def db_get(table: str, params: Optional[dict[str, str]] = None) -> list[dict]:
    return await db_request("GET", table, params=params) or []


async def db_insert(table: str, data: dict | list[dict], return_rows: bool = True) -> list[dict]:
    prefer = "return=representation" if return_rows else "return=minimal"
    return await db_request("POST", table, data=data, prefer=prefer) or []


async def db_patch(table: str, params: dict[str, str], data: dict, return_rows: bool = True) -> list[dict]:
    prefer = "return=representation" if return_rows else "return=minimal"
    return await db_request("PATCH", table, params=params, data=data, prefer=prefer) or []


async def db_upsert(
    table: str,
    data: dict,
    *,
    on_conflict: str,
    return_rows: bool = True,
) -> list[dict]:
    prefer = "resolution=merge-duplicates," + ("return=representation" if return_rows else "return=minimal")
    return await db_request(
        "POST",
        table,
        params={"on_conflict": on_conflict},
        data=data,
        prefer=prefer,
    ) or []


# ---------------------------------------------------------------------
# common helpers
# ---------------------------------------------------------------------

def inline_nav(back: bool = True, home: bool = True) -> InlineKeyboardMarkup:
    row: list[InlineKeyboardButton] = []
    if back:
        row.append(InlineKeyboardButton(text=BACK, callback_data="nav:back"))
    if home:
        row.append(InlineKeyboardButton(text=HOME, callback_data="nav:home"))
    return InlineKeyboardMarkup(inline_keyboard=[row])


def reply_nav(with_phone: bool = False) -> ReplyKeyboardMarkup:
    rows = []
    if with_phone:
        rows.append([KeyboardButton(text="📱 Поделиться номером", request_contact=True)])
    rows.append([KeyboardButton(text=BACK), KeyboardButton(text=HOME)])
    return ReplyKeyboardMarkup(keyboard=rows, resize_keyboard=True)


async def notify_admin(text: str) -> None:
    if not ADMIN_CHAT_ID:
        return
    try:
        await bot.send_message(int(ADMIN_CHAT_ID), text, parse_mode="HTML")
    except Exception:
        log.exception("admin notification failed")


async def load_runtime_config() -> None:
    global ORG_ID, BOT_SETTINGS
    org = await db_get("organizations", {
        "slug": f"eq.{ORG_SLUG}",
        "select": "id,name,slug",
        "limit": "1",
    })
    if not org:
        raise RuntimeError(f"Organization {ORG_SLUG!r} not found")
    ORG_ID = org[0]["id"]

    settings = await db_get("bot_settings", {
        "organization_id": f"eq.{ORG_ID}",
        "select": "*",
        "limit": "1",
    })
    BOT_SETTINGS = settings[0] if settings else {}
    log.info("runtime config loaded for org=%s", ORG_ID)


async def get_user(tg_id: int) -> Optional[dict]:
    rows = await db_get("app_users", {
        "telegram_user_id": f"eq.{tg_id}",
        "select": "*",
        "limit": "1",
    })
    return rows[0] if rows else None


async def ensure_user_shell(m: Message) -> dict:
    user = await get_user(m.from_user.id)
    if user:
        await db_patch(
            "app_users",
            {"id": f"eq.{user['id']}"},
            {
                "telegram_username": m.from_user.username,
                "last_name": m.from_user.last_name,
                "last_seen_at": datetime.now(timezone.utc).isoformat(),
            },
            return_rows=False,
        )
        return user

    created = await db_insert("app_users", {
        "telegram_user_id": m.from_user.id,
        "telegram_username": m.from_user.username,
        "last_name": m.from_user.last_name,
        "role": "client",
        "status": "active",
        "onboarding_complete": False,
        "last_seen_at": datetime.now(timezone.utc).isoformat(),
    })
    return created[0]


async def link_telegram_user(user: dict, m: Message) -> None:
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
    rows = await db_get("bot_sessions", {
        "telegram_user_id": f"eq.{tg_id}",
        "select": "*",
        "limit": "1",
    })
    return rows[0] if rows else None


async def set_session(
    tg_id: int,
    *,
    flow: Optional[str],
    step_key: Optional[str],
    user_id: Optional[str],
    answers: Optional[dict] = None,
    history: Optional[list] = None,
    current_question_id: Optional[str] = None,
) -> dict:
    now = datetime.now(timezone.utc)
    payload = {
        "telegram_user_id": tg_id,
        "flow": flow,
        "step_key": step_key,
        "user_id": user_id,
        "answers": answers or {},
        "history": history or [],
        "current_question_id": current_question_id,
        "updated_at": now.isoformat(),
        "expires_at": (now + timedelta(days=7)).isoformat(),
    }
    rows = await db_upsert("bot_sessions", payload, on_conflict="telegram_user_id")
    return rows[0]


async def update_session(tg_id: int, **fields: Any) -> Optional[dict]:
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await db_patch("bot_sessions", {"telegram_user_id": f"eq.{tg_id}"}, fields)
    return rows[0] if rows else None


async def clear_session(tg_id: int, user_id: Optional[str] = None) -> None:
    await set_session(
        tg_id,
        flow=None,
        step_key=None,
        user_id=user_id,
        answers={},
        history=[],
        current_question_id=None,
    )


# ---------------------------------------------------------------------
# registration
# ---------------------------------------------------------------------

async def start_registration(m: Message, user: dict) -> None:
    await set_session(
        m.from_user.id,
        flow="registration",
        step_key="name",
        user_id=user["id"],
        answers={},
        history=[],
    )
    msg = BOT_SETTINGS.get("registration_message") or (
        "Чтобы сохранять расчёты, документы и историю объекта, создадим ваш профиль."
    )
    await m.answer(
        f"{msg}\n\n<b>Как к вам обращаться?</b>",
        parse_mode="HTML",
        reply_markup=reply_nav(with_phone=False),
    )


async def ask_phone(m: Message, user_id: str) -> None:
    await update_session(m.from_user.id, flow="registration", step_key="phone", user_id=user_id)
    await m.answer(
        "Отлично. Теперь поделитесь номером телефона — он нужен для профиля и заявок.",
        reply_markup=reply_nav(with_phone=True),
    )


async def ask_city(m: Message, user_id: str) -> None:
    await update_session(m.from_user.id, flow="registration", step_key="city", user_id=user_id)
    await m.answer(
        "В каком городе находится ваш объект?",
        reply_markup=reply_nav(with_phone=False),
    )


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
    await m.answer("✅ Профиль создан.", reply_markup=ReplyKeyboardRemove())
    await show_home(m, user)


# ---------------------------------------------------------------------
# main menu
# ---------------------------------------------------------------------

async def menu_items() -> list[dict]:
    return await db_get("bot_menu_items", {
        "organization_id": f"eq.{ORG_ID}",
        "is_active": "eq.true",
        "select": "*",
        "order": "sort_order.asc",
    })


async def show_home(m: Message, user: Optional[dict] = None) -> None:
    user = user or await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        shell = user or await ensure_user_shell(m)
        await start_registration(m, shell)
        return

    await clear_session(m.from_user.id, user_id=user["id"])
    items = await menu_items()
    rows = [
        [InlineKeyboardButton(text=i["label"], callback_data=f"menu:{i['key']}")]
        for i in items
    ]
    greeting = BOT_SETTINGS.get("welcome_message") or (
        "🏠 <b>TIMCHENKO.PRO</b>\nИнженерные системы частных домов\n\nВыберите, что хотите сделать:"
    )
    await m.answer(greeting, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))


# ---------------------------------------------------------------------
# dynamic quiz engine
# ---------------------------------------------------------------------

async def get_quiz(slug: str) -> Optional[dict]:
    rows = await db_get("quiz_definitions", {
        "organization_id": f"eq.{ORG_ID}",
        "slug": f"eq.{slug}",
        "is_active": "eq.true",
        "select": "*",
        "limit": "1",
    })
    return rows[0] if rows else None


async def get_questions(quiz_id: str) -> list[dict]:
    return await db_get("quiz_questions", {
        "quiz_id": f"eq.{quiz_id}",
        "is_active": "eq.true",
        "select": "*",
        "order": "sort_order.asc",
    })


async def get_options(question_id: str) -> list[dict]:
    return await db_get("quiz_options", {
        "question_id": f"eq.{question_id}",
        "is_active": "eq.true",
        "select": "*",
        "order": "sort_order.asc",
    })


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
    qs = await get_questions(quiz_id)
    passed = after_key is None
    for q in qs:
        if not passed:
            if q["key"] == after_key:
                passed = True
            continue
        if after_key is not None and q["key"] == after_key:
            continue
        if question_visible(q, answers):
            return q
    return None


async def start_quiz_for_tg(m: Message, user: dict, slug: str, tg_id: int) -> None:
    quiz = await get_quiz(slug)
    if not quiz:
        await m.answer("Этот расчёт пока недоступен.", reply_markup=inline_nav())
        return
    q = await first_or_next_question(quiz["id"], {})
    if not q:
        await m.answer("В квизе пока нет вопросов.", reply_markup=inline_nav())
        return
    await set_session(
        tg_id,
        flow=f"quiz:{slug}",
        step_key=q["key"],
        user_id=user["id"],
        answers={},
        history=[],
        current_question_id=q["id"],
    )
    if quiz.get("start_message"):
        await m.answer(f"{quiz.get('icon') or ''} <b>{quiz['title']}</b>\n\n{quiz['start_message']}", parse_mode="HTML")
    await render_question(m, q, {}, slug, quiz)


async def render_question(m: Message, q: dict, answers: dict, slug: str, quiz: Optional[dict] = None) -> None:
    text = f"<b>{q['prompt']}</b>"
    if q.get("help_text"):
        text += f"\n\n{q['help_text']}"
    if q.get("unit"):
        text += f"\n\nЕдиница: {q['unit']}"

    if q["input_type"] in ("single", "multi"):
        opts = await get_options(q["id"])
        selected = answers.get(q["key"], [])
        if not isinstance(selected, list):
            selected = [selected] if selected else []
        rows = []
        for o in opts:
            label = o["label"]
            if q["input_type"] == "multi" and (o.get("value") or o["key"]) in selected:
                label = "✅ " + label
            rows.append([InlineKeyboardButton(text=label, callback_data=f"qo:{o['id']}")])
        if q["input_type"] == "multi":
            rows.append([InlineKeyboardButton(text="Готово ✅", callback_data=f"qdone:{q['id']}")])
        rows.append([
            InlineKeyboardButton(text=BACK, callback_data="nav:back"),
            InlineKeyboardButton(text=HOME, callback_data="nav:home"),
        ])
        await m.answer(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    else:
        await m.answer(text, parse_mode="HTML", reply_markup=inline_nav())


async def advance_quiz(m: Message, tg_id: int, session: dict, current_q: dict, answer_value: Any) -> None:
    answers = dict(session.get("answers") or {})
    history = list(session.get("history") or [])
    answers[current_q["key"]] = answer_value
    if not history or history[-1] != current_q["key"]:
        history.append(current_q["key"])

    slug = session["flow"].split(":", 1)[1]
    quiz = await get_quiz(slug)
    next_q = await first_or_next_question(quiz["id"], answers, after_key=current_q["key"])
    if not next_q:
        await complete_quiz(m, tg_id, session, quiz, answers)
        return

    await update_session(
        tg_id,
        step_key=next_q["key"],
        answers=answers,
        history=history,
        current_question_id=next_q["id"],
    )
    await render_question(m, next_q, answers, slug, quiz)


async def complete_quiz(m: Message, tg_id: int, session: dict, quiz: dict, answers: dict) -> None:
    user = await get_user(tg_id)
    payload = {
        "user_id": user["id"] if user else session.get("user_id"),
        "telegram_user_id": tg_id,
        "quiz_type": quiz["slug"],
        "source": "telegram",
        "answers": answers,
        "contact_name": user.get("first_name") if user else None,
        "contact_phone": user.get("phone") if user else None,
        "city": user.get("city") if user else None,
        "status": "new",
        "organization_id": ORG_ID,
    }
    submission = await db_insert("quiz_submissions", payload)

    lead_rows = await db_insert("leads", {
        "source": "telegram_quiz",
        "name": user.get("first_name") if user else None,
        "phone": user.get("phone") if user else None,
        "comment": f"Пройден квиз: {quiz['title']}",
        "status": "new",
        "telegram_user_id": tg_id,
        "app_user_id": user.get("id") if user else None,
        "city": user.get("city") if user else None,
        "quiz_type": quiz["slug"],
        "payload": {"answers": answers, "submission_id": submission[0]["id"] if submission else None},
        "organization_id": ORG_ID,
    })

    await clear_session(tg_id, user_id=user.get("id") if user else session.get("user_id"))

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="☎️ Обсудить с инженером", callback_data="service:consultation")],
        [InlineKeyboardButton(text="📐 Заказать проектирование", callback_data="service:design")],
        [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ])
    completion = quiz.get("completion_message") or "✅ Расчёт сохранён."
    await m.answer(completion, reply_markup=kb)

    await notify_admin(
        f"🔥 <b>Новый квиз</b>\n"
        f"{quiz['title']}\n"
        f"Клиент: {user.get('first_name') if user else '—'}\n"
        f"Телефон: {user.get('phone') if user else '—'}\n"
        f"Город: {user.get('city') if user else '—'}\n"
        f"Lead: {lead_rows[0]['id'] if lead_rows else '—'}"
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
    qs = await get_questions(quiz["id"])
    target = next((q for q in qs if q["key"] == target_key), None)
    if not target:
        return False
    await update_session(
        tg_id,
        step_key=target["key"],
        answers=answers,
        history=new_history,
        current_question_id=target["id"],
    )
    await render_question(m, target, answers, slug, quiz)
    return True


# ---------------------------------------------------------------------
# client portal / catalog / AI
# ---------------------------------------------------------------------

async def open_client_portal(m: Message, user: dict) -> None:
    settings_url = (BOT_SETTINGS.get("miniapp_url") or "").strip()
    url = settings_url or ENV_MINIAPP_URL
    if url:
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏗 Открыть мой объект", web_app=WebAppInfo(url=url))],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ])
        await m.answer(
            "В личном кабинете будут этапы работ, фото, сметы, документы, оплаты и связь с инженером.",
            reply_markup=kb,
        )
        return

    projects = await db_get("projects", {
        "client_user_id": f"eq.{user['id']}",
        "select": "id,title,status,current_stage,progress_percent",
        "order": "updated_at.desc",
    })
    if projects:
        p = projects[0]
        await m.answer(
            f"🏗 <b>{p['title']}</b>\n"
            f"Статус: {p.get('status')}\n"
            f"Этап: {p.get('current_stage') or '—'}\n"
            f"Готовность: {p.get('progress_percent', 0)}%\n\n"
            f"Полный Mini App подключим сюда без изменения структуры бота.",
            parse_mode="HTML",
            reply_markup=inline_nav(),
        )
    else:
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📐 Заказать проектирование", callback_data="service:design")],
            [InlineKeyboardButton(text="☎️ Записаться на консультацию", callback_data="service:consultation")],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ])
        await m.answer("У вас пока нет активного объекта.", reply_markup=kb)


async def show_assemblies(m: Message) -> None:
    rows = await db_get("assemblies", {
        "is_active": "eq.true",
        "select": "id,name,kind,description,price_out,build_days",
        "order": "id.asc",
        "limit": "10",
    })
    if not rows:
        await m.answer(
            "📦 Каталог готовых инженерных узлов уже подключён к структуре.\n\n"
            "Сейчас в базе нет опубликованных узлов. Добавим карточки — и они появятся здесь автоматически.",
            reply_markup=inline_nav(),
        )
        return
    for a in rows:
        price = f"{float(a['price_out']):,.0f} ₽".replace(",", " ")
        text = (
            f"<b>{a['name']}</b>\n"
            f"{a.get('description') or ''}\n\n"
            f"Стоимость: от {price}\n"
            f"Срок сборки: {a.get('build_days', 0)} дн."
        )
        await m.answer(text, parse_mode="HTML")
    await m.answer("Выберите следующее действие:", reply_markup=inline_nav())


async def handle_ai_message(m: Message, session: dict, user: dict) -> None:
    body = (m.text or "").strip()
    if not body:
        await m.answer("Напишите вопрос текстом.", reply_markup=inline_nav())
        return
    await db_insert("messages", {
        "project_id": None,
        "user_id": user["id"],
        "direction": "user",
        "channel": "telegram_bot",
        "body": body,
        "metadata": {"telegram_user_id": m.from_user.id, "agent": session["flow"].split(":", 1)[1]},
    }, return_rows=False)
    await notify_admin(
        f"🤖 <b>Вопрос AI-инженеру</b>\n"
        f"{user.get('first_name') or 'Клиент'} / {user.get('phone') or '—'}\n\n"
        f"{body}"
    )
    await m.answer(
        "Вопрос сохранил. Агентную часть подключаем следующим слоем; пока сложные вопросы можно передать инженеру.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="☎️ Передать инженеру", callback_data="service:consultation")],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )


# ---------------------------------------------------------------------
# consultation / design service requests
# ---------------------------------------------------------------------

CONSULT_TOPICS = [
    ("nodes", "🔧 Инженерные узлы"),
    ("engineering", "🏡 Инженерные системы"),
    ("electrical", "⚡ Электрика"),
    ("design", "📐 Проектирование"),
    ("project", "🏗 Текущий объект"),
    ("other", "❓ Другой вопрос"),
]

CONTACT_WINDOWS = [
    ("now", "📞 Можно звонить сейчас"),
    ("morning", "🌅 Утром"),
    ("day", "☀️ Днём"),
    ("evening", "🌆 Вечером"),
]


async def finish_consultation(m: Message, tg_id: int, session: dict, user: dict, window: str) -> None:
    answers = dict(session.get("answers") or {})
    answers["contact_window"] = window
    topic = answers.get("topic", "other")
    await db_insert("service_requests", {
        "project_id": None,
        "created_by": user["id"],
        "category": "consultation",
        "title": f"Консультация: {topic}",
        "description": "Заявка из Telegram-бота",
        "priority": "normal",
        "status": "new",
        "metadata": {
            "source": "telegram",
            "topic": topic,
            "contact_window": window,
            "telegram_user_id": tg_id,
            "phone": user.get("phone"),
            "city": user.get("city"),
        },
        "organization_id": ORG_ID,
    }, return_rows=False)
    await clear_session(tg_id, user_id=user["id"])
    await m.answer("✅ Записал. Заявка на консультацию создана.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=HOME, callback_data="nav:home")]
    ]))
    await notify_admin(
        f"☎️ <b>Новая консультация</b>\n"
        f"{user.get('first_name') or 'Клиент'}\n"
        f"{user.get('phone') or '—'} / {user.get('city') or '—'}\n"
        f"Тема: {topic}\nУдобно: {window}"
    )


async def finish_design(m: Message, tg_id: int, session: dict, user: dict, comment: str = "") -> None:
    answers = dict(session.get("answers") or {})
    if comment:
        answers["comment"] = comment
    await db_insert("service_requests", {
        "project_id": None,
        "created_by": user["id"],
        "category": "design",
        "title": "Заявка на проектирование дома",
        "description": comment or "Заявка из Telegram-бота",
        "priority": "normal",
        "status": "new",
        "metadata": {
            "source": "telegram",
            "telegram_user_id": tg_id,
            "phone": user.get("phone"),
            "city": user.get("city"),
            **answers,
        },
        "organization_id": ORG_ID,
    }, return_rows=False)
    await clear_session(tg_id, user_id=user["id"])
    await m.answer(
        "✅ Заявка на проектирование создана. Исходные данные сохранены в вашем профиле.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="☎️ Записаться на консультацию", callback_data="service:consultation")],
            [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )
    await notify_admin(
        f"📐 <b>Новая заявка на проектирование</b>\n"
        f"{user.get('first_name') or 'Клиент'}\n"
        f"{user.get('phone') or '—'} / {user.get('city') or '—'}\n"
        f"Данные: <code>{json.dumps(answers, ensure_ascii=False)[:1200]}</code>"
    )


# ---------------------------------------------------------------------
# handlers
# ---------------------------------------------------------------------

@dp.message(CommandStart())
async def on_start(m: Message):
    user = await ensure_user_shell(m)
    if not user.get("onboarding_complete"):
        await start_registration(m, user)
    else:
        await link_telegram_user(user, m)
        await show_home(m, user)


@dp.message(Command("menu"))
async def on_menu(m: Message):
    await show_home(m)


@dp.callback_query(F.data == "nav:home")
async def on_nav_home(c: CallbackQuery):
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        if not user:
            await c.message.answer("Отправьте /start для регистрации.")
        else:
            await set_session(c.from_user.id, flow="registration", step_key="name", user_id=user["id"], answers={}, history=[])
            await c.message.answer("Регистрация обязательна. Как к вам обращаться?", reply_markup=reply_nav())
    else:
        await clear_session(c.from_user.id, user_id=user["id"])
        items = await menu_items()
        rows = [[InlineKeyboardButton(text=i["label"], callback_data=f"menu:{i['key']}")] for i in items]
        greeting = BOT_SETTINGS.get("welcome_message") or "🏠 <b>TIMCHENKO.PRO</b>"
        await c.message.answer(greeting, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    await c.answer()


@dp.callback_query(F.data == "nav:back")
async def on_nav_back(c: CallbackQuery):
    session = await get_session(c.from_user.id)
    user = await get_user(c.from_user.id)
    if not session or not session.get("flow"):
        await on_nav_home(c)
        return

    flow = session["flow"]
    if flow.startswith("quiz:"):
        if await quiz_back(c.message, c.from_user.id, session):
            await c.answer()
            return
        await on_nav_home(c)
        return

    if flow == "registration":
        step = session.get("step_key")
        if step == "city":
            await update_session(c.from_user.id, step_key="phone")
            await c.message.answer("Поделитесь номером телефона.", reply_markup=reply_nav(with_phone=True))
        elif step == "phone":
            await update_session(c.from_user.id, step_key="name")
            await c.message.answer("Как к вам обращаться?", reply_markup=reply_nav())
        else:
            await c.message.answer("Регистрация обязательна. Как к вам обращаться?", reply_markup=reply_nav())
        await c.answer()
        return

    await clear_session(c.from_user.id, user_id=user["id"] if user else None)
    await on_nav_home(c)


@dp.callback_query(F.data.startswith("menu:"))
async def on_menu_item(c: CallbackQuery):
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    key = c.data.split(":", 1)[1]
    rows = await db_get("bot_menu_items", {
        "organization_id": f"eq.{ORG_ID}",
        "key": f"eq.{key}",
        "is_active": "eq.true",
        "select": "*",
        "limit": "1",
    })
    if not rows:
        await c.answer("Раздел недоступен", show_alert=True)
        return
    item = rows[0]
    action_type = item["action_type"]
    target = item["action_target"]
    if action_type == "quiz":
        await start_quiz_for_tg(c.message, user, target, c.from_user.id)
    elif action_type == "miniapp":
        await open_client_portal(c.message, user)
    elif action_type == "catalog":
        await show_assemblies(c.message)
    elif action_type == "ai":
        await set_session(c.from_user.id, flow=f"ai:{target}", step_key="chat", user_id=user["id"], answers={}, history=[])
        agent = await db_get("ai_agents", {
            "organization_id": f"eq.{ORG_ID}", "slug": f"eq.{target}", "is_active": "eq.true",
            "select": "name,description", "limit": "1"
        })
        a = agent[0] if agent else {"name": "AI-инженер", "description": ""}
        await c.message.answer(
            f"🤖 <b>{a['name']}</b>\n\n{a.get('description') or ''}\n\nПишите вопрос обычным сообщением.",
            parse_mode="HTML",
            reply_markup=inline_nav(),
        )
    elif action_type == "service":
        if target == "consultation":
            await set_session(c.from_user.id, flow="service:consultation", step_key="topic", user_id=user["id"], answers={}, history=[])
            rows2 = [[InlineKeyboardButton(text=label, callback_data=f"svc_topic:{k}")] for k, label in CONSULT_TOPICS]
            rows2.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
            await c.message.answer("☎️ <b>Консультация инженера</b>\n\nПо какому вопросу хотите поговорить?", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows2))
        elif target == "design":
            await set_session(c.from_user.id, flow="service:design", step_key="scope", user_id=user["id"], answers={}, history=[])
            rows2 = [
                [InlineKeyboardButton(text="🏡 Все инженерные системы", callback_data="design_scope:all")],
                [InlineKeyboardButton(text="🔥 Отопление", callback_data="design_scope:heating")],
                [InlineKeyboardButton(text="💧 Водоснабжение и канализация", callback_data="design_scope:water")],
                [InlineKeyboardButton(text="⚡ Электрика", callback_data="design_scope:electrical")],
                [InlineKeyboardButton(text="🌬 Вентиляция / кондиционирование", callback_data="design_scope:ventilation")],
                [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
            ]
            await c.message.answer("📐 <b>Проектирование дома</b>\n\nЧто нужно спроектировать?", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows2))
    await c.answer()


@dp.callback_query(F.data.startswith("qo:"))
async def on_quiz_option(c: CallbackQuery):
    option_id = c.data.split(":", 1)[1]
    session = await get_session(c.from_user.id)
    if not session or not (session.get("flow") or "").startswith("quiz:"):
        await c.answer("Квиз уже завершён", show_alert=True)
        return
    qrows = await db_get("quiz_questions", {
        "id": f"eq.{session.get('current_question_id')}",
        "select": "*",
        "limit": "1",
    })
    if not qrows:
        await c.answer("Вопрос не найден", show_alert=True)
        return
    q = qrows[0]
    opts = await db_get("quiz_options", {"id": f"eq.{option_id}", "select": "*", "limit": "1"})
    if not opts or opts[0]["question_id"] != q["id"]:
        await c.answer("Вариант не найден", show_alert=True)
        return
    o = opts[0]
    value = o.get("value") or o["key"]

    if q["input_type"] == "single":
        await c.answer()
        await advance_quiz(c.message, c.from_user.id, session, q, value)
        return

    answers = dict(session.get("answers") or {})
    selected = list(answers.get(q["key"]) or [])
    if value in selected:
        selected.remove(value)
    else:
        selected.append(value)
    answers[q["key"]] = selected
    await update_session(c.from_user.id, answers=answers)
    await c.answer("Выбрано" if value in selected else "Убрано")

    opts_all = await get_options(q["id"])
    rows = []
    for opt in opts_all:
        v = opt.get("value") or opt["key"]
        label = ("✅ " if v in selected else "") + opt["label"]
        rows.append([InlineKeyboardButton(text=label, callback_data=f"qo:{opt['id']}")])
    rows.append([InlineKeyboardButton(text="Готово ✅", callback_data=f"qdone:{q['id']}")])
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    try:
        await c.message.edit_reply_markup(reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    except Exception:
        pass


@dp.callback_query(F.data.startswith("qdone:"))
async def on_quiz_multi_done(c: CallbackQuery):
    session = await get_session(c.from_user.id)
    if not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    qid = c.data.split(":", 1)[1]
    qrows = await db_get("quiz_questions", {"id": f"eq.{qid}", "select": "*", "limit": "1"})
    if not qrows:
        await c.answer("Вопрос не найден", show_alert=True)
        return
    q = qrows[0]
    selected = (session.get("answers") or {}).get(q["key"], [])
    if q.get("required") and not selected:
        await c.answer("Выберите хотя бы один вариант", show_alert=True)
        return
    await c.answer()
    await advance_quiz(c.message, c.from_user.id, session, q, selected)


@dp.callback_query(F.data.startswith("svc_topic:"))
async def on_service_topic(c: CallbackQuery):
    user = await get_user(c.from_user.id)
    session = await get_session(c.from_user.id)
    if not user or not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    topic = c.data.split(":", 1)[1]
    answers = dict(session.get("answers") or {})
    answers["topic"] = topic
    await update_session(c.from_user.id, step_key="window", answers=answers)
    rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_window:{k}")] for k, label in CONTACT_WINDOWS]
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    await c.message.answer("Когда удобнее связаться?", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    await c.answer()


@dp.callback_query(F.data.startswith("svc_window:"))
async def on_service_window(c: CallbackQuery):
    user = await get_user(c.from_user.id)
    session = await get_session(c.from_user.id)
    if not user or not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    window = c.data.split(":", 1)[1]
    await finish_consultation(c.message, c.from_user.id, session, user, window)
    await c.answer()


@dp.callback_query(F.data.startswith("design_scope:"))
async def on_design_scope(c: CallbackQuery):
    session = await get_session(c.from_user.id)
    if not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    scope = c.data.split(":", 1)[1]
    answers = dict(session.get("answers") or {})
    answers["scope"] = scope
    await update_session(c.from_user.id, step_key="area", answers=answers)
    await c.message.answer("Площадь дома, м²?", reply_markup=inline_nav())
    await c.answer()


@dp.callback_query(F.data.startswith("design_project:"))
async def on_design_project(c: CallbackQuery):
    session = await get_session(c.from_user.id)
    if not session:
        await c.answer("Сессия закончилась", show_alert=True)
        return
    val = c.data.split(":", 1)[1]
    answers = dict(session.get("answers") or {})
    answers["project_ready"] = val
    await update_session(c.from_user.id, step_key="comment", answers=answers)
    await c.message.answer(
        "Коротко опишите задачу или особенности дома. Если добавить нечего — напишите «нет».",
        reply_markup=inline_nav(),
    )
    await c.answer()


@dp.callback_query(F.data.startswith("service:"))
async def on_service_quick(c: CallbackQuery):
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    kind = c.data.split(":", 1)[1]
    if kind == "consultation":
        await set_session(c.from_user.id, flow="service:consultation", step_key="topic", user_id=user["id"], answers={}, history=[])
        rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_topic:{k}")] for k, label in CONSULT_TOPICS]
        rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
        await c.message.answer("☎️ <b>Консультация инженера</b>\n\nПо какому вопросу хотите поговорить?", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    elif kind == "design":
        await set_session(c.from_user.id, flow="service:design", step_key="scope", user_id=user["id"], answers={}, history=[])
        rows = [
            [InlineKeyboardButton(text="🏡 Все инженерные системы", callback_data="design_scope:all")],
            [InlineKeyboardButton(text="🔥 Отопление", callback_data="design_scope:heating")],
            [InlineKeyboardButton(text="💧 Водоснабжение и канализация", callback_data="design_scope:water")],
            [InlineKeyboardButton(text="⚡ Электрика", callback_data="design_scope:electrical")],
            [InlineKeyboardButton(text="🌬 Вентиляция / кондиционирование", callback_data="design_scope:ventilation")],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]
        await c.message.answer("📐 <b>Проектирование дома</b>\n\nЧто нужно спроектировать?", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    await c.answer()


@dp.message(F.contact)
async def on_contact(m: Message):
    session = await get_session(m.from_user.id)
    user = await get_user(m.from_user.id)
    if not session or session.get("flow") != "registration" or session.get("step_key") != "phone" or not user:
        return
    if m.contact.user_id and m.contact.user_id != m.from_user.id:
        await m.answer("Нужно поделиться своим номером.", reply_markup=reply_nav(with_phone=True))
        return
    await db_patch("app_users", {"id": f"eq.{user['id']}"}, {"phone": m.contact.phone_number}, return_rows=False)
    await ask_city(m, user["id"])


@dp.message(F.text)
async def on_text(m: Message):
    text = (m.text or "").strip()
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
            step = session.get("step_key")
            if step == "city":
                await update_session(m.from_user.id, step_key="phone")
                await m.answer("Поделитесь номером телефона.", reply_markup=reply_nav(with_phone=True))
            elif step == "phone":
                await update_session(m.from_user.id, step_key="name")
                await m.answer("Как к вам обращаться?", reply_markup=reply_nav())
            else:
                await m.answer("Как к вам обращаться?", reply_markup=reply_nav())
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
            digits = re.sub(r"\D", "", text)
            if len(digits) < 10:
                await m.answer("Нажмите «📱 Поделиться номером» или введите номер вручную.", reply_markup=reply_nav(with_phone=True))
                return
            await db_patch("app_users", {"id": f"eq.{user['id']}"}, {"phone": text}, return_rows=False)
            await ask_city(m, user["id"])
            return
        if step == "city":
            await finish_registration(m, user["id"], text)
            return

    if session and (session.get("flow") or "").startswith("quiz:"):
        qrows = await db_get("quiz_questions", {
            "id": f"eq.{session.get('current_question_id')}",
            "select": "*",
            "limit": "1",
        })
        if not qrows:
            await m.answer("Не удалось восстановить вопрос. Вернитесь на главную.", reply_markup=inline_nav())
            return
        q = qrows[0]
        if q["input_type"] == "number":
            normalized = text.replace(",", ".").replace(" ", "")
            try:
                value = float(normalized)
            except ValueError:
                await m.answer("Введите число.", reply_markup=inline_nav())
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
                await m.answer("Введите площадь числом, например 280.", reply_markup=inline_nav())
                return
            if area < 20 or area > 5000:
                await m.answer("Проверьте площадь. Допустимый диапазон 20–5000 м².", reply_markup=inline_nav())
                return
            answers["area_m2"] = area
            await update_session(m.from_user.id, step_key="project_ready", answers=answers)
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="✅ Да, есть", callback_data="design_project:yes")],
                [InlineKeyboardButton(text="📄 Есть часть проекта / планы", callback_data="design_project:partial")],
                [InlineKeyboardButton(text="❌ Нет", callback_data="design_project:no")],
                [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
            ])
            await m.answer("Есть архитектурный проект или планы дома?", reply_markup=kb)
            return
        if step == "comment":
            await finish_design(m, m.from_user.id, session, user, "" if text.lower() in ("нет", "no", "-") else text)
            return

    await m.answer("Выберите действие в главном меню.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=HOME, callback_data="nav:home")]
    ]))


async def main() -> None:
    await load_runtime_config()
    log.info("TimchenkoBot v4 starting")
    await dp.start_polling(bot, allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    asyncio.run(main())
