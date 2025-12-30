#+#+#+#+#+#+#+#+━━━━━━━━━━━━━━━━━━━━━━━
# Interfaces (useXInterface) — Canon v2
#+#+#+#+#+#+#+#+━━━━━━━━━━━━━━━━━━━━━━━

## Purpose

Define a clean, stable contract between Firestore models and UI components.

`use*Interface` composables map raw data → neutral UI payloads, without awareness of where they are rendered.

App is the reference implementation.

## Core Principles (Locked)

### 1) Interfaces are UI-only mappers

- Firestore models handle:
  - validation
  - persistence
  - permissions
- `use*Interface` handles:
  - mapping entities → display-ready props
- `use*Interface` does not implement:
  - environment knowledge
  - permission logic
  - routing policy (it may emit a canonical `href`, but does not decide access)

### 2) “Card” is the collective concept

- Card = Pill | Cell | Preview | Profile
- Pill / Cell / Preview / Profile are rendering variants
- The interface returns one card payload; variants consume what they need

### 3) One payload powers all cards

Preferred pattern:

- One card payload → used by Pill / Cell / Profile / Preview
- Avoid branching payloads per surface unless absolutely required

### 4) Pages stay thin

- Index pages render: `CTA + Collection/Manager`
- Detail pages (`[id].vue`) render: Profile card
- Pages do not map data; mapping happens in the interface

### 5) Badges are contextual, not intrinsic

- Interfaces always return: `badges: []`
- Badges are injected by:
  - Collection managers
  - Pages
  - Higher-order UI contexts
- Interfaces never compute:
  - roles
  - memberships
  - status labels
  - environment flags

## Canonical Card Payload Contract

This is the only required payload an interface must return.

```ts
export interface CardPayload {
  title: string
  subtitle: string
  image: string
  href: string
  badges: string[] // always present; injected later by environment
}
```

Rules:

- No initials
- No IDs
- No permissions
- No memberships
- No derived environment state

## Decision (Locked): no `pill.model` (or `cell.model`, `profile.model`)

- Pill is a visual primitive, not a domain model.
- The contract is convention (and optionally component-local typing), not a shared inheritance tree.
- Interfaces return plain objects that match what the primitive consumes.

## Key correction (important)

- There is ONE payload per interface.
- Do not define `XPillProps`, `XCellProps`, `XProfileProps`.
- Do not “spread” between types.
- Rendering variants (Pill / Cell / Preview / Profile) consume what they need.

## Inventory

### Core

#### App (Reference Implementation)

File:

- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts`

Export:

- `useAppInterface(appRef?: Ref<App | null | undefined>)`

Contract (canonical example):

```ts
export function useAppInterface(appRef?: Ref<App | null | undefined>) {
  const card = (target?: App | null): CardPayload => ({
    title: target?.app_name ?? '',
    subtitle: target?.ecosystem ?? '',
    image: target?.img ?? '',
    href: target?.id ? `/apps/${target.id}` : '',
    badges: [],
  })

  return {
    card,
  }
}
```

Notes:

- Interfaces never return `null`
- Missing data → safe fallbacks
- Badge injection happens elsewhere

Used by:

- Detail page: `pages/apps/[id].vue` → passes `card` into Profile
- Collection: `components/organisms/App/Collection/Manager.vue` → passes `card` into Pill
- Composable facade: `useApp()` spreads interface output

#### User

File:

- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts`

Export:

- `useUserInterface(source?: Ref<User | null | undefined> | UserRefs, context?: { runtime?: 'global' | 'tenant'; appId?: string | null })`

Used by:

- Detail page: `pages/users/[id].vue`
- Collection: `components/organisms/User/Collection/Manager.vue`
- Facade: `useUser()`

### Extensions

Blogs:

- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/utils/view/useBlogInterface.ts`

Jobs:

- `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts`

Products:

- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/view/useProductInterface.ts`

Places:

- `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface.ts`

Jobs profiles:

- Agent: `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentInterface.ts`
- Professional: `packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts`

### Ecosystem (Misebox)

- Chef: `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefInterface.ts`
- Supplier: `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts`

## Next logical steps (not doing yet)

- Strip badge logic from `useUserInterface`, `useChefInterface`, `useAgentInterface`, etc.
- Move badge decisions into collection managers and page-level adapters.
- Simplify Pill components to render-only.
