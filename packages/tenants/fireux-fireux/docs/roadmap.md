# FireUX Core Tenant Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Nuxt module scaffolding with runtime wiring (`configure*` helpers) and optional prefixing
- Default and dashboard layouts delegating to shared FireUX shells
- Route helper stubs (`useFireuxDefaultRoutes`, `useFireuxRoutes`) ready to enrich

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- FireUX design token package (light/dark palettes, typography scale, badge/button variants)
- Marketplace catalogue components with filters, search, and data integration
- Module registry data layer and composables surfacing platform apps, extensions, templates
- Governance center UI (roles, invitations, audit feed messaging) plus supporting composables
- CTA bank and marketing content blocks for landing sections and promotions
- Scaffolder workflow (`/fireux/scaffold`) and documentation for cloning the tenant
- Component gallery or documentation route for `/fireux/components`

## 🧩 Planned / Cross-Package Dependencies

- Module registry and marketplace views should align with future `fireux-marketplace` or core catalog services; confirm schemas before implementation
- Governance features depend on shared auth/role services in `fireux-core`; coordinate on permission models and audit logging
- Scaffolder and marketing assets may rely on automation scripts under `automation/maintenance`; reuse or extend existing tooling

## Next Actions

- [ ] Author FireUX brand tokens and component variants, exporting them through the tenant module
- [ ] Implement marketplace catalogue components and wire them to registry data (temporary mock, then live service)
- [ ] Build governance center routes covering roles, invitations, and audit feed
- [ ] Populate CTA bank and marketing content, exposing reusable sections for tenant apps
- [ ] Document and expose a scaffolder flow for cloning the tenant (`/fireux/scaffold`)
- [ ] Create component gallery documentation route (`/fireux/components`) referencing shipped assets
