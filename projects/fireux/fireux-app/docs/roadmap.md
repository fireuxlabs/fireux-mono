# FireUX App Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Rich landing experience with hero, quick peek, solutions, and showcase sections
- Design playground routes (`/design/*`, `/ui-demo`, `/cta-demo`) for component exploration

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Comprehensive developer onboarding portal with setup guides, tutorials, and starter templates
- App showcase/catalog surfaces for tenants and templates (`/projects`, `/products`, per-tenant detail pages)
- Account system with authentication, unified profiles, and tenant linking
- Subscription and billing flows integrated with Stripe, including pricing UI and managed subscription management
- Developer documentation section with navigation, search, and markdown rendering (`/developers`)
- Contact and partner inquiry forms with backend handling and CRM integration
- News/updates or blog engine to broadcast ecosystem announcements
- Analytics/console views highlighting ecosystem metrics and growth
- “FireUX Shop” marketplace for templates and extensions

## 🧩 Planned / Cross-Package Dependencies

- Authentication and billing must align with platform services in `fireux-core` and tenant packages; coordinate on shared composables and backend functions
- Documentation portal may leverage content tooling defined in `copilot-documentation`; confirm preferred markdown/MDX pipeline
- Marketplace and subscription features likely depend on future Stripe catalog + licensing services; ensure ADR coverage before implementation

## Next Actions

- [ ] Author real `/get-started` onboarding content and align route naming with literature
- [ ] Build `/projects` showcase and `/developers` documentation hub with navigation + content sources
- [ ] Implement auth flows leveraging FireUX core composables and connect accounts across tenants
- [ ] Design pricing and subscription flows, integrating with Stripe for payments and plan management
- [ ] Create contact/partner form endpoints and UI, wiring to CRM or email automation
- [ ] Stand up news/updates feed and analytics console to surface ecosystem metrics
- [ ] Plan and prototype the FireUX Shop marketplace for templates and extensions
