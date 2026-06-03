# Entity Classes
Authority: Tier2 (Operational contract)
Updated: 2026-06-01

Purpose: define the FireUX entity classes so model files, naming, and stamps feel like they were designed by one team.

This guide is operational and must not conflict with Tier1 canon:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`

## One Sentence Canon
Every FireUX entity must declare exactly one storage shape: `root`, `scoped`, or `both`.

The repo-wide current matrix for those shapes lives in `docs/entity-creation.md`.
This document keeps the model naming and stamp contract aligned with that
matrix.

## Shared Rules
Every entity model must answer these questions in the same order:
1. What storage shape is it: `root`, `scoped`, or `both`?
2. What is its canonical Firestore path?
3. What is the stored model object called?
4. What are its stamps called?
5. Does it expose create and update helpers?

Shared defaults:
- Strings use empty string when unset unless the field is intentionally optional.
- Arrays always exist.
- Persisted stamps are nested as `created` and `updated`.
- Flat `created_at` and `updated_at` fields are migration compatibility only.
- Prefer `const object + derived type` over interface-first model definitions.
- Model files describe stored shapes only.
- Hydrated or enriched read shapes belong in fetch, runtime, or interface seams, not in the model file.

## Shape A: `root`
Use when one canonical top-level collection is the source of truth and there is no official secondary stored record.

Firestore shape:
- `collection/{id}`

Examples:
- `apps/{appId}`
- `ecosystems/{ecosystemId}`
- `places/{placeId}`
- `jobs/{jobId}`
- `products/{productId}`
- `blogs/{blogId}`
- `ingredients/{ingredientId}`

Model contract:

```ts
export const EntityModel = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Entity = {
  [K in keyof typeof EntityModel]: (typeof EntityModel)[K]
}

export type EntityCreateInput = Omit<Entity, 'id' | 'created' | 'updated'>
export type EntityUpdateInput = Partial<Omit<Entity, 'id' | 'created' | 'updated'>>
```

Rules:
- One canonical stored object: `EntityModel`
- One canonical stored type: `Entity`
- No official secondary stored record in the same contract

## Shape B: `scoped`
Use when the entity only exists because a parent console or parent entity owns it.

Firestore shape:
- `parents/{parentId}/children/{childId}`
- or `apps/{appId}/parents/{parentId}/children/{childId}`

Examples:
- kitchen-owned `Dish`, `Recipe`, `KitchenOrder`, `MenuSection`, `MenuItem`
- portfolio-owned `Property`, `Unit`, `Client`, `Document`

Model contract:

```ts
export const ChildModel = {
  id: '',
  parent_id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Child = {
  [K in keyof typeof ChildModel]: (typeof ChildModel)[K]
}
```

Rules:
- `parent_id` must exist explicitly in the stored shape when parent identity matters
- the entity is not globally canonical on its own
- no second stored residence unless the extension contract makes that need explicit

## Shape C: `both`
Use when one entity has root truth plus console or parent-scoped operating context.

Firestore shape:
- Root path: `collection/{id}`
- Console path: `apps/{appId}/collection/{id}`

Examples:
- `users/{userId}` + `apps/{appId}/users/{userId}`
- `kitchens/{kitchenId}` + `apps/{appId}/kitchens/{kitchenId}`
- `portfolios/{portfolioId}` + `apps/{appId}/portfolios/{portfolioId}`
- `projects/{projectId}` + `apps/{appId}/projects/{projectId}`
- `suppliers/{supplierId}` + `apps/{appId}/suppliers/{supplierId}`
- `chefs/{uid}` + `apps/{appId}/chefs/{uid}`

For `both`, the second record may be an app console record or operating
context. Do not turn those into separate entity families.

Published public routes do not make an entity `both` by themselves. For example,
Kitchen Menu is scoped to Kitchen even though published menus can render publicly.

Model contract:

```ts
export const EntityModel = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Entity = {
  [K in keyof typeof EntityModel]: (typeof EntityModel)[K]
}

export const AppEntityModel = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type AppEntity = {
  [K in keyof typeof AppEntityModel]: (typeof AppEntityModel)[K]
}
```

Rules:
- identity families use `AppXModel` / `AppX`
- console-backed families use `ConsoleXModel` / `ConsoleX`
- root shape stays honest and compact
- console/scoped shape stays focused on operating truth, governance, console
  access, or publication context
- no hydrated `Resolved` type in the model file

## Naming Canon
- `root` entities: `EntityModel`, `Entity`
- `scoped` entities: `EntityModel`, `Entity`
- App records: `EntityModel`, `Entity`, `AppEntityModel`, `AppEntity`
- Console records: `EntityModel`, `Entity`, `ConsoleEntityModel`, `ConsoleEntity`
- Write helpers: `EntityCreateInput`, `EntityUpdateInput`

## Drift Signals
Flag a model when any of the following are true:
- interface-first style where the repo class canon expects `const + derived type`
- flat timestamp fields as the preferred contract
- model files exporting hydrated or enriched read types
- mixed classes in one model file without an explicit contract note
- stale naming drift such as `Core`, `Collection`, `Resolved`, or `Doc` surviving after normalization

## Practical Lock
For new work:
- Root entities use `EntityModel` + `Entity`
- Scoped entities use the same style plus parent linkage where needed
- `both` entities use:
  - `EntityModel` + `Entity`
  - `AppEntityModel` + `AppEntity`, or
  - `ConsoleEntityModel` + `ConsoleEntity`

For migration work:
1. Normalize console-backed entities first
2. Then normalize root entities
3. Then normalize scoped entities
