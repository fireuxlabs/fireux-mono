# Agent ↔ Job Phase-1 (Horizontal MVP) — What Exists vs What Doesn’t

Date: 2025-12-28

This note maps the Phase-1 “prove the graph” briefing onto the current FireUX mono-repo models/collections.

## Ground rules from the brief (what we’re validating)
- Horizontal MVP: model *relationships*, not a rich domain.
- Each entity: Identity + linking fields + one “luck” property.

---

## Entity-by-entity reality check

### 1) User
**Brief**: `users/{uid}` with `id`, `display_name`, `avatar_url`; extra: `default_role`.

**Exists** ✅
- Collection: `users/{uid}` (core user doc)
- Model: `packages/core/fireux-core/src/runtime/models/core/user.model.ts`
- Core fields present:
  - `id`
  - `display_name`
  - `avatar` (note: field name is `avatar`, not `avatar_url`)
- Links present:
  - Profiles are linked implicitly by shared UID (`profiles?: string[]` lists profile domains like `agent`, `chef`, etc.)
- Extra “luck” property:
  - `default_role` ❌ not present
  - There *is* `role?: 'user' | 'admin'` and an `appUser` overlay, but that’s not the same intent as “default routing role”.

### 2) Agent (posting authority)
**Brief**: `agents/{uid}` with `id`, `name`, `type`; link `user_id`; extra `verified`.

**Exists (as a profile)** ✅ (partial match)
- Collection: `agents/{uid}`
- Config: `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts`
- Model: `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts`
- Identity present:
  - Uses shared UID via `Profile.id` (optional but standard across profiles)
- Fields present (current Agent profile shape):
  - `title`, `subtitle`, `tagline`, `badges`
  - `bio_short`, `contact_email`, `contact_phone`, `website_url`
- Linking fields:
  - No explicit `user_id` field (link is implicit via shared UID + optional embedded `user?: Partial<User>` from the shared `Profile` shape)
- Extra “luck”:
  - `verified` ❌ not present as a stored boolean
  - There is UI formatting for “verification status”, but it’s not currently modeled/stored.
- Gap vs brief:
  - No `type ('individual'|'company')` field.
  - No explicit `user_id` reference (it’s implicit).

### 3) Company
**Brief**: `companies/{companyId}` (auto-ID) with `id`, `name`, `website`, `logo_url`.

**Exists** ✅ (Phase 1 implemented)
- Collection: `companies/{companyId}`
- Model: `packages/extensions/fireux-companies/src/runtime/models/company.model.ts`
- Firestore helpers: `packages/extensions/fireux-companies/src/runtime/composables/useCompanies.ts`
- Core fields now supported:
	- `id` (doc ID, typically attached by FireUX fetch helpers)
	- `name`
	- `website` (optional)
  - `logo_url` (optional)

### 4) Agent ↔ Company relationship
**Brief**: relationship modeling.

**Doesn’t exist (by design, for now)** ❌
- We are intentionally treating Company as a dead object (identity only).
- Jobs link to company via `job.company_id` and to the posting authority via `job.posted_by_agent_id`.

### 5) Place
**Brief**: `places/{placeId}` where ID is Google Places ID; `id`, `name`, `address`; extra `latlng`.

**Exists** ✅ (strong match, slightly different field names)
- Collection: `places/{placeId}` (the composable expects an ID when fetching a doc)
- Model: `packages/extensions/fireux-places/src/runtime/models/place.model.ts`
- Identity:
  - Uses `place_id` (Google Place ID)
- Core fields:
  - `place_id`, `name`, `formatted_address`
- Links:
  - Google Places API supported via server endpoints under `packages/extensions/fireux-places/src/runtime/server/api/places/*`
- Extra “luck”:
  - Uses `lat` + `lng` (instead of a combined `latlng`)

### 6) Kitchen
**Brief**: `kitchens/{kitchenId}` (auto-ID) with `id`, `name`, `place_id`; extra `type`.

**Exists** ✅ (but modeled differently)
- Collection: `kitchens/{id}` (Misebox ecosystem)
- Model: `packages/ecosystem/fireux-misebox/src/runtime/models/Kitchen.model.ts`
- Identity:
  - `id` exists
  - Comment indicates `id` == `place_id` (1:1 mapping with Places)
- Core fields:
  - `id`, `name`, optional `description`, optional `app_id`
- Links:
  - No explicit `place_id` field because the link is encoded by `id == place_id`
- Extra “luck”:
  - `type` ❌ not present
- Gap vs brief:
  - Brief wants kitchens as a distinct object (auto-ID) that references a place.
  - Current implementation treats kitchen as a place-alias (same ID), which is simpler but less flexible.

### 7) Job
**Brief**: `jobs/{jobId}` with `id`, `title`, `status (draft|live)`, `posted_by_agent_id`; links to agent/company/place/kitchen; extra `source`.

**Exists** ✅ (minimal, but the graph links are mostly missing)
- Collection: `jobs/{jobId}`
- Model: `packages/extensions/fireux-jobs/src/runtime/models/job.model.ts`
- Current core fields:
  - `id`, `app_id`, `created_by`, `title`, `status ('open'|'closed')`, optional `description`
- Links present:
  - `created_by` (user uid)
  - `app_id` (tenant/app scope)
- Links supported (Phase-1 additions):
	- `posted_by_agent_id` (optional)
	- `company_id` (optional)
	- `place_id` (optional)
	- `kitchen_id` (optional)
- Extra “luck”:
	- `source` (optional)
- Status mismatch:
  - current: `open|closed`
  - brief: `draft|live`

### 8) Chef / Professional / Supplier (profiles)
**Brief**: `{domain}/{uid}` with `id`, `name`; link `user_id`; extra `public`.

**Exists** ✅ (as profiles)
- Collections:
  - `chefs/{uid}` (Misebox)
  - `professionals/{uid}` (Jobs)
  - `suppliers/{uid}` (Misebox)
- Models:
  - `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts`
  - `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts`
  - `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts`
- Core fields:
  - All inherit the shared `Profile` shape (supports `id`, `title`, `subtitle`, `tagline`, etc.)
- Links:
  - No explicit `user_id` field (link is implicit via shared UID + optional `user?: Partial<User>`)
- Extra “luck”:
  - `public` ❌ not present

---

## Summary: what the graph currently supports

**Already real (in data model)**
- `User ↔ Profiles` (via shared UID + `users.profiles[]` domain list)
- `Agent` profile exists in `agents/{uid}`
- `Company` exists in `companies/{companyId}` (extension: `fireux-companies`)
- `Place` exists in `places/{placeId}` with Google integration
- `Kitchen` exists in `kitchens/{id}` (currently 1:1 with `place_id`)
- `Job` exists in `jobs/{jobId}` (scoped via `app_id`)

**Already supported (foreign keys exist, even if UI doesn’t use them yet)**
- Job edges: `job.posted_by_agent_id`, `job.company_id`, `job.place_id`, `job.kitchen_id`, `job.source`

**Not yet real (gaps vs the brief)**
- “Luck fields” still missing in stored data: `user.default_role`, `agent.verified`, `profile.public`
- Status mismatch: current job `open|closed` vs brief `draft|live`
- Kitchen link mismatch: brief expects `kitchen.place_id`, but current Misebox uses `kitchen.id == place_id`

If the goal is *exactly* the brief’s Phase‑1 graph, the next minimal delta is to add only the remaining “luck fields” (or explicitly drop them from the brief).