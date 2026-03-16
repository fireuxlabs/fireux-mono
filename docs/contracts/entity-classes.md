# Entity Classes
Authority: Tier2 (Operational contract)
Updated: 2026-03-16

Purpose: define the three FireUX entity classes so model files, naming, stamps, and helper types feel like they were designed by one team.

This guide is operational and must not conflict with Tier1 canon:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`

## One Sentence Canon
Every FireUX entity must belong to exactly one entity class: `Root`, `Runtime Child`, or `Dual-Layer`, and each class must use one consistent model contract, naming scheme, and stamp shape.

## Shared Rules
Every entity model must answer these questions in the same order:
1. What class is it: `Root`, `Runtime Child`, or `Dual-Layer`?
2. What is its canonical Firestore path?
3. What is its exported runtime object name?
4. What are its stamps called?
5. Does it have a read-time enriched shape?
6. Does it expose create and update helpers?

Shared defaults:
- Strings use empty string when unset unless the field is intentionally optional.
- Arrays always exist.
- Persisted stamps are nested as `created` and `updated`.
- Flat `created_at` and `updated_at` fields are migration compatibility only.
- Read-time enriched shapes must be named `EntityResolved` or `EntityView` and must never be treated as persisted storage shapes.
- Prefer `const object + derived type` over interface-first model definitions.

## Class A: Root Entity
Use when one canonical top-level collection is the source of truth and there is no official overlay.

Firestore shape:
- `collection/{id}`

Examples:
- `apps/{appId}`
- `users/{userId}` when no app overlay is involved in the contract
- `places/{placeId}`
- `jobs/{jobId}`
- `products/{productId}`
- `blogs/{blogId}`
- `ingredients/{ingredientId}`

Model contract:

```ts
export const Entity = {
  id: '' as string,
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
  [K in keyof typeof Entity]: (typeof Entity)[K]
}
```

Rules:
- One canonical model object: `Entity`.
- One collection of truth.
- No official overlay in the same entity contract.
- Optional helper types: `EntityCreateInput`, `EntityUpdateInput`.
- Optional read models: `EntityResolved`, `EntityView`.

## Class B: Runtime Child Entity
Use when the entity only exists under a parent entity or runtime and its identity is incomplete without that parent.

Firestore shape:
- `parents/{parentId}/children/{childId}`

Examples:
- `kitchens/{kitchenId}/mise/{taskId}`
- `kitchens/{kitchenId}/menus/{menuId}`
- `kitchens/{kitchenId}/dishes/{dishId}`
- `portfolios/{portfolioId}/properties/{propertyId}`
- `portfolios/{portfolioId}/documents/{documentId}`
- `portfolios/{portfolioId}/tasks/{taskId}`

Model contract:

```ts
export const ChildEntity = {
  id: '' as string,
  parent_id: '' as string,

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

export type ChildEntity = {
  [K in keyof typeof ChildEntity]: (typeof ChildEntity)[K]
}
```

Rules:
- Parent id must exist explicitly in the stored shape, even when implied by the path.
- Identity is `parent_id + id`, not just `id`.
- The entity must never be presented as globally canonical.
- Optional helper types: `ChildEntityCreateInput`, `ChildEntityUpdateInput`.
- Runtime child entities should not gain app overlays unless the extension contract makes that need explicit.

## Class C: Dual-Layer Entity
Use when the entity has one core truth and one local or app overlay.

Firestore shape:
- Core path: `collection/{id}`
- App path: `apps/{appId}/collection/{id}`

Examples:
- `users/{userId}` + `apps/{appId}/users/{userId}`
- `kitchens/{placeId}` + `apps/{appId}/kitchens/{placeId}`
- `portfolios/{portfolioId}` + `apps/{appId}/portfolios/{portfolioId}`
- `suppliers/{supplierId}` + `apps/{appId}/suppliers/{supplierId}`
- `chefs/{uid}` + `apps/{appId}/chefs/{uid}`
- `agents/{uid}` + `apps/{appId}/agents/{uid}`
- `professionals/{uid}` + `apps/{appId}/professionals/{uid}`

Model contract:

```ts
export const EntityCore = {
  id: '' as string,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type EntityCore = {
  [K in keyof typeof EntityCore]: (typeof EntityCore)[K]
}

export const EntityApp = {
  id: '' as string,

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

export type EntityApp = {
  [K in keyof typeof EntityApp]: (typeof EntityApp)[K]
}
```

Rules:
- Dual-layer entities must use the suffixes `Core` and `App`.
- `Core` holds identity and shared truth.
- `App` holds governance, tenant overrides, console flags, join lists, admin lists, and local policy.
- Optional aliases: `type Entity = EntityCore`, `type EntityModel = EntityCore`.
- Optional enriched shapes: `EntityResolved`, `EntityView`.
- Do not invent unrelated second model names for the same dual-layer entity.
- Wrapper files must not look like fully independent second models.

## Naming Canon
- Root entities: `Entity`
- Runtime child entities: `ChildEntity` or domain name in root-style form such as `Menu`, `Dish`, `KitchenMiseTask`
- Dual-layer entities: `EntityCore`, `EntityApp`
- Enriched shapes: `EntityResolved`, `EntityView`
- Write helpers: `EntityCreateInput`, `EntityUpdateInput`

## Drift Signals
Flag a model when any of the following are true:
- interface-first style where the repo class canon expects `const + derived type`
- flat timestamp fields as the preferred contract
- `updated.by` typed from `created` instead of `updated`
- mixed classes in one model file without an explicit contract note
- duplicate wrapper model files that look like separate canonical entities
- class naming drift such as `Core`, `App`, `Model`, `Resolved`, and `Doc` used inconsistently

## Practical Lock
For new work:
- Root entities use `const Entity` plus derived `type Entity`.
- Runtime child entities use the same style plus required parent id.
- Dual-layer entities use `const EntityCore`, `type EntityCore`, `const EntityApp`, `type EntityApp`.

For migration work:
- Normalize dual-layer entities first.
- Then normalize root entities.
- Then normalize runtime child entities.