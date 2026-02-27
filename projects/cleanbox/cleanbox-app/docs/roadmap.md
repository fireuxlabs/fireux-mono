# Cleanbox App Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Marketing landing experience (`app/pages/index.vue`) with hero, quick peek, and solutions sections
- Core wiring via `createFireuxConfig` to load the `fireux-cleanbox` module and shared layouts

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- Operational console with real-time crew scheduling, coverage alerts, and daily metrics
- Crew workspace for assignments, attendance, and mobile-ready check-ins
- QA workflow: checklist builder, photo uploads, approvals, and audit trails
- Client portal/consoles exposing proof of work, reports, and feedback channels
- Stripe-integrated billing engine (plans, invoices, payments, exports)
- Certification/compliance management for staff (training records, incident logging)
- In-app chat/feedback or notifications between management and field teams
- Analytics and reporting surfaces (KPIs, trends, multi-tenant summaries)
- PWA enhancements (manifest, offline caching, push) for crew devices

## 🧩 Planned / Cross-Package Dependencies

- Scheduling and workforce data should align with shared models in `fireux-cleanbox` and `fireux-core`; confirm data contracts before building UI
- QA photo capture will depend on Firestore/Storage patterns and possibly `fireux-cleanbox` extensions—coordinate to avoid duplicate upload logic
- Billing requires Stripe integration conventions from FireUX core; reuse shared services for customer and invoice management
- Chat/notifications may leverage a future messaging extension; align on transport (Firestore, Pub/Sub) before implementation
- Analytics consoles likely need a shared reporting pipeline; coordinate with platform analytics ADRs before building tenant views

## Next Actions

- [ ] Scaffold promised routes (`/get-started`, `/console`, `/crews`, `/qa`, `/billing`, `/clients`, `/reports`) with placeholder layouts
- [ ] Implement scheduling data layer and UI (shifts, crews, coverage alerts)
- [ ] Build QA module supporting checklist creation, photo uploads, and supervisor approvals
- [ ] Deliver client portal pages with report summaries, media galleries, and feedback capture
- [ ] Integrate Stripe billing (products, invoices, payment sync) following core patterns
- [ ] Add compliance tooling for certifications and incident tracking tied to crew profiles
- [ ] Introduce chat/notification channels or integrate with planned messaging extension
- [ ] Stand up analytics consoles and connect to FireUX analytics services
- [ ] Configure PWA support (manifest, offline caching, push notifications) for field crews
