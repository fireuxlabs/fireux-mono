# Pill Contract Report (2025-11-06)

## Type Chain Overview

- `packages/core/fireux-core/src/runtime/types/pill.model.ts`
  - Defines `Pill.Props` with required `avatar: string`, `initials: string`, `title: string`; optional `subtitle`, `badges`, `to`.
- `packages/core/fireux-core/src/runtime/models/core/app.model.ts`
  - `AppPillProps = PillModel.Props & { to: string }` (forces `to` to exist, still inherits required `avatar`/`initials`).
  - `AppCard.Pill` extends `AppPillProps` and adds app-specific fields.
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/main/useAppInterface.ts`
  - Maps Firestore docs to UI shapes (`toPill`, `toCell`, `toProfile`).
- `MoleculesPill` component expects something resembling `Pill.Props`; every caller now pipelines through these helpers.

## Current Behaviour

- Required fields (`avatar`, `initials`, `title`) are satisfied via defensive defaults (`''`, `'A'`, or empty title) when source data is missing.
- `badges` is optional but almost never populated for apps; pills render without contextual role/status hints.
- Consumers spread `pillProps(app)` or `toPill(app)` with no runtime validation, so silent empty strings propagate to UI.

## Safety Gaps

1. **Silent data loss**
   - Because `Pill.Props` requires strings, mapping helpers coerce missing values to `''`. UI appears valid (no runtime error) but misses cues that data is absent, making it harder to detect integration issues.
2. **Initials accuracy**
   - We currently hard-code `'A'` for app initials. If names change or localization is needed, pills still show `A`, reducing usability.
3. **Badge intent**
   - The type allows `badges?: string[]`, but app pills never supply them. Admin/archived state is invisible in directory listings.
4. **No layered contract**
   - We lack a domain-specific interface clarifying which app fields must be present before using a pill. Downstream UI can call `toPill()` even when `app` is `null`, receiving placeholder strings instead of an explicit failure.

## Suggested Adjustments

1. **Introduce explicit fallbacks**
   - Update `useAppInterface.toPill` to surface a missing-data badge instead of returning empty strings:
     ```ts
     const missing = !value?.app_name || !value?.id
     const badges = [value?.role ?? 'tenant']
     if (value?.status === 'archived') badges.push('archived')
     if (missing) badges.push('missing-data')
     ```
   - Keep `avatar` optional by returning `''`, but add a badge (or boolean) to highlight the lack of imagery.
2. **Role/status badges**
   - At minimum, emit `[value?.role ?? 'tenant']` so global/tenant/sandbox pills communicate scope.
   - Optionally append `'inactive'` for `status !== 'active'`.
3. **Initials helper**
   - Add a dedicated utility to derive initials from `app_name` or `id`, stored alongside `useAppInterface`. This makes it easy to swap out the placeholder before launch.
4. **Optional type refinement**
   - Consider introducing `AppPillData` (only the Firestore subset required to build a pill) so the mapper fails fast when critical fields are missing, instead of silently coercing to blanks.
5. **Testing**
   - Add lightweight unit tests or storybook stories verifying badges render correctly for `role=global`, `status=archived`, etc. This helps ensure mapping logic stays in sync with UI expectations.

## Next Steps

1. Implement badge population in `useAppInterface.toPill`, deriving at least the `role` value.
2. Replace the hard-coded `'A'` initials with a function (even if it defaults to the first letter), making the intent clearer.
3. Decide whether to flag missing `title`/`id` with a badge or throw in development mode to catch gaps early.
4. Update `useAppComputed`/docs to reference the new badge behaviour so devs know pills now expose role/status context.

These changes keep the Pill contract simple but make data issues more discoverable and align app pills with the base model’s optional `badges` field.
