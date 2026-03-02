# Object / Entity Canon (Firestore)
Updated: 2026-03-02
Authority: Tier2 (Reference; authoritative rules live in `docs/fireux-canon.md` and extension contracts)

This doc records Firestore object/entity conventions used across FireUX and should be read with Tier1 canon docs.

See also:

- Entity organism (components) canon: `docs/architecture/canon.md`

## 1) Canon paths

- **Model (shape-only):**
  - `src/runtime/models/<thing>.model.ts`

- **Composable facade (public entry):**
  - `src/runtime/composables/fireux/firestore/<thing>/use<Thing>s.ts`

## 2) Canon folder layout (inside each object)

- `fetch/` — reads (collection + single)
- `mutations/` — create/update/delete
- `utils/` — optional helpers (formatting/validation)
- `utils/view/` — optional interface helpers (pill/cell/profile)
- `state/` — optional local draft state for forms (only when needed)

## 3) Naming rules

- Folder names: **lowercase, singular**
  - Examples: `objects/company`, `objects/blog`, `objects/product`, `objects/kitchen`

- Facade file: `use<Thing>s.ts` (pluralized facade)
  - Exported function name should match the facade: `useCompanies`, `useProducts`, etc.

## 4) Model rules

- Models are **shape-only**.
- Do **not** put view models (pill/cell/profile) inside models.
  - Those belong in `utils/view/use<Thing>Interface.ts`.

## 5) Firestore access engine

- **Default engine for FireUX objects/entities:** `useFirestoreManager()` (or the granular `useFirestoreRead/Create/Update/Delete`).
- **VueFire-direct** (`useFirestore/useCollection/useDocument`) is allowed only as a temporary ecosystem prototype and should be migrated when touched.

## 6) ID strategy

- Default: **Firestore auto-ID** (unless the object has a real external ID, e.g. Google Places).
- If a package must generate an ID, document why and make it consistent.
