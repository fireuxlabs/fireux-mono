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
- `MembershipBadge`, `Pill`, `Cell`, and `Profile` extend a shared pill model (`types/pill.model.ts`) and add FireUX-specific metadata (memberships, runtime context, etc.).

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

- UI-facing projections (`Pill`, `Cell`, `Profile`) emitted by the agent interface composable.
- Each structure includes `avatar`, `title`, `subtitle`, `tagline`, `badges`, routing metadata (`to`), and IDs when applicable.

## Core App Model (`packages/core/fireux-core/src/runtime/models/core/app.model.ts`)

### `App`

- Canonical Firestore document describing an app/tenant.
- Identity/display: `app_name`, optional `app_short_name`, `slug`, brand assets (`avatar_url`, `logo_url`, `wordmark_url`).
- Scope/governance: `role`, `ecosystem`, ownership metadata (`creator_id`, `admin_ids`, `join_requests`).
- Ops metadata: `status`, `description`, optional `social_links`, timestamps (`created_at`, `updated_at`).

### `AppCard.Card`

- Defined alongside `useAppInterface` (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/state/interface.ts`) so the model file stays schema-only.
- Single payload used by every view (Pill, Cell, Profile) so UI helpers stop drifting.
- Extends the shared `Pill` props and adds routing (`to`), identifiers, governance counts (`joinRequestCount`, `adminCount`), overlays (`app_short_name`, `slug`, `description`, `status`), and sanitized social links.
- Returned by `cardProps()` inside `useAppInterface`. The helper still exports `pillProps`/`cellProps`/`profileProps`, but each simply returns the same `Card` payload for backwards compatibility.

### `useAppInterface`

- Accepts an `App` ref (or lazy target) and builds the `AppCard.Card` payload.
- Normalizes array/string fields (`admin_ids`, `join_requests`, `social_links`) so the card is deduplicated and trim-cleaned before a component renders.
- This composable is the only place that should own link sanitizing + badge derivation for apps; model files remain interface-only per the current guardrails.

## How They Fit Together

1. **Config** — Each domain exposes a `ProfileConfig` (e.g., `agentConfig`). The shared profile composables use this to fetch global/app documents and hydrate `ProfileRefs`.
2. **Profile refs → domain types** — Domains type their refs (`AgentProfile`) and optionally extend the shape with extra fields. Core utilities dont need to know the specifics.
3. **User overlay** — `useProfileCollection` enriches every profile entry with the canonical `User` (`profile.user`). This lets downstream helpers (like `resolveAgentPill`) access avatar/name data without issuing extra queries.
4. **Hydrated models** — Domain composables (e.g., `useAgent`) build a richer object (`Agent`) by combining the core user, core profile, and app overlay. This is the hand-off point for UI helpers, mutations, and previews.

Keep this file updated as new domains or fields land so everyone knows where the source of truth lives.

## Proposed Simplifications (Short-Term Guardrails)

To keep the stack maintainable while Agent and other profile domains are still forming, adopt the following interim rules:

1. **Unify UI projections** – For every domain, expose a single `Card` shape that powers Pill/Cell/Profile views. Components can derive layout-specific bits locally (`<Pill>` only shows `title`+`tagline`, `<Cell>` may add badges). This mirrors the current Agent approach where all three computeds share the same payload.

2. **No interface logic in model files** – Model files should declare TypeScript interfaces/types only. Helper logic (resolvers, formatters, route builders) must live inside composables (e.g., `useAgentInterface.ts`). This keeps data contracts and UI behavior separate and makes future schema changes easier.

3. **Explicit ownership per profile** – Each domain profile should always reference its owning user via `profile.user` (partial `User`) and the canonical `userId`. When tenants add overlays, ensure we store the creator/admin context (`creator_id`, `app_id`) on the app profile so we can trace provenance without inference.

4. **Minimum fields per profile** – Until the domain matures, keep core profiles limited to `id`, `tagline` (or `title`), `badges`, and timestamps. Any experimental fields should live in app overlays to avoid migrations.

5. **Document the contract** – For every domain added to this file, include: (a) where the Firestore core doc lives, (b) whether an app overlay exists, (c) which composable hydrates the full object, and (d) which components/composables own the UI projections.

Once the domain requirements solidify, we can revisit richer per-view interfaces, but these guardrails keep things predictable while we “hold the fort.”
