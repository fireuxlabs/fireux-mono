# Richie’s Reinigung Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Basic landing hero (`app/pages/index.vue`) with Richies copy and CTA links
- Nuxt tenant wiring via `createFireuxConfig` to load Cleanbox module

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Dashboard experience for managers covering shift assignments, attendance, and daily operations
- Crew directory with scheduling tools and mobile-friendly check-in flows
- QA verification module with photo uploads, timestamps, and checklist management
- Client database with job history, reports, and visual proof exports
- Billing workspace powered by Stripe (products, invoices, payment status)
- Compliance knowledge base for Swiss safety standards, including exportable forms
- Analytics dashboards tracking hours worked, job completion rates, and cost per site
- Localization/bilingual interface support (DE/EN) across routes and content

## 🧩 Planned / Cross-Package Dependencies

- Shift scheduling and attendance should build on shared Cleanbox workforce models (confirm availability in `fireux-cleanbox` or extend core)
- QA photo storage may rely on Firestore/Storage conventions defined in `fireux-core`; align before implementing uploads
- Billing flows depend on Stripe integration patterns from Cleanbox core; coordinate with core owners to avoid duplicate logic
- Compliance exports likely require shared reporting utilities; consider adding to `fireux-cleanbox` or a new extension

## Next Actions

- [ ] Design navigation and scaffold the promised routes (`/dashboard`, `/crews`, `/qa`, `/clients`, `/billing`) with placeholder layouts
- [ ] Implement crew scheduling and attendance tracking atop Cleanbox workforce data
- [ ] Build QA module supporting photo capture, checklist completion, and audit trails
- [ ] Ship client reporting views with job summaries, media galleries, and export options
- [ ] Integrate Stripe for billing (customer sync, invoices, payment reconciliation)
- [ ] Create compliance section with configurable Swiss safety checklists and downloadable reports
- [ ] Add analytics dashboards aggregating hours worked, completion rates, and cost metrics
- [ ] Introduce bilingual content strategy (i18n tooling, locale switcher, translated copy)
