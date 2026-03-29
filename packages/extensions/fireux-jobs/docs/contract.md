# fireux-jobs Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own jobs + agent/professional profile domain behavior for hiring flows.

## 2) Core entities
- `Job`
- `Agent`
- `Professional`

## 3) Identity rule
- Jobs are id-based (`job.id`); profile entities use stable profile ids (typically user-linked ids).

## 4) Collections + paths
- `jobs/{jobId}`
- `agents/{id}` and app-scoped agent overlays where configured
- `professionals/{id}` and app-scoped professional overlays where configured

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
- Public slug routes for jobs are not canonical yet.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across job/agent/professional organisms.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Firestore jobs/profile docs.
- Workplace links with other domains (for example places/kitchens) via explicit ids.

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
