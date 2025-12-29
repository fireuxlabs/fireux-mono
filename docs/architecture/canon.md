---
title: FireUX Canon
description: Canonical patterns—identity, stacks, and module conventions.
---

# FireUX Canon

This doc is the **single authoritative canon** for FireUX runtime folder shapes and “entity organism” UI structure.

Related (more specific) canons:

- Firestore object/entity composables + models canon: `docs/copilot-documentation/object-entity-canon.md`

## Repo-wide patterns

- Identity-first: resolve user + tenant context before doing work.
- Explicit stacks: shared modules flow through predictable folders.
- No shadow copies: one canonical implementation per concern.

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
- **Collection rule:** the canonical collection UI entrypoint is `Collection/View.vue`, backed by `Collection/Manager.vue` for data + orchestration. Any additional collection helpers (e.g. local/global variants) live alongside them in the same `Collection/` directory.
- **Create rule:** keep create flows stable (`Create/System.vue`, `Create/Write.vue`, `Create/Preview.vue`). Put optional extra create steps under `Create/utils/`.

### `Collection.vue` meaning

`Collection.vue` should represent the “canonical collection block” for the entity (header + empty state + list/grid of cards). If the entity has no special collection UX, `Collection.vue` can be a thin wrapper that delegates to `Cards/*` or `Sections/*`.

### Naming

- Entity folder names are **PascalCase** (`Blog`, `Product`, `Chef`).
- Subfolders use **PascalCase** for component folders (`Cards`, `Create`, `Edit`, `Sections`) and **lowercase** for `utils`.
- Component filenames inside slots are **PascalCase** (`Preview.vue`) except for the canonical entrypoints (`CTA.vue`, `Collection.vue`).

Note: the current repo canon is to **avoid** `List.vue` and standardize on `Collection.vue`.

---

## Current state (snapshot)

This is a lightweight “what matches today” note based on the **CTA parent tree snapshot** in `temp/temp-cta.md` (not a full inventory).

- Core `User` and `App` already follow the `Cards/` + `Edit/` organism pattern.
- Profile organisms (Chef/Supplier/Agent/Professional) already align closely with the canon tree.
- Object organisms:
	- `Blog` and `Product` already have `CTA`, `Cards`, and multi-step `Create` trees.
	- `Job` currently has `CTA`, `Create`, and `Sections`, but does not yet show `Cards/` in the CTA-tree snapshot.

