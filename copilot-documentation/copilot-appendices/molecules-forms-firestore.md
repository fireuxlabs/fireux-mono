---
title: Firestore form molecules (components)
status: draft
updated: 2025-09-29
---

Purpose: Catalog the Firestore-oriented form molecules under `packages/core/fireux-core/src/runtime/components/molecules/forms/firestore`, their props/contracts, and expected behaviors. These components pair with Firestore update composables via an `updateFunction` prop.

Folder: `fireux-core/src/runtime/components/molecules/forms/firestore/`

- ArrayOfStrings.vue
- AvatarPicker.vue
- Checkbox.vue
- Field.vue
- MultiField.vue
- Select.vue
- SocialLinks.vue

Conventions

- All components render a shared top bar `FireMoleculesFormsTop` (label, edit/save/cancel/delete UI) and manage local edit state.
- Common state: `isEditing`, `localValue`, `errorMessage`.
- Save flow: copy `firebaseValue` → user edits `localValue` → `saveChanges()` → `await updateFunction(value)` → exit edit mode.
- Delete semantics are type-appropriate (listed per component below).
- Unless noted, components don’t emit events; they commit via `updateFunction`.

Contract for updateFunction

- Signature: `(value: T) => Promise<unknown>` (T varies by component)
- Behavior: Persist to Firestore (often via `useFirestoreUpdate`) and reject on error (handled internally to surface `errorMessage`).

Components

1. Field.vue — single line/textarea with optional phone/email

- Props
  - `label?: string` — display label
  - `firebaseValue?: string` — current value
  - `placeholder?: string`
  - `updateFunction: (value: string) => Promise<unknown>`
  - `deleteFunction?: () => unknown` (not used internally)
  - `type?: 'text' | 'textarea' | 'phone' | 'email' | string` (default 'text')
  - `rows?: number` (default 4, textarea only)
  - `maxlength?: number` (default 500, textarea only)
  - `validationFunction?: (value: string) => { isValid: boolean; message?: string }`
  - `formattingFunction?: (value: string) => string`
- Behavior
  - Display shows `localValue || placeholder || 'Not set'` when not editing
  - Edit shows `UTextarea` if `type==='textarea'`, else `UInput` with inputType mapping: phone → `tel`, email → `email`, otherwise `text`
  - Phone input formats `(XXX) XXX-XXXX` as user types
  - Save: trims and calls `updateFunction(trimmed)`
  - Delete: calls `updateFunction('')`

2. Select.vue — single-select with label mapping

- Props
  - `label: string`
  - `firebaseValue?: string`
  - `options: Array<string | { label: string; value: string }>`
  - `updateFunction: (value: string) => Promise<unknown>`
  - `placeholder?: string` (default 'Select an option')
  - `validationFunction?: (value: string) => { isValid: boolean; message?: string }`
  - `formattingFunction?: (value: string) => string`
- Behavior
  - Display resolves label from options; falls back to raw value; shows 'Not set' when empty
  - Save: optional validate → optional format → `updateFunction(value)`
  - Delete: `updateFunction('')`

3. Checkbox.vue — boolean toggle

- Props
  - `label: string`
  - `firebaseValue?: boolean | null` (null means not set)
  - `updateFunction: (value: boolean | null) => Promise<unknown>`
  - `checkboxLabel?: string` (default 'Enabled')
  - `validationFunction?`, `formattingFunction?` (same shape as Select.vue)
- Behavior
  - Display: 'Not set' when null/undefined, else 'Yes'/'No'
  - Save: optional validate → optional format → `updateFunction(value)`
  - Delete: `updateFunction(null)`

4. ArrayOfStrings.vue — editable list of strings

- Props
  - `label?: string`
  - `firebaseValue?: string[]` (default [])
  - `itemPlaceholder?: string` (default 'Item')
  - `newItemPlaceholder?: string` (default 'Add new item')
  - `updateFunction: (value: string[]) => Promise<unknown>`
- Behavior
  - Display: `localValue.join(' | ')` or empty
  - Edit: per-item input + add/remove controls
  - Save: `updateFunction([...localValue])`
  - Delete: `updateFunction([])`

5. MultiField.vue — group of text inputs keyed by schema

- Props
  - `label?: string`
  - `firebaseValue?: Record<string, string>` (default {})
  - `placeholder?: string` (unused for editing; used for display fallback)
  - `updateFunction: (value: Record<string, string>) => Promise<unknown>`
  - `deleteFunction?: () => unknown` (not used internally)
  - `placeholders: Record<string, string>` (keys drive rendered inputs)
  - `commas?: boolean` (default true) — display as comma-separated vs. space-joined
- Behavior
  - Display: comma-separated values (or space-joined when `commas=false`); fallback placeholder/'Not set'
  - Save: `updateFunction(localValue)`
  - Delete: `updateFunction({})`

6. SocialLinks.vue — structured social link inputs with URL validation

- Props
  - `firebaseValue?: Record<string, string>`
  - `updateFunction: (value: Record<string, string>) => Promise<unknown>`
- Behavior
  - Platforms: `website | twitter | linkedin | github | instagram | facebook | youtube`
  - Display: list with icon + link; shows "No social links added" when empty
  - Save: builds `validatedLinks` by trimming, requiring `http(s)://`, and validating with `new URL(...)`; then `updateFunction(validatedLinks)`
  - Delete: `updateFunction({})`

7. AvatarPicker.vue — avatar preview + file input

- Props (TypeScript)
  - `src?: string` — avatar URL
  - `alt?: string`
  - `initials?: string` — fallback text
  - `updateFunction?: (file: File) => unknown` — parent handles upload+persist
- Behavior
  - Renders `UAvatar` with `src`/`initials`
  - File input accepts images; on change calls `updateFunction(file)` and resets the input

Usage example (pattern)

```vue
<template>
  <FireMoleculesFormsFirestoreField
    :label="'Display name'"
    :firebase-value="user?.display_name || ''"
    :placeholder="'Your name'"
    :update-function="updateDisplayName"
  />
</template>

<script setup lang="ts">
// In practice, components are imported via auto-imported aliases.
const { updateDisplayName } = useUserUpdate()
</script>
```

Notes / alignment

- `deleteFunction` props exist in some components but are not invoked; deletion is done by calling `updateFunction` with an empty value. Consider either removing `deleteFunction` props or wiring them as overrides.
- For future hardening, consider migrating these SFCs to TypeScript (`lang="ts"`) and explicitly typing `options`, validators, and `updateFunction` signatures.
