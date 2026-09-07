# TIMCHENKO GROUP bot for MAX

The MAX bot is implemented as the Supabase Edge Function `max-bot-webhook` and uses the same CRM, users, quiz catalog, projects and portal tokens as the Telegram bot.

## Implemented flows

- start and main menu;
- verified phone registration through the MAX `request_contact` button;
- automatic identity linking with an existing client by normalized phone number;
- water-node, home-engineering and electrical quizzes loaded from Supabase;
- single-choice, multiple-choice, number and text questions;
- lead and quiz-submission creation in the shared CRM;
- design and engineer-consultation requests;
- short-lived client/admin portal links;
- webhook secret validation, contact HMAC validation and event deduplication.

## Production configuration

The production bot uses the `TIMCHENKO GROUP` brand (`id421815399150_bot`). Its webhook and commands are active.

For redeployment or token rotation:

1. Keep these secrets in the Supabase project:
   - `MAX_BOT_TOKEN` — token issued by MAX;
   - `MAX_WEBHOOK_SECRET` — random value containing 5–256 letters, digits, `_` or `-`;
   - `ORGANIZATION_SLUG=timchenko-pro` — optional because this is the default.
2. Subscribe the bot to the production webhook:

   `https://zzeeqwrndhpqdxyzpsqo.supabase.co/functions/v1/max-bot-webhook`

   Update types: `bot_started`, `message_created`, `message_callback`.

3. Add bot commands with `PATCH /me/commands`: `/start`, `/menu`, `/cabinet`.

The API base is `https://platform-api2.max.ru`. The token must be sent only in the `Authorization` header. The Edge Function bundles the official Russian root and subordinate CA certificates required by the current MAX API endpoint. JWT verification is disabled because MAX authenticates webhook calls with `X-Max-Bot-Api-Secret`; the handler validates this header itself.

## Native MAX Mini App

The current cabinet opens through a signed short-lived portal link and is already usable from MAX. After the Mini App is registered and moderated in MAX, the link button can be switched to `open_app` and the frontend can use MAX Bridge without changing CRM data or bot scenarios.

