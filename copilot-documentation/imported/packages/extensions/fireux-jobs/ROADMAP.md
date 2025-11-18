<!--
source: packages/extensions/fireux-jobs/ROADMAP.md
imported: 2025-11-18
-->

# FireUX Jobs — Roadmap

A multi-tenant workforce platform for profiles, job matching, and future on-demand staffing.

---

## Phase 1 — Foundations (Q1–Q2 2025)

**Goal:** Establish the core universal layer for jobs, profiles, and applications.

**Core Deliverables**

- FireUX Profiles (Professional / Employer / Chef / Cleaner / Supplier, etc.)
- Global and tenant profile collections
- Simple job model (title, description, pay range, location, created_by, timestamps)
- Job index pages (global and tenant scoped)
- Job details page
- Job creation flow
- Candidate application model
- Basic application flow (submit application, view applicants, view applications)

**FireUX Packages Affected**

- fireux-jobs
- fireux-core (user and profiles)
- Tenant packages (misebox, cleanbox, future tenants)

**Tenant Extensions**

- Misebox: chef-oriented job types (station, cuisine, tools)
- Cleanbox: cleaner-oriented job types (clean type, building size, schedule)

---

## Phase 2 — Matching Intelligence (Q3–Q4 2025)

**Goal:** Assist employers with smart matching and candidate recommendations.

**Deliverables**

- Basic matching score
- Job filters and search
- Talent discovery pages
- Employer shortlist feature
- Candidate availability and preferences
- AI-generated job descriptions
- AI-generated candidate summaries (profile snapshot)

**Tenant Extensions**

- Misebox: match on station, cuisine, menu types
- Cleanbox: match on cleaning type, building size, timing

---

## Phase 3 — Marketplace Layer (2026)

**Goal:** Enable hiring and job fulfilment through FireUX without acting as the employer.

**Deliverables**

- Stripe Connect (Platform) integration with flexible fee structure
- Secure messaging between candidates and employers
- Booking confirmation system
- Shift timeline (start time, end time, breaks)

**Compliance (light)**

- Auto NDA generation
- Auto service agreement per shift
- Auto invoice templates
- Safety prompts before shift

**Tenant Extensions**

- Misebox: recipe or task list for event prep
- Cleanbox: room or area breakdown for a cleaning job

---

## Phase 4 — Light Compliance System (2027)

**Goal:** Provide semi-automated HR and legal processes without becoming a full employer-of-record provider.

**Deliverables**

- Automated contract generation
- Automated invoice generation
- Tax summary export for workers
- Verified identity and verified employer flows
- Worker ratings, attendance, reliability tracking
- Employer ratings
- Dispute helper (AI-powered)

**Tenant Extensions**

- Misebox: kitchen safety and allergen checklist
- Cleanbox: cleaning standards checklist

---

## Phase 5 — Multi-Shift Scheduling System (2027–2028)

**Goal:** Expand from single-shift jobs to full scheduling and rota management.

**Deliverables**

- Multi-shift job posts
- Weekly rosters
- Worker availability calendar
- Auto-scheduling
- Shift reminders
- AI conflict detection
- Tenant-specific shift templates

**Tenant Extensions**

- Misebox: station schedules (hot, cold, pastry)
- Cleanbox: building rotation schedules

---

## Phase 6 — Workforce Automation Suite (2028–2029)

**Goal:** Equip large-scale hiring teams with advanced tooling.

**Deliverables**

- Hiring pipelines (screening, interview, trial shift, hired)
- Multi-location management
- Team accounts with role-based access
- Automated candidate recheck prompts
- Automated performance tracking
- SLA compliance tracking

**Tenant Extensions**

- Misebox: seasonal brigade planning tool
- Cleanbox: building contract planning

---

## Phase 7 — Payroll and Payment Automation (2029–2030)

**Goal:** Approach full staffing workflows without assuming employer-of-record responsibility.

**Deliverables**

- Time tracking
- Automated pay calculation
- Automated invoicing between parties
- Split payments (employer → platform → worker)
- Expense tracking
- Rate templates
- End-of-shift verification
- AI fraud detection (hours, location)

**Notes**

- Platform remains a payment facilitator
- Stripe handles payout compliance

---

## Phase 8 — EOR-Ready Platform (2030+)

**Goal:** Prepare FireUX to operate as a full temp-staffing powerhouse.

**Deliverables**

- Partnerships with payroll or EOR providers
- Worker leasing solutions
- Automated onboarding and compliance
- Insurance integrations
- Enterprise-grade analytics

**Strategic Vision**

- Cheaper, faster, more intelligent, cross-tenant temp staffing
- The Coople 2.0 opportunity

---

## Tech Architecture Evolution (High Level)

**Phase 1–2**

- Firestore-based profiles
- Per-tenant job collections
- Serverless functions for AI summaries

**Phase 3–5**

- Stripe Connect Platform
- Firestore to BigQuery for analytics
- Scheduling engine

**Phase 6–8**

- AI contract engine
- Automated payroll rules
- Identity verification partners
- EOR integrations
- Supervisor dashboard ("patrol system")

---

## Notes for Tenants

Each tenant (Misebox, Cleanbox, future tenants) can:

- Add domain-specific fields
- Override job creation UI
- Add tenant traits (cuisines, equipment, tasks)
- Extend the matching algorithm
- Add role-specific checklists
- Add custom dashboards

Tenants collectively benefit from:

- Global search
- Global profiles
- Shared job workflows
- Shared compliance engine
- Unified Stripe Connect setup
- Shared AI helpers

---

## Conclusion

FireUX Jobs starts simple—a clean job directory and profiles system—but is designed to grow into a full on-demand workforce platform shared across every tenant app.

The foundation in place today is correct, scalable, and future-proof.
