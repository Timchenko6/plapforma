# TimchenkoBot v4

Telegram is a thin client for the Timchenko.pro platform. Business content is stored in Supabase so ordinary changes do not require SSH access to the server.

## What is database-driven

- registration settings and welcome text: `bot_settings`
- main menu: `bot_menu_items`
- the three client quizzes: `quiz_definitions`, `quiz_questions`, `quiz_options`
- quiz progress: `bot_sessions`
- completed quiz answers: `quiz_submissions`
- client leads: `leads`
- ready engineering assemblies: `assemblies`, `assembly_items`
- consultation/design requests: `service_requests`
- AI engineer configuration: `ai_agents`
- client objects and portal data: `projects`, `project_stages`, `project_updates`, `project_media`, `documents`, `estimates`, `payments`

## Current client entry points

1. Engineering nodes quiz
2. Home engineering systems quiz
3. Electrical quiz
4. My object (Mini App hook / existing project fallback)
5. Ready engineering assemblies
6. AI engineer chat entry point
7. House engineering design request
8. Engineer consultation request

Every flow includes Back/Home navigation. Registration is mandatory for new clients and binds the Telegram identity to `app_users` and `telegram_links`.

## Deploy/update

On the existing Ubuntu server, run as root:

```bash
curl -fsSL https://raw.githubusercontent.com/Timchenko6/plapforma/main/telegram-bot/install_v4.sh | bash
```

The installer downloads v4, validates Python syntax, backs up the previous v4 file if present, installs a systemd override for the existing `uzelpro` service, restarts it, and rolls the override back if the service fails to start.

## Environment

Existing `/opt/TimchenkoBot/.env` is reused. Required variables:

- `BOT_TOKEN`
- `ADMIN_CHAT_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

Optional:

- `ORG_SLUG=timchenko-pro`
- `MINIAPP_URL=https://...`

`bot_settings.miniapp_url` has priority over `MINIAPP_URL` when configured.
