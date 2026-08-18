# Nuxt 4 and Vue 3 concept map

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Purpose

Explain the app framework context for agents.

## Vertical links

- Parent: AGENTS.md
- Child: layouts.md
- Child: pages.md
- Child: components.md
- Child: composables.md
- Child: server-api.md
- Child: runtime-filesystem.md

## Horizontal links

- nuxt-ui.md
- runtime-package.md
- app-config.md

## Framework

- FireUX apps are Nuxt 4 apps.
- Runtime UI is Vue 3.
- Server routes use Nitro/h3 conventions.
- Nuxt modules register package runtime surfaces.

## Common Nuxt surfaces

- App shell: usually owns `<NuxtLayout><NuxtPage /></NuxtLayout>`.
- Layouts: see `layouts.md`; current FireUX layouts have both slot-rendering
  and route-rendering lanes. Do not assume one universal renderer until that
  map's single-render checks settle the boundary.
- App pages: `app/pages`.
- App components: `app/components`.
- App composables: `app/composables`.
- App server routes: `server/api`.
- Package pages: `src/runtime/pages`.
- Shared package components: `src/runtime/components`.
- Entity package components: `src/runtime/<entity>/components`, registered by
  the package module.
- Shared package composables: `src/runtime/composables`.
- Entity package composables: `src/runtime/<entity>/composables`, registered by
  the package module.
- Package server routes: `src/runtime/server/api`.
- Entity server behaviour: `src/runtime/<entity>/server`, imported by thin
  route handlers.

## Conventions

- Prefer Nuxt auto-registered components where package registration supports it.
- Prefer package runtime surfaces for reusable domain behavior.
- Keep Nuxt discovery entrypoints conventional while expressing product
  ownership under the entity scope described in `runtime-filesystem.md`.
- App-local pages/components are for composition and app-specific deltas.
- Use `definePageMeta`, `useHead`, `useSeoMeta`, and Nuxt imports consistently with nearby siblings.

## Do not

- Introduce React patterns.
- Add another router.
- Add unrelated state frameworks.
