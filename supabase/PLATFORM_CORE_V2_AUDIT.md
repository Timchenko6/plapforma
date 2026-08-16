# TIMCHENKO PLATFORM Core v2 — pre-migration audit

Audit date: 2026-08-16. Production project: `zzeeqwrndhpqdxyzpsqo`.

## Repository and runtime dependencies

- The production repository is `Timchenko6/plapforma`.
- There were no local migration files or `supabase/config.toml`; production contains 70 migrations from `timchenko_platform_layer_v1` through `project_payment_totals_and_document_images_v1`.
- Telegram Bot v5/v6 uses the Data API with `SUPABASE_SERVICE_KEY`; it depends on existing table and column names.
- Client Cabinet calls the `client-portal` Edge Function. Client v2/v3 also call `admin-crm-api`.
- Public site calls `public-lead-api` and `public-chat-api`.
- Edge Functions use the service role and currently access organizations, leads, messages, quiz tables, notifications, platform_admins and the project-documents bucket.
- Existing estimates depend on bigint estimate IDs and `estimate_items.catalog_item_id -> catalog_products_v2(item_id)`. The migration preserves those types and relationships.

## Existing authorization model reused by Core v2

- Application roles: `user`, `client`, `installer`, `company`, `admin`.
- Organization roles: `owner`, `admin`, `manager`, `engineer`, `estimator`, `installer`, `procurement`, `accountant`, `service`.
- Project roles: `client`, `installer`, `engineer`, `manager`, `viewer`.
- RLS helpers reused: `user_has_org_access(uuid)` and `user_has_project_access(uuid)`.
- Existing helper `set_updated_at()` is reused for timestamp triggers.

## SECURITY DEFINER review queue

The database currently contains many `public.SECURITY DEFINER` functions for estimates, tasks, catalog/BOM, client portal and identity bridging. A significant subset reports executable privileges for both `anon` and `authenticated`, including access helpers and several actor-oriented/internal RPCs.

This first migration intentionally does not revoke those privileges because Edge Functions and legacy clients may rely on them. Follow-up security hardening must inspect each function body and call site, then explicitly revoke `PUBLIC`/`anon` and grant only the required roles. Trigger functions should also be separated from API-callable RPCs in that review.

## Migration compatibility rules

- Additive changes only; no production table is deleted or renamed.
- Existing status constraints are unchanged.
- New project hierarchy is `zones -> systems -> nodes -> works`.
- Tasks, estimate items, media and documents receive nullable FKs, so existing rows remain valid.
- `project_materials` links to `catalog_products_v2` rather than introducing a parallel catalog.
- Explicit Data API grants accompany RLS policies; `anon` receives no direct table access.
- Cascades are limited to project-owned aggregate data. Optional cross-links use `ON DELETE SET NULL`; organization deletion remains restricted where production already follows that model.

## Core v2.1-v2.3 completion

- Cross-project and cross-organization links are blocked by database triggers for all Core v2 tables and the new links on projects, tasks, estimate items, media and documents.
- Deployed Edge Function call sites were audited. Actor RPCs are used through service-role clients in `platform-api` and `estimate-api`.
- Actor/internal RPCs are restricted to `service_role`.
- Authenticated `my` wrappers and access helpers remain available to `authenticated`, but are no longer inherited by `anon` through `PUBLIC`.
- `preliminary_benchmark_quote_v1` remains intentionally available to `anon` for the public calculator.
- All Core v2 foreign keys reported by the performance advisor now have covering indexes.
- Existing historical advisor findings on legacy tables remain a separate hardening backlog.
