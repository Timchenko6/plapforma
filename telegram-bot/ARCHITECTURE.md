# TimchenkoBot v5 — architecture

## Client Telegram flow

The bot is the lightweight client entry point for Timchenko.pro. Registration is mandatory for new users and stores name, phone and city in `app_users`. Every active flow provides Back and Home navigation.

The main menu is loaded from Supabase (`bot_menu_items`) rather than hardcoded in Python. Current client entries are:

1. Engineering nodes quiz (`engineering_nodes`)
2. Home engineering systems quiz (`home_engineering`)
3. Electrical quiz (`electrical`)
4. My project / client portal
5. Ready engineering assemblies
6. AI engineer entry point
7. Design request
8. Engineer consultation

Quiz definitions, questions, options, visibility rules and texts live in Supabase (`quiz_definitions`, `quiz_questions`, `quiz_options`). This means normal quiz edits do not require SSH or a bot restart.

Quiz results are stored in `quiz_submissions` and a lead is created in `leads`. A user can create a client project directly from a completed quiz; the project is then linked back to the submission.

## Client Mini App

`client/index.html` is the Telegram Mini App / client portal. It shows:

- project overview and progress;
- stages;
- estimates and payments;
- client-visible documents;
- project photos;
- profile and quiz history.

The client portal does not expose the Supabase service key. The bot creates a random short-lived portal token, stores only its SHA-256 hash in `client_portal_tokens`, and passes the raw token to the Mini App URL. The `client-portal` Supabase Edge Function validates the hash and expiration before returning client data. Private Storage files are exposed only through temporary signed URLs.

Current Mini App URL configured for the bot: `https://timchenko6.github.io/plapforma/client/`.

## Ready engineering assemblies

The bot reads active cards from `assemblies`. Generic starter cards were added for water input, collector, mixing/heating unit, boiler module and water treatment. A zero `price_out` is treated as “price after configuration”, not shown as 0 RUB. Selecting a card starts the engineering-node quiz with the node type already selected.

## AI engineer

The AI-engineer entry point and message history are implemented. Messages are stored in `messages` and can be escalated to an engineer. The actual LLM/RAG plumbing agent is intentionally a separate next layer; this avoids pretending that a model is connected before an API/model configuration exists.

## Deployment and future editing

`timchenko_bot_v5.py` deletes stale Telegram webhooks on startup and uses long polling, preventing the previous `getUpdates` / active-webhook conflict.

`install_v5_autoupdate.sh` performs the one-time server migration to v5 and installs a systemd timer. The updater checks the GitHub bot source every two minutes, syntax-checks a new file with `py_compile`, restarts the bot, and rolls back to the last good version if the service fails.

After this one-time installer is run, ordinary bot code updates can be committed to GitHub without opening SSH. Menu and quiz content changes are already database-driven and do not require a server deployment.
