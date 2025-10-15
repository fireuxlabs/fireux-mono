---
title: UX & Component Conventions
status: draft
created: 2025-10-15
---

# UX & Component Conventions

Consistency across tenants depends on shared patterns for components, copy, and navigation. Use this chapter as the design contract when building or reviewing UI.

## Naming & Structure

- Components use `PascalCase` with descriptive prefixes (e.g. `MoleculesFormsFirestoreSimpleField.vue`, `OrganismsAppCardsPill.vue`).
- Composables follow the `useThing.ts` convention and live beside their feature.
- Server routes adopt `<name>.<method>.ts` (`example.get.ts`).
- Place CSS in `<component>.vue` using `<style scoped>` unless shared tokens are required.

## Design System

- Core UI relies on Nuxt UI primitives extended by `fireux-core` components.
- State visual hierarchy: atoms → molecules → organisms. Keep molecules focused on layout/behaviour, and let organisms orchestrate multiple molecules.
- Iconography uses the Lucide icon set. Reference icons via `i-lucide-*` class names.
- Utilize shared spacing and typography tokens defined in `fireux-core/src/runtime/assets/styles`.

## Forms & Validation

- Prefer `MoleculesFormsFirestoreSimpleField` for single-value Firestore fields in settings-style layouts.
- Use validation and formatting hooks provided by composables (`validateDisplayName`, `formatHandle`, etc.).
- Align actions inline with controls (edit/save/cancel buttons) to reduce vertical sprawl.
- Surface errors via the component `error` prop instead of custom alerts.

## Navigation & Layouts

- Pages that should appear in the dev layout must set `layout: 'dev'` and include `nav` metadata with `key`, `label`, `group`, and `layouts: ['dev']`.
- Groups currently in use: `core`, `misebox`, `ext`, `app`. Introduce new groups only when necessary and document them in package docs.
- Production-facing navigation is driven by tenant-specific configurations; ensure the responsible package owns the nav definition.

## Copy & Accessibility

- Use sentence case for headings and button labels by default.
- Provide `aria-label` or `aria-describedby` when icons or non-text controls are used.
- Ensure colour usage meets contrast guidelines; rely on design tokens instead of hardcoded hex values.
- Document microcopy or terminology changes in the relevant package docs so tenants stay aligned.

Proceed to [Operations & Troubleshooting](./copilot-08-operations.md) for support and incident guidance.
