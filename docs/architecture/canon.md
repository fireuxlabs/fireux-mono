---
title: Architecture Patterns Reference
description: Tier2 reference patterns for entity classes, page modes, and organism structure.
authority: Tier2
updated: 2026-03-02
---

# Architecture Patterns Reference
Authority: Tier2 (Reference; non-authoritative)

Authoritative canon is only:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`

This document is a Tier2 reference for runtime folder shapes and “entity organism” UI structure. It cannot override Tier1 canon.

Related (more specific) canons:

- Firestore object/entity composables + models canon: `docs/copilot-documentation/object-entity-canon.md`

## Repo-wide patterns

- Identity-first: resolve user + tenant context before doing work.
- Explicit stacks: shared modules flow through predictable folders.
- No shadow copies: one canonical implementation per concern.

---

## Entity classes + page mode canon

FireUX entities are grouped by how they are operated. This drives routing, edit patterns, and permissions.

Route identity policy (`[id]` vs `[slug]`) is authoritative in `docs/runtime-contract.md`.

### 1) Workspace entities

These are long‑lived workspaces with frequent edits and multiple tools.

**Traits**

- Owned or co‑owned
- Multi‑section UX
- Inline edits acceptable
- Console‑first

**Routing**

- `/console/<entity>/*`

**Examples**

- App
- User
- Chef
- Professional
- Agent
- Supplier
- Kitchen
- Company (when it graduates)

### 2) Operational content objects

These are created often, edited occasionally, and typically belong to a workspace entity.

**Traits**

- High volume
- Not a workspace on their own
- Dedicated create + edit routes

**Routing**

- `/<objects>/index`
- `/<objects>/create`
- `/<objects>/[id-or-slug]` (per `docs/runtime-contract.md`)
- `/<objects>/edit/[id]`

**Examples**

- Job
- Recipe
- Product
- Blog post
- Dish
- Menu (managed inside a workspace, not a console)

### 3) Reference / system objects

These are shared, lightly edited system entities used by other objects.

**Traits**

- Small shape
- Rarely edited
- Often derived or constrained
- Admin‑only mutation if needed

**Routing**

- `/<objects>/index`
- `/<objects>/[id-or-slug]` (optional, per `docs/runtime-contract.md`)
- `/<objects>/edit/[id]` only if mutations exist

**Examples**

- Ingredient
- Place
- Tag
- Category
- Skill
- Certification

### Canon rule (page modes)

- `/<entity>/[id-or-slug]` public/detail route identity follows `docs/runtime-contract.md`.
- `/<entity>/edit/[id]` is the mutation surface for operational objects.
- Inline editing is reserved for workspace consoles.

## Docs conventions

- Keep repo-wide docs in `/docs`; keep ecosystem/app notes in their local `docs/`.
- Prefer composables over ad-hoc helpers; keep inputs/outputs typed.

---

## Entity organism canon (components)

### Canon roots

All entity UI lives under runtime organisms:

- Core entities: `src/runtime/components/organisms/<Entity>/...`
	- Examples: `organisms/User`, `organisms/App`
- Profiles: `src/runtime/components/organisms/profiles/<Domain>/...`
	- Examples: `organisms/profiles/Chef`, `organisms/profiles/Agent`
- Objects: `src/runtime/components/organisms/objects/<Object>/...`
	- Examples: `organisms/objects/Blog`, `organisms/objects/Product`

### Canon folder shape (stable)

Each entity folder should follow this *stable* top-level shape. Parts may be omitted when the entity doesn’t support that UX.

```
<Entity>/
	CTA.vue
	Preview.vue

	Collection.vue

	Collection/
		Manager.vue

	Cards/
		Pill.vue
		Cell.vue
		Profile.vue

	Create/
		System.vue
		Write.vue
		Preview.vue

		utils/
			...

	Edit/
		Core.vue
		App.vue
		Preview.vue

	Sections/
		GlobalCollection.vue
		LocalCollection.vue

	utils/
		...
```

### Slot contract (required vs optional)

Required when the entity appears in UI:

- `CTA.vue` (may render nothing; pages still render it)
- `Preview.vue`

Required when the entity can appear in any list/selector:

- `Cards/Pill.vue`

Required when the entity is creatable:

- `Create/System.vue`
- `Create/Write.vue`
- `Create/Preview.vue`

Optional (only add when the UX exists):

- `Collection.vue`, `Profile.vue`
- `Cards/Cell.vue`, `Cards/Profile.vue`
- `Edit/Core.vue`, `Edit/App.vue`, `Edit/Preview.vue`
- `Sections/GlobalCollection.vue`, `Sections/LocalCollection.vue`

### Rules

- **Stable tree:** the top-level folders above are the “expected” slots. Prefer adding missing slots over inventing new top-level folders.
- **`utils/` rule:** special logic and one-off helpers belong in `utils/` (and may have subfolders). Avoid scattering bespoke files at the root of the organism.
- **`shared/` rule:** only introduce a `shared/` folder when 2+ entities import it; otherwise keep helpers/components inside the entity’s `utils/`.
- **Cards rule:**
	- `Cards/Pill.vue` is required when the entity is browsable/searchable/selectable.
	- Add `Cards/Cell.vue` and `Cards/Profile.vue` when list/profile views exist.
- **Cards variants rule:** entities may add bespoke cards (e.g. Blog “Article/Product/Page”), but treat them as variants; keep the canonical card slots when the entity is broadly browsable.
- **CTA rule (pages vs CTA):** index pages should render the entity CTA component unconditionally; **all gating belongs inside the CTA**.
- **Collection rule:** the canonical collection UI entrypoint is `Collection/Manager.vue`. `Collection/List.vue` may sit beside it as the render helper for cards/rows. Data loading belongs in pages or composables such as `useXCollection()`, not hidden provider/root wrappers inside `Collection/`.
- **Create rule:** keep create flows stable (`Create/System.vue`, `Create/Write.vue`, `Create/Preview.vue`). Put optional extra create steps under `Create/utils/`.

### `Collection/Manager.vue` meaning

`Collection/Manager.vue` represents the canonical collection block for the entity: header, controls, empty state, and list/grid of cards. If the entity has no special collection UX, the page or parent can call `useXCollection()` and pass the resulting collection directly to `Collection/Manager.vue`.

### Naming

- Entity folder names are **PascalCase** (`Blog`, `Product`, `Chef`).
- Subfolders use **PascalCase** for component folders (`Cards`, `Create`, `Edit`, `Sections`) and **lowercase** for `utils`.
- Component filenames inside slots are **PascalCase** (`Preview.vue`) except for the canonical entrypoints (`CTA.vue`, `Collection/Manager.vue`).

Note: `Collection/List.vue` is allowed as the render helper behind `Collection/Manager.vue`; it is not the collection entrypoint.

---

## Current state (snapshot)

This is a lightweight “what matches today” note from recent runtime inventory checks (not a full inventory).

- Core `User` and `App` already follow the `Cards/` + `Edit/` organism pattern.
- Profile organisms (Chef/Supplier/Agent/Professional) already align closely with the canon tree.
- Object organisms:
	- `Blog` and `Product` already have `CTA`, `Cards`, and multi-step `Create` trees.
	- `Job` currently has `CTA`, `Create`, and `Sections`, but does not yet show `Cards/` in the CTA-tree snapshot.
