#!/usr/bin/env python3
"""TimchenkoBot v5 — client Telegram gateway for Timchenko.pro.

Features:
- mandatory client registration;
- dynamic menu and quiz definitions from Supabase;
- Back / Home navigation in every flow;
- three quizzes: engineering nodes, home engineering, electrical;
- quiz results saved to profile + lead creation;
- create a client project from a quiz result;
- secure short-lived token for Telegram Mini App client portal;
- ready engineering assemblies catalog;
- consultation and design requests;
- AI-engineer chat entry point (agent layer is intentionally pluggable);
- automatic webhook removal before long polling.
"""

import asyncio
import hashlib
import html
import json
import logging
import os
import re
import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from urllib.parse import urlencode

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandStart
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

# -----------------------------------------------------------------------------
# Environment
# -----------------------------------------------------------------------------

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
log = logging.getLogger("timchenko_bot_v5")

bot = Bot(BOT_TOKEN)
dp = Dispatcher()

HOME = "🏠 Главная"
BACK = "⬅️ Назад"
SKIP = "Пропустить →"

ORG_ID: Optional[str] = None
BOT_SETTINGS: dict[str, Any] = {}
CONFIG_LOADED_AT = 0.0
CONFIG_TTL_SECONDS = 30

# -----------------------------------------------------------------------------
# Supabase REST
# -----------------------------------------------------------------------------

def _headers(prefer: Optional[str] = None) -> dict[str, str]:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def db_request(
    method: str,
    table: str,
    *,
    params: Optional[dict[str, str]] = None,
    data: Any = None,
    prefer: Optional[str] = None,
) -> Any:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.request(
            method,
            url,
            headers=_headers(prefer),
            params=params or {},
            json=data,
        )
    if response.status_code >= 400:
        log.error("Supabase %s %s -> %s %s", method, table, response.status_code, response.text[:1000])
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
    return await db_request(
        "POST",
        table,
        params={"on_conflict": on_conflict},
        data=data,
        prefer=prefer,
    ) or []


# -----------------------------------------------------------------------------
# Runtime config / common helpers
# -----------------------------------------------------------------------------

async def load_runtime_config(force: bool = False) -> None:
    global ORG_ID, BOT_SETTINGS, CONFIG_LOADED_AT
    now = time.monotonic()
    if not force and ORG_ID and (now - CONFIG_LOADED_AT) < CONFIG_TTL_SECONDS:
        return

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
    CONFIG_LOADED_AT = now


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


async def notify_admin(text: str) -> None:
    if not ADMIN_CHAT_ID:
        return
    try:
        await bot.send_message(int(ADMIN_CHAT_ID), text, parse_mode="HTML")
    except Exception:
        log.exception("admin notification failed")


def esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""))


def as_int(value: Any) -> Optional[int]:
    if value is None or value == "":
        return None
    match = re.search(r"\d+", str(value))
    return int(match.group()) if match else None


def nice_value(value: Any) -> str:
    if value is None:
        return "—"
    if isinstance(value, list):
        return ", ".join(str(x) for x in value) if value else "—"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


# -----------------------------------------------------------------------------
# Users / sessions
# -----------------------------------------------------------------------------

async def get_user(tg_id: int) -> Optional[dict]:
    rows = await db_get("app_users", {
        "telegram_user_id": f"eq.{tg_id}",
        "select": "*",
        "limit": "1",
    })
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
    await set_session(
        tg_id,
        flow=None,
        step_key=None,
        user_id=user_id,
        answers={},
        history=[],
        current_question_id=None,
    )


# -----------------------------------------------------------------------------
# Registration
# -----------------------------------------------------------------------------

async def start_registration(m: Message, user: dict) -> None:
    await load_runtime_config()
    await set_session(m.from_user.id, flow="registration", step_key="name", user_id=user["id"], answers={}, history=[])
    message = BOT_SETTINGS.get("registration_message") or "Чтобы сохранять расчёты и документы, создадим ваш профиль."
    await m.answer(
        f"{message}\n\n<b>Как к вам обращаться?</b>",
        parse_mode="HTML",
        reply_markup=reply_nav(),
    )


async def ask_phone(m: Message, user_id: str) -> None:
    await update_session(m.from_user.id, flow="registration", step_key="phone", user_id=user_id)
    await m.answer(
        "Отлично. Теперь поделитесь номером телефона — он нужен для профиля и заявок.",
        reply_markup=reply_nav(with_phone=True),
    )


async def ask_city(m: Message, user_id: str) -> None:
    await update_session(m.from_user.id, flow="registration", step_key="city", user_id=user_id)
    await m.answer("В каком городе находится ваш объект?", reply_markup=reply_nav())


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
    await m.answer("✅ Профиль создан. Теперь все расчёты будут сохраняться за вами.", reply_markup=ReplyKeyboardRemove())
    await show_home(m, user)


# -----------------------------------------------------------------------------
# Main menu
# -----------------------------------------------------------------------------

async def menu_items() -> list[dict]:
    await load_runtime_config()
    return await db_get("bot_menu_items", {
        "organization_id": f"eq.{ORG_ID}",
        "is_active": "eq.true",
        "select": "*",
        "order": "sort_order.asc",
    })


async def home_markup() -> InlineKeyboardMarkup:
    items = await menu_items()
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=item["label"], callback_data=f"menu:{item['key']}")]
        for item in items
    ])


async def show_home(m: Message, user: Optional[dict] = None) -> None:
    await load_runtime_config()
    user = user or await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        shell = user or await ensure_user_shell(m)
        await start_registration(m, shell)
        return

    await clear_session(m.from_user.id, user_id=user["id"])
    greeting = BOT_SETTINGS.get("welcome_message") or (
        "🏠 <b>TIMCHENKO.PRO</b>\nИнженерные системы частных домов\n\nВыберите действие:"
    )
    await m.answer(greeting, parse_mode="HTML", reply_markup=await home_markup())


async def show_home_callback(c: CallbackQuery) -> None:
    await load_runtime_config()
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        if not user:
            await c.message.answer("Отправьте /start для регистрации.")
        else:
            await start_registration(c.message, user)
        await c.answer()
        return
    await clear_session(c.from_user.id, user_id=user["id"])
    greeting = BOT_SETTINGS.get("welcome_message") or "🏠 <b>TIMCHENKO.PRO</b>"
    await c.message.answer(greeting, parse_mode="HTML", reply_markup=await home_markup())
    await c.answer()


# -----------------------------------------------------------------------------
# Dynamic quiz engine
# -----------------------------------------------------------------------------

async def get_quiz(slug: str) -> Optional[dict]:
    await load_runtime_config()
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
    text = f"<b>{esc(q['prompt'])}</b>\n\n<i>Шаг {pos} из {total}</i>"
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
        rows.append([
            InlineKeyboardButton(text=BACK, callback_data="nav:back"),
            InlineKeyboardButton(text=HOME, callback_data="nav:home"),
        ])
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


async def start_quiz_for_tg(
    m: Message,
    user: dict,
    slug: str,
    tg_id: int,
    *,
    initial_answers: Optional[dict] = None,
    preset_key: Optional[str] = None,
) -> None:
    quiz = await get_quiz(slug)
    if not quiz:
        await m.answer("Этот расчёт пока недоступен.", reply_markup=inline_nav())
        return

    answers = dict(initial_answers or {})
    history = [preset_key] if preset_key else []
    q = await first_or_next_question(quiz["id"], answers, after_key=preset_key)
    if not q:
        await m.answer("В квизе пока нет вопросов.", reply_markup=inline_nav())
        return

    await set_session(
        tg_id,
        flow=f"quiz:{slug}",
        step_key=q["key"],
        user_id=user["id"],
        answers=answers,
        history=history,
        current_question_id=q["id"],
    )
    title = f"{quiz.get('icon') or ''} <b>{esc(quiz['title'])}</b>".strip()
    if quiz.get("start_message"):
        await m.answer(f"{title}\n\n{esc(quiz['start_message'])}", parse_mode="HTML")
    await render_question(m, q, answers, quiz)


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

    await update_session(
        tg_id,
        step_key=next_q["key"],
        answers=answers,
        history=history,
        current_question_id=next_q["id"],
    )
    await render_question(m, next_q, answers, quiz)


async def quiz_summary(quiz: dict, answers: dict) -> str:
    labels = {
        "node_type": "Решение",
        "area": "Площадь",
        "floors": "Этажность",
        "systems": "Системы",
        "construction_stage": "Стадия",
        "current_stage": "Стадия",
        "input_power": "Мощность",
        "electrical_scope": "Состав",
    }
    value_labels = {
        "water_input": "Узел ввода воды",
        "boiler_room": "Котельная / котельный узел",
        "collector": "Коллекторный узел",
        "water_treatment": "Водоочистка",
        "heating_unit": "Насосно-смесительный узел",
        "heating": "Отопление",
        "water": "Водоснабжение",
        "sewer": "Канализация",
        "boiler": "Котельная",
        "ventilation": "Вентиляция",
        "ac": "Кондиционирование",
    }
    lines = [f"✅ <b>{esc(quiz['title'])}: данные сохранены</b>"]
    for key in ("node_type", "area", "floors", "systems", "construction_stage", "current_stage", "input_power", "electrical_scope"):
        if key not in answers or answers[key] in (None, [], ""):
            continue
        value = answers[key]
        if isinstance(value, list):
            pretty = ", ".join(value_labels.get(str(x), str(x)) for x in value)
        else:
            pretty = value_labels.get(str(value), nice_value(value))
        unit = " м²" if key == "area" else (" кВт" if key == "input_power" else "")
        lines.append(f"<b>{labels.get(key, key)}:</b> {esc(pretty)}{unit}")
    return "\n".join(lines)


async def complete_quiz(m: Message, tg_id: int, session: dict, quiz: dict, answers: dict) -> None:
    await load_runtime_config()
    user = await get_user(tg_id)
    user_id = user["id"] if user else session.get("user_id")
    submission = await db_insert("quiz_submissions", {
        "user_id": user_id,
        "telegram_user_id": tg_id,
        "quiz_type": quiz["slug"],
        "source": "telegram",
        "answers": answers,
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
        "comment": f"Пройден квиз: {quiz['title']}",
        "status": "new",
        "telegram_user_id": tg_id,
        "app_user_id": user_id,
        "city": user.get("city") if user else None,
        "quiz_type": quiz["slug"],
        "payload": {"answers": answers, "submission_id": submission_id},
        "organization_id": ORG_ID,
    })
    if submission_id and lead_rows:
        await db_patch("quiz_submissions", {"id": f"eq.{submission_id}"}, {"lead_id": lead_rows[0]["id"]}, return_rows=False)

    await clear_session(tg_id, user_id=user_id)
    rows = []
    if submission_id:
        rows.append([InlineKeyboardButton(text="🏗 Создать объект из расчёта", callback_data=f"mkproj:{submission_id}")])
    rows += [
        [InlineKeyboardButton(text="🏗 Открыть личный кабинет", callback_data="portal:open")],
        [InlineKeyboardButton(text="☎️ Обсудить с инженером", callback_data="service:consultation")],
        [InlineKeyboardButton(text="📐 Заказать проектирование", callback_data="service:design")],
        [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ]
    summary = await quiz_summary(quiz, answers)
    completion = quiz.get("completion_message") or "Расчёт сохранён в вашем профиле."
    await m.answer(f"{summary}\n\n{esc(completion)}", parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))

    await notify_admin(
        f"🔥 <b>Новый расчёт</b>\n{esc(quiz['title'])}\n"
        f"Клиент: {esc(user.get('first_name') if user else '—')}\n"
        f"Телефон: {esc(user.get('phone') if user else '—')}\n"
        f"Город: {esc(user.get('city') if user else '—')}\n"
        f"Lead: {esc(lead_rows[0]['id'] if lead_rows else '—')}"
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
    questions = await get_questions(quiz["id"])
    target = next((q for q in questions if q["key"] == target_key), None)
    if not target:
        return False
    await update_session(
        tg_id,
        step_key=target["key"],
        answers=answers,
        history=new_history,
        current_question_id=target["id"],
    )
    await render_question(m, target, answers, quiz)
    return True


# -----------------------------------------------------------------------------
# Client portal and project creation
# -----------------------------------------------------------------------------

async def make_portal_url(user: dict) -> Optional[str]:
    await load_runtime_config()
    base_url = (BOT_SETTINGS.get("miniapp_url") or "").strip() or ENV_MINIAPP_URL
    if not base_url:
        return None
    raw_token = secrets.token_urlsafe(36)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    hours = int((BOT_SETTINGS.get("config") or {}).get("portal_token_hours", 12))
    await db_insert("client_portal_tokens", {
        "organization_id": ORG_ID,
        "user_id": user["id"],
        "token_hash": token_hash,
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=max(1, min(hours, 72)))).isoformat(),
        "metadata": {"source": "telegram_bot"},
    }, return_rows=False)
    separator = "&" if "?" in base_url else "?"
    return f"{base_url}{separator}{urlencode({'token': raw_token})}"


async def portal_markup(user: dict, label: str = "🏗 Открыть мой объект") -> InlineKeyboardMarkup:
    url = await make_portal_url(user)
    rows: list[list[InlineKeyboardButton]] = []
    if url:
        rows.append([InlineKeyboardButton(text=label, web_app=WebAppInfo(url=url))])
    rows.append([
        InlineKeyboardButton(text=BACK, callback_data="nav:back"),
        InlineKeyboardButton(text=HOME, callback_data="nav:home"),
    ])
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def open_client_portal(m: Message, user: dict) -> None:
    url = await make_portal_url(user)
    if not url:
        await m.answer("Личный кабинет ещё не опубликован.", reply_markup=inline_nav())
        return
    projects = await db_get("projects", {
        "client_user_id": f"eq.{user['id']}",
        "select": "id,title,status,progress_percent",
        "order": "updated_at.desc",
        "limit": "5",
    })
    text = "🏗 <b>Личный кабинет</b>\n\nСметы, документы, фото, этапы работ и профиль клиента — в одном Mini App."
    if projects:
        text += f"\n\nОбъектов в профиле: <b>{len(projects)}</b>"
    else:
        text += "\n\nАктивного объекта пока нет. Ваши расчёты и профиль уже доступны в кабинете."
    await m.answer(
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏗 Открыть личный кабинет", web_app=WebAppInfo(url=url))],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )


async def create_project_from_submission(c: CallbackQuery, submission_id: str) -> None:
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    await load_runtime_config()
    rows = await db_get("quiz_submissions", {
        "id": f"eq.{submission_id}",
        "user_id": f"eq.{user['id']}",
        "organization_id": f"eq.{ORG_ID}",
        "select": "*",
        "limit": "1",
    })
    if not rows:
        await c.answer("Расчёт не найден", show_alert=True)
        return
    submission = rows[0]
    if submission.get("project_id"):
        await c.message.answer("Этот расчёт уже привязан к объекту.", reply_markup=await portal_markup(user))
        await c.answer()
        return

    answers = submission.get("answers") or {}
    area = answers.get("area")
    floors = as_int(answers.get("floors"))
    bathrooms = as_int(answers.get("bathrooms"))
    city = user.get("city") or submission.get("city")
    if area:
        title = f"Дом {nice_value(area)} м²"
        if city:
            title += f" · {city}"
    else:
        title = f"Объект Timchenko.pro · {city}" if city else "Объект Timchenko.pro"

    created = await db_insert("projects", {
        "title": title,
        "client_user_id": user["id"],
        "created_by": user["id"],
        "city": city,
        "area_m2": area if isinstance(area, (int, float)) else None,
        "floors": floors,
        "bathrooms": bathrooms,
        "status": "survey",
        "current_stage": "Исходные данные",
        "progress_percent": 0,
        "paid_amount": 0,
        "notes": f"Создан автоматически из квиза {submission.get('quiz_type')}",
        "organization_id": ORG_ID,
    })
    if not created:
        await c.answer("Не удалось создать объект", show_alert=True)
        return
    project = created[0]
    await db_patch("quiz_submissions", {"id": f"eq.{submission_id}"}, {"project_id": project["id"], "status": "linked"}, return_rows=False)
    await c.message.answer(
        f"✅ <b>Объект создан</b>\n\n{esc(project['title'])}\nТеперь расчёт, будущие сметы, документы и фото можно собирать в одном кабинете.",
        parse_mode="HTML",
        reply_markup=await portal_markup(user),
    )
    await notify_admin(f"🏗 <b>Клиент создал объект</b>\n{esc(project['title'])}\nКлиент: {esc(user.get('first_name') or '—')} / {esc(user.get('phone') or '—')}")
    await c.answer("Объект создан")


# -----------------------------------------------------------------------------
# Ready engineering assemblies
# -----------------------------------------------------------------------------

async def show_assemblies(m: Message) -> None:
    rows = await db_get("assemblies", {
        "is_active": "eq.true",
        "select": "id,name,kind,description,price_out,build_days",
        "order": "id.asc",
        "limit": "20",
    })
    if not rows:
        await m.answer("📦 Каталог готовых инженерных узлов пока пуст.", reply_markup=inline_nav())
        return

    await m.answer("📦 <b>Готовые инженерные узлы</b>\n\nВыберите решение — его можно сразу передать в квиз для подбора под ваш дом.", parse_mode="HTML")
    for item in rows:
        price = float(item.get("price_out") or 0)
        price_text = f"от {price:,.0f} ₽".replace(",", " ") if price > 0 else "после подбора комплектации"
        markup = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🧮 Рассчитать под мой дом", callback_data=f"node:{item['kind']}")],
        ])
        await m.answer(
            f"<b>{esc(item['name'])}</b>\n{esc(item.get('description') or '')}\n\n"
            f"Стоимость: <b>{esc(price_text)}</b>\nСрок сборки: ориентировочно {esc(item.get('build_days') or '—')} дн.",
            parse_mode="HTML",
            reply_markup=markup,
        )
    await m.answer("Каталог можно дополнять из базы без изменения кода бота.", reply_markup=inline_nav())


# -----------------------------------------------------------------------------
# AI engineer entry point
# -----------------------------------------------------------------------------

async def handle_ai_message(m: Message, session: dict, user: dict) -> None:
    body = (m.text or "").strip()
    if not body:
        await m.answer("Напишите вопрос текстом.", reply_markup=inline_nav())
        return

    agent_slug = session["flow"].split(":", 1)[1]
    await db_insert("messages", {
        "project_id": None,
        "user_id": user["id"],
        "direction": "user",
        "channel": "telegram_bot",
        "body": body,
        "metadata": {"telegram_user_id": m.from_user.id, "agent": agent_slug},
    }, return_rows=False)
    await notify_admin(
        f"🤖 <b>Вопрос AI-инженеру</b>\n{esc(user.get('first_name') or 'Клиент')} / {esc(user.get('phone') or '—')}\n\n{esc(body)}"
    )
    await m.answer(
        "Вопрос сохранил. Сейчас это вход в будущего сантехнического AI-агента: историю уже сохраняем, а модель и базу знаний подключим отдельным слоем.\n\nЕсли ответ нужен сейчас — передайте вопрос инженеру.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="☎️ Передать инженеру", callback_data="service:consultation")],
            [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )


# -----------------------------------------------------------------------------
# Consultation / design
# -----------------------------------------------------------------------------

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


def consultation_topic_markup() -> InlineKeyboardMarkup:
    rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_topic:{key}")] for key, label in CONSULT_TOPICS]
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def consultation_window_markup() -> InlineKeyboardMarkup:
    rows = [[InlineKeyboardButton(text=label, callback_data=f"svc_window:{key}")] for key, label in CONTACT_WINDOWS]
    rows.append([InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def design_scope_markup() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="🏡 Все инженерные системы", callback_data="design_scope:all")],
        [InlineKeyboardButton(text="🔥 Отопление", callback_data="design_scope:heating")],
        [InlineKeyboardButton(text="💧 Водоснабжение и канализация", callback_data="design_scope:water")],
        [InlineKeyboardButton(text="⚡ Электрика", callback_data="design_scope:electrical")],
        [InlineKeyboardButton(text="🌬 Вентиляция / кондиционирование", callback_data="design_scope:ventilation")],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def design_project_markup() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Да, есть", callback_data="design_project:yes")],
        [InlineKeyboardButton(text="📄 Есть часть проекта / планы", callback_data="design_project:partial")],
        [InlineKeyboardButton(text="❌ Нет", callback_data="design_project:no")],
        [InlineKeyboardButton(text=BACK, callback_data="nav:back"), InlineKeyboardButton(text=HOME, callback_data="nav:home")],
    ])


async def start_service(m: Message, user: dict, kind: str, tg_id: int) -> None:
    if kind == "consultation":
        await set_session(tg_id, flow="service:consultation", step_key="topic", user_id=user["id"], answers={}, history=[])
        await m.answer("☎️ <b>Консультация инженера</b>\n\nПо какому вопросу хотите поговорить?", parse_mode="HTML", reply_markup=consultation_topic_markup())
        return
    if kind == "design":
        await set_session(tg_id, flow="service:design", step_key="scope", user_id=user["id"], answers={}, history=[])
        await m.answer("📐 <b>Проектирование дома</b>\n\nЧто нужно спроектировать?", parse_mode="HTML", reply_markup=design_scope_markup())
        return
    await m.answer("Раздел пока недоступен.", reply_markup=inline_nav())


async def finish_consultation(m: Message, tg_id: int, session: dict, user: dict, window: str) -> None:
    await load_runtime_config()
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
    await m.answer(
        "✅ Записал. Заявка на консультацию создана.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=HOME, callback_data="nav:home")]]),
    )
    await notify_admin(
        f"☎️ <b>Новая консультация</b>\n{esc(user.get('first_name') or 'Клиент')}\n"
        f"{esc(user.get('phone') or '—')} / {esc(user.get('city') or '—')}\n"
        f"Тема: {esc(topic)}\nУдобно: {esc(window)}"
    )


async def finish_design(m: Message, tg_id: int, session: dict, user: dict, comment: str = "") -> None:
    await load_runtime_config()
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
        "✅ Заявка на проектирование создана. Исходные данные сохранены.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="☎️ Записаться на консультацию", callback_data="service:consultation")],
            [InlineKeyboardButton(text=HOME, callback_data="nav:home")],
        ]),
    )
    await notify_admin(
        f"📐 <b>Новая заявка на проектирование</b>\n{esc(user.get('first_name') or 'Клиент')}\n"
        f"{esc(user.get('phone') or '—')} / {esc(user.get('city') or '—')}\n"
        f"Данные: <code>{esc(json.dumps(answers, ensure_ascii=False)[:1200])}</code>"
    )


async def service_back(m: Message, tg_id: int, session: dict) -> bool:
    flow = session.get("flow")
    step = session.get("step_key")
    if flow == "service:consultation":
        if step == "window":
            await update_session(tg_id, step_key="topic")
            await m.answer("По какому вопросу хотите поговорить?", reply_markup=consultation_topic_markup())
            return True
        return False
    if flow == "service:design":
        if step == "comment":
            await update_session(tg_id, step_key="project_ready")
            await m.answer("Есть архитектурный проект или планы дома?", reply_markup=design_project_markup())
            return True
        if step == "project_ready":
            await update_session(tg_id, step_key="area")
            await m.answer("Площадь дома, м²?", reply_markup=inline_nav())
            return True
        if step == "area":
            await update_session(tg_id, step_key="scope")
            await m.answer("Что нужно спроектировать?", reply_markup=design_scope_markup())
            return True
        return False
    return False


# -----------------------------------------------------------------------------
# Commands
# -----------------------------------------------------------------------------

@dp.message(CommandStart())
async def on_start(m: Message) -> None:
    await load_runtime_config()
    user = await ensure_user_shell(m)
    if not user.get("onboarding_complete"):
        await start_registration(m, user)
    else:
        await link_telegram_user(user, m)
        await show_home(m, user)


@dp.message(Command("menu", "home"))
async def on_menu(m: Message) -> None:
    await show_home(m)


@dp.message(Command("profile", "project"))
async def on_profile(m: Message) -> None:
    user = await get_user(m.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await on_start(m)
        return
    await open_client_portal(m, user)


# -----------------------------------------------------------------------------
# Navigation callbacks
# -----------------------------------------------------------------------------

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
            await update_session(c.from_user.id, step_key="phone")
            await c.message.answer("Поделитесь номером телефона.", reply_markup=reply_nav(with_phone=True))
        elif step == "phone":
            await update_session(c.from_user.id, step_key="name")
            await c.message.answer("Как к вам обращаться?", reply_markup=reply_nav())
        else:
            await c.message.answer("Регистрация обязательна. Как к вам обращаться?", reply_markup=reply_nav())
        await c.answer()
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


# -----------------------------------------------------------------------------
# Main menu callbacks
# -----------------------------------------------------------------------------

@dp.callback_query(F.data.startswith("menu:"))
async def on_menu_item(c: CallbackQuery) -> None:
    await load_runtime_config()
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
    action_type, target = item["action_type"], item["action_target"]
    if action_type == "quiz":
        await start_quiz_for_tg(c.message, user, target, c.from_user.id)
    elif action_type == "miniapp":
        await open_client_portal(c.message, user)
    elif action_type == "catalog":
        await show_assemblies(c.message)
    elif action_type == "ai":
        await set_session(c.from_user.id, flow=f"ai:{target}", step_key="chat", user_id=user["id"], answers={}, history=[])
        agent = await db_get("ai_agents", {
            "organization_id": f"eq.{ORG_ID}",
            "slug": f"eq.{target}",
            "is_active": "eq.true",
            "select": "name,description",
            "limit": "1",
        })
        data = agent[0] if agent else {"name": "AI-инженер", "description": ""}
        await c.message.answer(
            f"🤖 <b>{esc(data['name'])}</b>\n\n{esc(data.get('description') or '')}\n\nПишите вопрос обычным сообщением.",
            parse_mode="HTML",
            reply_markup=inline_nav(),
        )
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


@dp.callback_query(F.data.startswith("node:"))
async def on_ready_node(c: CallbackQuery) -> None:
    user = await get_user(c.from_user.id)
    if not user or not user.get("onboarding_complete"):
        await c.answer("Сначала регистрация", show_alert=True)
        return
    kind = c.data.split(":", 1)[1]
    await start_quiz_for_tg(
        c.message,
        user,
        "engineering_nodes",
        c.from_user.id,
        initial_answers={"node_type": kind},
        preset_key="node_type",
    )
    await c.answer()


# -----------------------------------------------------------------------------
# Quiz callbacks
# -----------------------------------------------------------------------------

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


# -----------------------------------------------------------------------------
# Service callbacks
# -----------------------------------------------------------------------------

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
    await update_session(c.from_user.id, step_key="area", answers=answers)
    await c.message.answer("Площадь дома, м²?", reply_markup=inline_nav())
    await c.answer()


@dp.callback_query(F.data.startswith("design_project:"))
async def on_design_project(c: CallbackQuery) -> None:
    session = await get_session(c.from_user.id)
    if not session or session.get("flow") != "service:design":
        await c.answer("Сессия закончилась", show_alert=True)
        return
    answers = dict(session.get("answers") or {})
    answers["project_ready"] = c.data.split(":", 1)[1]
    await update_session(c.from_user.id, step_key="comment", answers=answers)
    await c.message.answer(
        "Коротко опишите задачу или особенности дома. Можно пропустить этот шаг.",
        reply_markup=inline_nav(skip=True),
    )
    await c.answer()


# -----------------------------------------------------------------------------
# Registration contact / text input
# -----------------------------------------------------------------------------

@dp.message(F.contact)
async def on_contact(m: Message) -> None:
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
async def on_text(m: Message) -> None:
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
                await m.answer("Введите число.", reply_markup=inline_nav(skip=not q.get("required", True)))
                return
            if q.get("min_value") is not None and value < float(q["min_value"]):
                await m.answer(f"Минимальное значение: {q['min_value']}", reply_markup=inline_nav(skip=not q.get("required", True)))
                return
            if q.get("max_value") is not None and value > float(q["max_value"]):
                await m.answer(f"Максимальное значение: {q['max_value']}", reply_markup=inline_nav(skip=not q.get("required", True)))
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
            await m.answer("Есть архитектурный проект или планы дома?", reply_markup=design_project_markup())
            return
        if step == "comment":
            await finish_design(m, m.from_user.id, session, user, "" if text.lower() in ("нет", "no", "-") else text)
            return

    await m.answer(
        "Выберите действие в главном меню.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=HOME, callback_data="nav:home")]]),
    )


# -----------------------------------------------------------------------------
# Bootstrap
# -----------------------------------------------------------------------------

async def main() -> None:
    await load_runtime_config(force=True)
    me = await bot.get_me()
    # v5 uses long polling. Removing a stale webhook here prevents the conflict
    # that previously made the bot look alive in systemd but silent in Telegram.
    await bot.delete_webhook(drop_pending_updates=False)
    log.info("TimchenkoBot v5 starting as @%s (id=%s)", me.username, me.id)
    await dp.start_polling(bot, allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    asyncio.run(main())
