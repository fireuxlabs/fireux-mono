# Profiles Interfaces + Surfaces (Pill-First)

Purpose: define a simple, repeatable FireUX system for slimming `use*Interface` composables and profile UI surfaces (`Pill` -> `Cell` -> `Preview` -> `Profile`) for:

- `Chef`
- `Professional`
- `Agent`

This is a design/report doc, not a refactor patch.

## Current Build Context (Misebox)

Use `professionals` in `misebox-app` as the primary design dataset for this refactor.

Reason:

- it is the richest real profile dataset currently in use
- it contains both sparse and dense records (good for surface resilience testing)
- it exercises the most surface layers (`pill`, `cell`, `preview`, `profile`)

Observed characteristics from `professionals` (Misebox):

- nested hydrated `user` object is present on collection records (`id`, `display_name`, `avatar`, `handle`, `email`)
- strong list/profile fields exist:
  - `job_title`, `summary`, `bio`, `image`
- richer profile arrays exist:
  - `positions`, `languages`, `relevant_experience`, `education`, `projects`, `certifications`, `volunteering`, `other_experience`
- field density varies a lot by user (some records are nearly empty, others are very rich)
- place references appear inside experience items (`place_id`, `place_collection`, optional `place_draft`)

This makes `Professional` the best first target for a slim-but-robust surface system.

Cross-ecosystem scope note (current reality):

- `misebox-app` = primary profile UX/dataset benchmark
- `fireux-app` = core platform baseline (no meaningful profile datasets attached to users)
- `cleanbox-app` = schema/path sanity only until real profile data exists

## Goals

- Make `use*Interface` files small and boring.
- Stop forcing one giant card shape to satisfy every surface.
- Build profile UI in phases:
  1. `Pill` first
  2. `Cell`
  3. `Preview`
  4. `Profile`
- Keep canon identity rules intact:
  - storage identity = `uid` (`doc.id`)
  - handle = public alias only

## FireUX Canon (Profiles)

- Core profile docs are keyed by uid:
  - `chefs/{uid}`
  - `professionals/{uid}`
  - `agents/{uid}`
- App overlays (if used) are also keyed by uid:
  - `apps/{appId}/chefs/{uid}`, etc.
- `uid` is the only identity for ownership/membership/doc paths.
- `handle` is a display + routing alias only.

## Main Problem (Current Pattern)

Current `use*Interface` files often become too long because they:

- try to satisfy all surfaces at once
- return placeholder fields for surfaces not being built yet
- carry compatibility baggage (`summary`, `locationsCsv`, `organizationName`, etc.)
- introduce local `Pick<>` micro-types (`UserLike`) that add noise
- mix view shaping with data repair/backfill thinking

Result: simple UI work (like a pill) becomes hard to reason about.

## FireUX Slim Style (Recommended)

### 1) Interface composables are view mappers, not data repair layers

`useChefInterface`, `useAgentInterface`, `useProfessionalInterface` should:

- map known values
- default to `''` or `[]` when needed
- return `null` only when required identity/display is missing

They should not:

- backfill old schema
- invent fallback domain data
- depend on legacy fields unless explicitly required

### 2) No mega card type

Do not use one `Card` type for all surfaces long-term.

Instead, define surface-specific shapes per domain:

- `ChefPillCard`
- `ChefCellCard`
- `ChefPreviewCard`
- `ChefProfileCard`

Start with only one pill card per domain. In practice, begin with `ProfessionalPillCard` (Misebox-first), then clone the pattern to Chef and Agent.

### 3) No micro convenience types unless reused

Avoid local types like:

- `type UserLike = Pick<User, ...> & Partial<...>`

Unless reused in multiple files/modules, just accept:

- `User | null | undefined`

and read the fields you need.

### 4) Components own optional rendering

Surfaces should be resilient:

- empty strings are OK
- empty arrays are OK
- components use `v-if` to hide missing sections

This lets interfaces stay slim and canon-first.

## Pill-First Surface Contract (Phase 1)

### Minimal requirement (per your current direction)

For a profile pill (starting with `Professional`), only map:

- `avatarUrl`
- `displayName`
- a single headline field (domain-native)

Practical note: pills also need navigation identity, so keep:

- `id`
- `to`

### Professional Pill contract (recommended first)

```ts
type ProfessionalPillCard = {
  id: string
  to: string
  avatarUrl: string
  displayName: string
  title: string
}
```

No `summary`, `bio`, `positions`, `languages`, `relevant_experience`, etc. in Phase 1.

### Chef Pill contract (after Professional pattern is stable)

```ts
type ChefPillCard = {
  id: string
  to: string
  avatarUrl: string
  displayName: string
  title: string
}
```

## Surface Growth Plan (Pill -> Cell -> Preview -> Profile)

Build only what each surface needs.

### Phase 1: Pill

Purpose:

- avatar
- display name
- short headline
- link

Contract example:

```ts
type ChefPillCard = {
  id: string
  to: string
  avatarUrl: string
  displayName: string
  title: string
}
```

### Phase 2: Cell (Professional-first)

Add only the fields the cell actually displays (not all future fields).

Example:

```ts
type ProfessionalCellCard = ProfessionalPillCard & {
  summary?: string
}
```

Notes:

- `summary` is a strong field in professionals and a good first body line
- do not pull in `bio`, `positions`, or `languages` yet

### Phase 3: Preview (Professional-first)

Add richer but still list-oriented details.

Example:

```ts
type ProfessionalPreviewCard = ProfessionalCellCard & {
  image?: string
  positionsCsv?: string
}
```

Notes:

- `image` is often empty in professionals, so component must tolerate `''`
- `positionsCsv` can be derived later from `positions[]` (optional, not required on first pass)

### Phase 4: Profile surface (Professional-first)

Add the full profile presentation shape (or pass raw profile + small vm mapper).

Example:

```ts
type ProfessionalProfileCard = ProfessionalPreviewCard & {
  bio?: string
}
```

Important: these are examples of layering, not a mandate to use inheritance if it makes files noisier. Separate small types are fine.

## Recommended `use*Interface` Shape

Keep the composable tiny and explicit.

### Example direction (`useProfessionalInterface`)

```ts
export function useProfessionalInterface(
  profile?: ProfileRefs<ProfessionalCore> | null,
  userRef?: Ref<User | null | undefined>
) {
  function pill(
    target?: ProfessionalCore | null,
    userOverride?: User | null
  ): ProfessionalPillCard | null {
    const professional = target ?? profile?.coreProfile.value ?? null
    if (!professional) return null

    const user = userOverride ?? userRef?.value ?? null
    const id =
      safeString((professional as any).owner_uid) ||
      safeString(user?.id) ||
      safeString((professional as any).id)

    const displayName = safeString(user?.display_name)
    if (!id || !displayName) return null

    return {
      id,
      to: `/professionals/${encodeURIComponent(id)}`,
      avatarUrl: safeString(user?.avatar),
      displayName,
      job_title: safeString((professional as any).job_title),
    }
  }

  return { pill }
}
```

This is the target style:

- small
- obvious
- no placeholder compatibility fields
- surface-specific (`pill`) rather than “one map for everything”

## Empty Values vs Crashes (Important)

Empty values are normal and should not crash surfaces:

- `''` image/avatar/title/summary
- `[]` badges/positions/languages/etc.

What *does* crash surfaces:

- `undefined` objects being passed into a component and then dereferenced (e.g. `current.preview.imageUrl`)

Rule:

- components and dev dummy pages should guard object presence (`v-if="current?.preview"`)
- interfaces should return valid minimal objects or `null`
- collection managers should tolerate `null` cards and filter them

## Naming Strategy (Important)

Stored Firestore fields stay domain-native in this phase (no migration):

- `job_title`
- `chef_headline`
- `agent_headline`

Interface/surface layer normalizes these to a shared surface field:

- `title`

Mapping examples:

- `Professional.title <- professional.job_title`
- `Chef.title <- chef.chef_headline`
- `Agent.title <- agent.agent_headline`

This keeps storage stable while simplifying pill/cell/preview components.

Two valid options:

### Option A: Domain-native fields (legacy/simple per-domain)

Keep surface output aligned to the model:

- `chef_headline`
- `agent_headline`
- `job_title`

Pros:

- less translation
- clearer per-domain debugging

Cons:

- harder to share a single generic `ProfilePill` component later

### Option B: Surface-normalized field names (recommended now)

Map interface output to a shared surface language:

- `title`

Pros:

- easier shared `ProfilePill`

Cons:

- extra mapping layer

Recommendation now: use **Option B** at the interface layer only (shared `title`), while keeping stored Firestore fields unchanged.

## Proposed Refactor Sequence (Minimal Risk)

### Batch 1 (Pill only, Professional first)

Do this first for:

- `Professional`

Then clone the exact pattern to:

- `Chef`
- `Agent`

Changes:

- slim `use*Interface` to pill-first contract
- ensure pill components only require pill fields
- keep other surfaces untouched (or tolerant of missing optional fields)

Why this order:

- `Professional` has the richest real dataset in Misebox, so if the slim system survives there, it will survive the simpler cases.

### Batch 2 (Cell)

- add a `cell()` mapper and `Cell` contract
- patch cell component prop typing to use only that contract

### Batch 3 (Preview)

- add `preview()` mapper and contract
- patch preview component to depend only on preview fields

### Batch 4 (Profile)

- decide between:
  - `profile()` card mapper, or
  - pass raw profile + tiny view-model computed in component

## Rules To Keep It Slim (FireUX Style)

- No placeholder properties “just in case”.
- No local `Pick<>` helper types unless reused across files.
- No giant `Card` interface for all surfaces.
- No `as any` in interfaces if the model can be typed correctly (fix model once).
- No data repair logic in `use*Interface`.
- Prefer one small `pill()` mapper over one giant `map()`.

## What “Done” Looks Like

For each of `Professional`, `Chef`, `Agent`:

- `use*Interface` is short and readable
- pill list renders from canonical/hydrated fields only
- no hidden dependency on removed stored `id`
- cell/preview/profile evolve in separate passes without bloating pill logic

---

This report intentionally favors incremental delivery over “perfect generic abstractions”.
Pill first. Make it work. Then grow surface-by-surface.
