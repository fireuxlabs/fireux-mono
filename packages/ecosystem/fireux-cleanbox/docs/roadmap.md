# FireUX Cleanbox Tenant Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Nuxt module scaffolding that registers runtime directories, installs `fireux-jobs`, and exposes `configure*` helpers
- Cleanbox layouts (`CleanboxDefault`, `CleanboxDashboard`, `CleanboxDev`) delegating to shared FireUX shells

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Theme token overrides, typography, and color palettes to deliver the promised Cleanbox branding
- Feature toggle registry wiring scheduling, QA, and billing modules with defaults
- Seeder toolkit (fixtures, CLI scripts, migrations) to populate demo crews, locations, and QA checklists
- Deployment presets: runtime config templates, PWA icons, Stripe key management, environment matrix docs
- Runtime components/composables exposing tenant highlights, module registry, and extension points
- Documentation for extension points (`/cleanbox/extensibility`) and overrides navigation surfaces

## 🧩 Planned / Cross-Package Dependencies

- Scheduling/QA/billing toggles should align with capabilities in `fireux-cleanbox` dependent extensions (`fireux-jobs`, future QA modules); coordinate on feature flag schema
- Seeder tooling likely depends on `fireux-core` data models and Firestore conventions; align with platform data seeding strategy before implementation
- Deployment presets must integrate with FireUX DevOps automation; consult CI/CD instructions in `copilot-documentation`

## Next Actions

- [ ] Author Cleanbox design tokens (colors, typography, component variants) and register them via runtime components/themes
- [ ] Implement a feature toggle manifest and expose it through composables plus documentation
- [ ] Build seeder CLI tasks and sample data aligned with Cleanbox domain objects
- [ ] Provide deployment guidance, environment templates, and icon assets referenced in the literature
- [ ] Add runtime routes/components for theme tokens, overrides, demos, and extension points referenced by CTAs
- [ ] Document extension hooks and module integration points for teams extending Cleanbox
