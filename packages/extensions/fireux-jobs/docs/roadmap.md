# FireUX Jobs Extension Roadmap

Status legend: ✅ completed · ⚙️ in progress · ❌ missing · 🧩 planned (blocked on shared work)

## ✅ Completed

- Basic navigation/composable scaffolding (`useJobRoutes`, global `useJob*` CRUD helpers)
- Agent and professional profile pages integrated with shared profile engine

## ⚙️ In Progress

- Nothing identified

## ❌ Missing

- End-to-end job posting forms with tenant-customizable fields, validation, and Firestore wiring
- Job detail views (`/jobs/[id]`) showing description, requirements, and apply actions
- Application pipeline (submission forms, status tracking, notes, attachments)
- Contract generation, digital signatures, and lifecycle management
- Ratings/feedback system for agents and professionals
- Notifications (email/in-app) for new applications, status updates, and contract events
- Agent verification workflow, including document capture and approval states
- Multi-tenant filters and visibility controls for internal vs public job boards
- Administrative pages for `/applications`, `/contracts`, and agent job management

## 🧩 Planned / Cross-Package Dependencies

- Contract signing and notifications likely depend on shared services in `fireux-core`; align on messaging/email infrastructure
- Ratings and verification should integrate with profile data models across tenants (Misebox, Cleanbox); confirm schema extensions
- Multi-tenant filtering requires cooperation with tenant runtime config to scope Firestore queries and security rules

## Next Actions

- [ ] Design job posting schema per tenant and build form components with validation + Firestore integration
- [ ] Implement detailed job pages and application submission flows, including attachments
- [ ] Build application management dashboards (statuses, notes, filters) for agents and admins
- [ ] Introduce contract templates, signing workflow, and status tracking
- [ ] Add rating/feedback models and UI for temporary engagements
- [ ] Integrate notifications via email/in-app channels for job activity
- [ ] Deliver agent verification tooling with admin review flows
- [ ] Add `/applications`, `/contracts`, and `/jobs/[id]` routes with corresponding components
