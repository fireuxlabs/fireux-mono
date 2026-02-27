# FireUX Tenant Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Landing page scaffolding (`app/pages/index.vue`) with shared FireUX marketing components
- Base Nuxt wiring via `createFireuxConfig` to load the `fireux-fireux` module and shared layouts

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Multi-tenant configuration layer (Firestore schema, composables, admin UI) for theme, domain, and copy overrides
- Authentication and session flows (`/auth` routes, Firebase providers, cross-tenant cookies)
- Default console/settings/about/legal pages with shared layout wiring and tenant-aware data
- Stripe subscription and billing integration (customers, plans, webhooks, UI)
- Deployment automation (CLI to bootstrap tenants, Firebase presets, CI/CD templates)
- Theme/logos asset management plus PWA setup (manifest, icons, offline strategies)
- Analytics/error handling plumbing and shared legal content distributions

## 🧩 Planned / Cross-Package Dependencies

- Tenant config should reuse `fireux-core` configuration interfaces; align schemas before implementing Firestore collections
- Auth and billing rely on shared services/extensions; coordinate with platform teams on Stripe + Firebase auth conventions
- Deployment tooling must integrate with FireUX repo scripts (`scripts/`); collaborate before adding new CLIs
- Analytics/legal content may depend on upcoming platform documentation; verify ADRs prior to implementation

## Next Actions

- [ ] Design tenant configuration schema and composables; expose management UI under `/settings`
- [ ] Implement auth routes (login/register/reset) using cross-tenant session helpers
- [ ] Scaffold console, settings, about, and legal pages with placeholder content linked to config
- [ ] Integrate Stripe billing (subscription creation, webhook handling, invoice display)
- [ ] Create CLI or scripts to generate tenant shells and prepopulate Firebase environments
- [ ] Add theme/logo asset pipelines and PWA manifest/icon support
- [ ] Wire analytics/error pages and populate legal content templates
