# Entity Classes
Authority: Tier2 (Operational contract)
Updated: 2026-03-29

Purpose: define the FireUX entity classes so model files, naming, and stamps feel like they were designed by one team.

This guide is operational and must not conflict with Tier1 canon:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`

## One Sentence Canon
Every FireUX entity must belong to exactly one class: `Root`, `Scoped`, or `Overlay-backed`.

## Shared Rules
Every entity model must answer these questions in the same order:
1. What class is it: `Root`, `Scoped`, or `Overlay-backed`?
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

## Class A: Root
Use when one canonical top-level collection is the source of truth and there is no official stored overlay.

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
- No official overlay in the same contract

## Class B: Scoped
Use when the entity only exists because a parent console or parent entity owns it.

Firestore shape:
- `parents/{parentId}/children/{childId}`
- or `apps/{appId}/parents/{parentId}/children/{childId}`

Examples:
- kitchen-owned `Menu`, `Dish`, `Recipe`, `KitchenOrder`
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
- no second overlay unless the extension contract makes that need explicit

## Class C: Overlay-backed
Use when one root entity has one real stored overlay.

Firestore shape:
- Root path: `collection/{id}`
- Overlay path: `apps/{appId}/collection/{id}`

Examples:
- `users/{userId}` + `apps/{appId}/users/{userId}`
- `kitchens/{kitchenId}` + `apps/{appId}/kitchens/{kitchenId}`
- `portfolios/{portfolioId}` + `apps/{appId}/portfolios/{portfolioId}`
- `projects/{projectId}` + `apps/{appId}/projects/{projectId}`
- `suppliers/{supplierId}` + `apps/{appId}/suppliers/{supplierId}`
- `chefs/{uid}` + `apps/{appId}/chefs/{uid}`

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
- overlay shape stays focused on scoped truth, governance, or console access
- no hydrated `Resolved` type in the model file

## Naming Canon
- Root entities: `EntityModel`, `Entity`
- Scoped entities: `EntityModel`, `Entity`
- Identity overlays: `EntityModel`, `Entity`, `AppEntityModel`, `AppEntity`
- Console overlays: `EntityModel`, `Entity`, `ConsoleEntityModel`, `ConsoleEntity`
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
- Overlay-backed entities use:
  - `EntityModel` + `Entity`
  - `AppEntityModel` + `AppEntity`, or
  - `ConsoleEntityModel` + `ConsoleEntity`

For migration work:
1. Normalize overlay-backed entities first
2. Then normalize root entities
3. Then normalize scoped entities
