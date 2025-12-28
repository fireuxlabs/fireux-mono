# Agent profile strategy (temp)

Date: 2025-12-27

## Goals

- Make the Agent profile **rich** while staying consistent with the existing domain profile pattern (Chef/Supplier/Professional).
- Keep a clean separation between:
  - **membership/role** (AppUser overlay)
  - **domain profiles** (global truth + optional tenant deltas)
- Ensure the Agent can be created/edited by the user via `/dashboard/agent/profile`, and used as a browseable “directory entity” (pill/cell/profile view models).

Agent is a **posting identity**, so “richness” should support:
- trust (“who is this agent?”)
- contact
- scope (“what kind of roles / regions?”)

## Canon data model (do not mix concepts)

### A) App membership overlay (always app-scoped)

- Path: `apps/{appId}/users/{uid}`
- Type: `AppUser`
- Purpose: role/admin, permissions, app-scoped notifications, onboarding.
- Exists for any `appId` (including operator apps like `misebox-app`).

### B) Domain profile (global truth)

- Path: `agents/{uid}` (canonical; keep it aligned with other profiles)
- Type: `AgentProfile` (core doc)
- Purpose: canonical Agent identity and domain data.

Note: avoid introducing `agents/{agentId}` until we actually need multi-agent org constructs.

### C) Tenant profile overlay (tenant deltas)

- Path: `apps/{tenantAppId}/agents/{uid}`
- Type: `AgentAppProfile` (overlay doc)
- Purpose: tenant-specific deltas (visibility, local badges/labels/settings).
- Read/write only when `isTenant === true` (unless explicitly admin-fetched by a target app id).

## Model “shape” conventions (match other domains)

### Domain wrapper (hydrated state)

- `Agent` wrapper is the composable-facing object:
  - `user`: canonical `User` pill (display name, avatar)
  - `core`: `AgentProfile | null`
  - `app`: `AgentAppProfile | null`

### Firestore-facing profile types

- `AgentProfile` = core doc shape (`agents/{uid}`)
- `AgentAppProfile` = overlay doc shape (`apps/{appId}/agents/{uid}`)

### UI view models belong in `useAgentInterface`

- Pills / Cells / Profile-card shapes should be produced by `useAgentInterface` (like `useAppInterface`, `useUserInterface`), not embedded as shared props in the model.
- This keeps model files “shape-first” and view-model logic centralized.

## Minimal “rich” Agent surface (phased)

### Phase 1 (already in motion / baseline)

- Contact + identity:
  - `bio_short`
  - `contact_email`
  - `contact_phone`
  - `website_url`
- Basic branding:
  - `title`, `subtitle`, `tagline`, `badges`

### Phase 2 (richness without overfitting)

- Add structured, reusable fields consistent with other profiles:
  - `specialties: string[]`
  - `locations: string[]`
  - `languages: string[]`
  - `links` (structured social links)
  - `portfolio` (lightweight array of items)

Principle: prefer arrays + simple objects, avoid deep nesting until needed.

## Composables plan (align with core patterns)

### Required

- `useAgent()` orchestrator (keep it thin)
  - hydrates and exposes: `agent` (wrapper), raw refs, `pending`
  - delegates view models to `useAgentInterface`
  - delegates writes to `useAgentUpdate`
  - delegates creation/ensure to `useAgentCreate` / `useProfileEnsure`

Guardrail: one job per composable.

### Mutations

- `useAgentUpdate(refs)` should:
  - write core updates to `agents/{uid}`
  - write overlay updates to `apps/{appId}/agents/{uid}` only in tenant mode

### Explicit admin fetch (optional but recommended)

- `useAgentAppProfileFetch(targetAppId, uid)`
  - reads `apps/{targetAppId}/agents/{uid}`
  - used only by operator/admin tooling
  - must not depend on “current runtime app” hydration

## UI routes

- `/dashboard/agent`
  - overview and entry point
  - shows status + CTA link to profile builder

- `/dashboard/agent/profile`
  - profile builder / editor
  - supports create-when-missing via ensure flow

## Consistency checks (definition of done)

- Agent model file follows the same structural pattern as Chef/Supplier/Professional.
- `useAgentInterface` is the single source for pill/cell/profile view models.
- `useProfileFetch` gating remains canonical:
  - domain overlays only read in tenant mode
- `apps/{appId}/users/{uid}` remains membership-only (role/notifications), not a proxy for tenant mode.

## Next implementation steps

1. Confirm Agent model matches the Chef/Supplier/Professional shape (types + naming).
2. Ensure the Agent editor writes to the right document(s) via `useAgentUpdate`.
3. Add an explicit admin overlay fetch helper (target app id) if operator tooling needs it.
4. Add one directory/list view that uses `resolveAgentCell`/`pillProps` (via `useAgentInterface`) as the canonical mapping.

## Guardrails (paste into future Copilot prompts)

You are editing FireUX. Follow canon strictly:

- Do NOT mix AppUser membership overlay with domain profile overlays.
  - AppUser: apps/{appId}/users/{uid} is membership/roles/notifications only.
  - Domain profile: agents/{uid} is canonical truth.
  - Tenant delta: apps/{tenantAppId}/agents/{uid} only read/write when isTenant === true unless explicitly admin-fetched by targetAppId.

- Keep model files SHAPE-FIRST:
  - Domain wrapper { user, core, app }
  - Card namespace (ProfileCore/ProfileApp) if used elsewhere
  - NO UI props in model files.

- View models only in useAgentInterface (pill/cell/profile).
- Writes only in useAgentUpdate.
- Creation/ensure only in useAgentCreate or useProfileEnsure.

- Do not add extra entities, deep nesting, or new collections unless required.
- Keep changes minimal and consistent with Chef/Supplier/Professional patterns.
