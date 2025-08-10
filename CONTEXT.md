# FIReUX – Monorepo Context
Last updated: 2025-08-10

## What FIReUX is
FIReUX is a modular SaaS framework (Nuxt 3 + Firebase + Stripe) delivered as:
- Templates for developers
- Hosted subscriptions for businesses
- White‑label for agencies/partners

## Repo Map (source of truth)
packages/
- fireux-core      — Auth, Firestore helpers, UI primitives, layout
- fireux-jobs      — Employer/Professional flows, jobs, applications, statuses
- fireux-misebox   — Hospitality domain (MiseboxUser, Professional, Chef, recipes, mise en place)
- fireux-places    — Place picker & service areas (scope + planned)

projects/
- fireux           — Website/hub (templates, subscriptions, bespoke)
- cleanbox         — Cleaning company template/app (core + jobs)
- misebox          — Hospitality app (core + jobs + misebox)

## Current Status & Near‑Term Focus
- Production apps: fireux, cleanbox, misebox ✅
- Priority: Dedupe shared Chef/Supplier code into `packages/fireux-misebox`; keep projects thin.
- Docs must reflect “Templates → Subscriptions → White‑label”.

## Engineering Principles
- Package‑first: domain logic in `packages/*`; `projects/*` compose + theme.
- Consistency: component prefixes `<Fire…>`, `<Job…>`, `<Mise…>`, `<Place…>`.
- Auto‑imports on; explicit Firebase imports.
- Prefer reactive props/composables over watchers.

## Docs Autopilot Rules
- If package exports change → update that package README (purpose, exports, minimal usage).
- If a project gains/loses features → update its Feature Map + env keys.
- Keep docs scannable (headings + bullets). Add “Last updated: YYYY‑MM‑DD”.

## Task Routing Matrix
| Task type                                | Primary | Secondary |
|------------------------------------------|---------|-----------|
| Repo‑wide docs & strategy                 | GPT‑5   | Sonnet    |
| Multi‑package refactor/API design         | GPT‑5   | Sonnet    |
| Single‑file Vue/Nuxt component/composable | Sonnet  | GPT‑5     |
| CSS/style tweaks                          | Sonnet  | GPT‑5     |
| Architectural reviews & trade‑offs        | GPT‑5   | Sonnet    |
| Quick “explain/small edit”                | Sonnet  | GPT‑5     |

## AI Collaboration Policy
- If the task fits the other model’s strengths, recommend switching and include a one‑line handoff.
- Never overwrite working code without intent.
- Preserve progress; reconcile/append docs instead of deleting.
