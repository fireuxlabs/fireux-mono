# Model & Interface Reference

This guide consolidates the current FireUX data models that power app users, shared profiles, and the Jobs/Agent domain. Use it as a quick map when wiring composables or UI helpers.

## Core User Models (`packages/core/fireux-core/src/runtime/models/core/user.model.ts`)

### `User`

- Represents the canonical Firestore user document.
- Key identity fields: `id`, `display_name`, `avatar`, optional `handle`, `email`, `bio`.
- Membership arrays (`profiles`, `userOf`, `adminOf`) describe global and tenant roles.
- System metadata: `created_at`, `updated_at`.
- Tenant overlay info (`role`, `appUser`) and optional `notifications` bucket.

### `AppUser`

- Tenant-scoped overlay stored alongside the core user.
- Tracks `role`, `creator_id`, timestamps, and tenant-specific notifications.

### `UserCard` namespace

- UI projections used by dashboard components.
- `UserCard.Card` is the canonical UI payload produced by `useUserInterface().card()`.
- Cards are presentational-only; business logic (CTA, badge decoration, permissions) lives in callers.

## Shared Profile Contract (`packages/core/fireux-core/src/runtime/models/core/profile.model.ts`)

### `Profile`

- Minimal shape applied to every domain profile (Chef, Supplier, Agent, Professional, etc.).
- Fields: `id`, `user` (partial `User`), `domain`, `title`, `subtitle`, `badges`, `created_at`, `updated_at`.
- Allows the core Firestore composables to treat all profile types uniformly.

### `ProfileConfig`

- Describes how a domain hooks into shared profile tooling.
- Keys: `id`, `collectionName`, `profileType`, plus optional CTA/nav labels/icons.
- Passed to composables like `useProfile`, `useProfileCollection`, and ensure/update helpers.

## Agent Domain Models (`packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts`)

### `AgentCoreProfile`

- Global agent profile stored in `/{collectionName}/{id}`.
- Fields: `id`, timestamps, and current domain attributes (`tagline`, `badges`).
- Narrower than the generic `Profile`, but still compatible through the `AgentProfile` alias.

### `AgentAppProfile`

- Placeholder for tenant-specific agent properties (e.g., local visibility, app tags).
- Not populated yet, but reserved for per-app overrides.

### `Agent`

- Hydrated object returned by `useAgent()`: `{ user, core, app }`.
- `user` comes from the core `User` record, while `core`/`app` come from the Firestore profile refs.

### `AgentProfile`

- Alias pointing to `AgentCoreProfile` to keep legacy imports working while the domain is simplified.

### `AgentCard` namespace (`useAgentInterface.ts`)

- UI-facing `AgentCard.Card` payload emitted by `useAgentInterface().card()`.
- Follows the same canonical card DTO shape used by App/User.
- `useAgentInterface()` should also expose `searchText(raw)` (or `searchText(target?)`) so collection managers can filter via the interface rather than guessing fields.

## Core App Model (`packages/core/fireux-core/src/runtime/models/core/app.model.ts`)

### `App`

- Canonical Firestore document describing an app/tenant.
- Identity/display: `app_name`, optional `app_short_name`, `slug`, brand assets (`avatar_url`, `logo_url`, `wordmark_url`).
- Scope/governance: `role`, `ecosystem`, ownership metadata (`creator_id`, `admin_ids`, `join_requests`).
- Ops metadata: `status`, `description`, optional `social_links`, timestamps (`created_at`, `updated_at`).

### `AppCard.Card`

- Produced by `useAppInterface().card()` in:
	`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts`
- Model files remain Firestore schema-only; projection/mapping happens in the interface composable.
- Canonical card DTO shape:
	`id`, `to`, `avatar`, `title`, `subtitle`, `badges`, `line1`, `line2`, `line3`
- Badges are caller-owned: interfaces default to `badges: []`.

### `useAppInterface`

- Accepts an `App` ref (or lazy target) and builds the `AppCard.Card` payload.
- Strict: throws when required inputs are missing.
- No badge decisions: returns `badges: []` and lets the caller decorate based on context.

## How They Fit Together

1. **Config** — Each domain exposes a `ProfileConfig` (e.g., `agentConfig`). The shared profile composables use this to fetch global/app documents and hydrate `ProfileRefs`.
2. **Profile refs → domain types** — Domains type their refs (`AgentProfile`) and optionally extend the shape with extra fields. Core utilities dont need to know the specifics.
3. **User overlay** — `useProfileCollection` enriches every profile entry with the canonical `User` (`profile.user`). This lets downstream helpers (like `resolveAgentPill`) access avatar/name data without issuing extra queries.
4. **Hydrated models** — Domain composables (e.g., `useAgent`) build a richer object (`Agent`) by combining the core user, core profile, and app overlay. This is the hand-off point for UI helpers, mutations, and previews.

Keep this file updated as new domains or fields land so everyone knows where the source of truth lives.

## Proposed Simplifications (Short-Term Guardrails)

To keep the stack maintainable while Agent and other profile domains are still forming, adopt the following interim rules:

1. **Unify UI projections** – For every domain, expose a single `XCard.Card` payload (same DTO fields) that powers Pill/Cell/Preview/Profile views. Components control density; interfaces control mapping.

2. **No interface logic in model files** – Model files should declare TypeScript interfaces/types only. Helper logic (resolvers, formatters, route builders) must live inside composables (e.g., `useAgentInterface.ts`). This keeps data contracts and UI behavior separate and makes future schema changes easier.

3. **Explicit ownership per profile** – Each domain profile should always reference its owning user via `profile.user` (partial `User`) and the canonical `userId`. When tenants add overlays, ensure we store the creator/admin context (`creator_id`, `app_id`) on the app profile so we can trace provenance without inference.

4. **Minimum fields per profile** – Until the domain matures, keep core profiles limited to `id`, `tagline` (or `title`), `badges`, and timestamps. Any experimental fields should live in app overlays to avoid migrations.

5. **Document the contract** – For every domain added to this file, include: (a) where the Firestore core doc lives, (b) whether an app overlay exists, (c) which composable hydrates the full object, and (d) which components/composables own the UI projections.

Once the domain requirements solidify, we can revisit richer per-view interfaces, but these guardrails keep things predictable while we “hold the fort.”
