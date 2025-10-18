# FireUX Core Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Nuxt module bootstrap (`src/module.ts` + `config/*`) auto-wires layouts, pages, plugins, and assets into host apps
- Unified Firebase access via composables (`useAuth`, `useUserEnsure`, `useFirestoreManager`) with tenant-aware fallbacks
- Shared UI kit and layouts (default, dashboard, dev, landing) plus CSS scaffolding in `runtime/assets/styles`
- Default PWA configuration delivered through `createFireuxConfig` (registers `@vite-pwa/nuxt` with sensible manifest defaults)

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Public-facing developer portal and onboarding routes (`/developers`, `/get-started`, `/projects`) matching the literature
- Complete Stripe billing stack: Firestore sync endpoint, customer + subscription management, and webhook handling
- Cross-app session broker and analytics instrumentation that leverage `globalAppId`
- CI/deployment presets (GitHub Actions, Firebase Hosting, Vercel) to accompany the PWA defaults
- Generated API/SDK documentation for core composables and design tokens
- Automated tenant-switching tests and regression coverage for multi-tenant flows

## 🧩 Planned / Cross-Package Dependencies

- Billing flows depend on shared platform decisions around secret management and Firestore schema (coordinate with tenant packages)
- Analytics layer should integrate with whichever observability stack the platform standardizes on (e.g., Segment, GA4, Plausible)
- Developer portal content may live under `copilot-documentation`; publishing workflows need alignment with docs tooling

## Next Actions

- [ ] Design and implement `/developers`, `/get-started`, and `/projects` pages with corresponding content slots
- [ ] Ship `/api/stripe/update-firestore` and related subscription/customer endpoints; add UI to manage plans
- [ ] Introduce cross-app session helpers that bridge `globalAppId` tenants and emit analytics events
- [ ] Provide starter CI workflows (build, lint, deploy) and document how tenants opt in
- [ ] Generate reference docs for composables (`useFirestore*`, `useAuth`) and surface them in the developer portal
- [ ] Add automated tests covering tenant switching, auth ensure flows, and Firestore CRUD helpers
