# fireux-jobs Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-15
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own jobs + agent/professional profile domain behavior for hiring flows.

## 2) Core entities
- `Job`
- `Agent`
- `Professional`

## 3) Identity rule
- Jobs are id-based (`job.id`); profile entities use stable profile ids (typically user-linked ids).
- `Professional` is a reusable person/service-provider profile, not a console workspace.
- Root `Professional` identity may be reused across apps; app overlays provide app-specific meaning such as hospitality worker, cleaning professional, or SEO consultant.

## 4) Collections + paths
- `jobs/{jobId}`
- `agents/{id}` and app-scoped agent overlays where configured
- `professionals/{id}` and app-scoped professional overlays where configured
- `apps/{appId}/professionals/{id}`

## 4a) Root scope fields
- `source_app_id`
- `source_ecosystem_id`
- `owner_type`
- `owner_id`
- `visibility`

Tenant and ecosystem job pages should filter the same root jobs through these fields rather than duplicating jobs under app paths.

## 5) Routes (public vs internal; slug vs id)
- Current routes are id-based:
  - `/jobs/[id]`, `/jobs/create`, `/jobs/edit/[id]`
  - `/agents/[id]`, `/professionals/[id]`
  - `/dashboard/agent/*`, `/dashboard/professional/*`
- `/dashboard/professional/*` is a personal dashboard/work area, not a console family.
- Public slug routes for jobs are not canonical yet.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across job/agent/professional organisms.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Firestore jobs/profile docs.
- Workplace links with other domains (for example places/kitchens) via explicit ids.
- Jobs, applications, bookings, projects, teams, reviews, and services may reference professionals by explicit ids.
- Professional dashboard surfaces may manage profile, applications, saved jobs, assigned work, availability, documents/CV, reviews, services, and case studies where app-specific.

## 8) SEO hooks
- Public job pages must provide:
  - `useJobSeo`
  - `buildJobJsonLd` (`JobPosting`)

## 9) Mutation entrypoints (write composables)
- `useJobCreate`, `useJobUpdate`, `useJobDelete`
- `useAgentCreate`, `useAgentUpdate`, `useAgentDelete`
- `useProfessionalCreate`, `useProfessionalUpdate`, `useProfessionalDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback workplace/entity selection.
- No implicit substitution between legacy and current job status/identity rules.
- No `professionals` console family by default.
- No treating a Professional profile as the selected workspace for operational work. Use the entity being operated, such as kitchen, supplier, portfolio, or project.
