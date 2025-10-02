# Molecules Forms System Review

This report inventories the current Molecules Forms components, highlights verbosity/pain points, and proposes a streamlined, settings-style solution with a migration plan.

## Inventory

Path: `components/molecules/forms`

- `Top.vue`: Action/label bar used by several fields (edit, save, cancel, delete, error alert). Provides visual chrome and emits events.
- `ArrayOfStrings.vue`: Field for editing string arrays (details not reviewed here).
- `state/`: (not inspected) likely contains shared state utils.

Path: `components/molecules/forms/firestore`

- `Field.vue`: Single-value text/textarea/phone/email field with Top, internal edit/display state, validation/formatting hooks.
- `MultiField.vue`: Object-shaped field (multiple inputs) with Top, internal edit/display state.
- `Checkbox.vue`: Firestore-backed checkbox (not inspected).
- `Select.vue`: Firestore-backed select (not inspected).
- `AvatarPicker.vue`: Firestore avatar upload helper used by User Edit.
- `ArrayOfStrings.vue`: Firestore array field (not inspected).
- `SocialLinks.vue`: Specialized multi-input for links (not inspected).
- `SimpleField.vue` (new): Minimal settings-style single-value field using `UFormField` with inline actions (edit/save/cancel/delete) and the same validation/formatting hooks.

## Verbosity & Pain Points

1. Composition overhead

   - `Top.vue` duplicates label, actions and error rendering per-field. When combined with container markup in pages, results in nested structure and repeated props/events.
   - Each field re-implements similar edit/display toggles and event plumbing.

2. Visual inconsistency

   - Legacy fields render their own layout (divs + Top) which doesn’t natively match the settings page rhythm (`UFormField` rows). We had to wrap inside additional containers to align.

3. Action placement and duplication

   - Actions live in `Top.vue` as a separate header rather than next to the control, creating extra vertical space and complexity.

4. Error rendering
   - Errors are rendered by `Top.vue` via `UAlert`, while settings pages prefer `UFormField` error messaging. This leads to two error strategies.

## Proposed Simplified Pattern

Adopt a single, minimal field primitive for settings-like forms:

- Component: `MoleculesFormsFirestoreSimpleField.vue`
- UI: built on `UFormField` with the canonical settings layout (`class=\"flex max-sm:flex-col justify-between items-start gap-4\"`).
- Inline actions: edit/save/cancel/delete as small icon buttons aligned to the right of the control.
- Behavior: keep current validation/formatting hooks; keep local edit/display mode; handle Enter/Esc and Ctrl/Cmd+Enter for textarea.
- Error handling: pass the error string into `UFormField` `:error` to integrate with settings’ native look.

Contract (props):

- `label: string`
- `firebaseValue: string` (or potentially number/union with modelValue later)
- `placeholder?: string`
- `updateFunction: (value: string)=>Promise<void>`
- `deleteFunction?: ()=>Promise<void>` (falls back to `updateFunction('')`)
- `validationFunction?: (value: string)=>{ isValid: boolean; message?: string }`
- `formattingFunction?: (value: string)=>string`
- `type?: 'text'|'textarea'|'phone'|'email'`
- `rows?: number`
- `maxlength?: number`

## Why this helps

- Removes `Top.vue` for single-value fields, cutting markup and event boilerplate.
- Aligns visuals with settings pages by default; no extra wrapper components needed.
- Centralizes error rendering in `UFormField`.
- Maintains all current Firestore and validation behavior.

## Migration Plan

Phase 1 (done here)

- Introduce `SimpleField.vue` and migrate `User/Edit.vue` fields (Display Name, Handle) to use it.

Phase 2 (quick wins)

- Replace other `Field.vue` usages in settings-style pages with `SimpleField.vue`.
- For textareas/phones, rely on `type` prop in SimpleField.

Phase 3 (object/multi fields)

- Create `SimpleMultiField.vue` mirroring `MultiField.vue` but using `UFormField` layout and inline actions, deprecating `Top.vue`.
- Ensure shared validators/formatters reside in composables, not components.

Phase 4 (cleanup)

- Deprecate `Top.vue` from single-value fields.
- Remove redundant wrappers/styles in pages now that fields align with `UFormField`.

## Compatibility considerations

- Keep `Field.vue` and `MultiField.vue` for existing screens during migration.
- Verify any places that depend on `Top.vue`-specific events or error UAlert styles and adjust to `UFormField` error slot if needed.

## Next steps

- Identify all usages of `MoleculesFormsFirestoreField` and convert to `SimpleField` where the settings layout is desired.
- Add optional `description?: string` to SimpleField to support helper text under labels, like the settings page.
- Consider unifying delete behavior under an explicit prop (`showDelete` + `onDelete`) to avoid accidental clears.
- Build `SimpleMultiField.vue` to bring objects inline with the same ergonomic API.
