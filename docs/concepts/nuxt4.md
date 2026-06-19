Nuxt 4 and Vue 3 concept map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Explain the app framework context for agents.

Vertical links:
- Parent: AGENTS.md
- Child: layouts.md
- Child: pages.md
- Child: components.md
- Child: composables.md
- Child: server-api.md

Horizontal links:
- nuxt-ui.md
- runtime-package.md
- app-config.md

Framework:
- FireUX apps are Nuxt 4 apps.
- Runtime UI is Vue 3.
- Server routes use Nitro/h3 conventions.
- Nuxt modules register package runtime surfaces.

Common Nuxt surfaces:
- App shell: usually owns `<NuxtLayout><NuxtPage /></NuxtLayout>`.
- Layouts: see `layouts.md`; FireUX runtime layouts currently render `<NuxtPage />`.
- App pages: `app/pages`.
- App components: `app/components`.
- App composables: `app/composables`.
- App server routes: `server/api`.
- Package pages: `src/runtime/pages`.
- Package components: `src/runtime/components`.
- Package composables: `src/runtime/composables`.
- Package server routes: `src/runtime/server/api`.

Conventions:
- Prefer Nuxt auto-registered components where package registration supports it.
- Prefer package runtime surfaces for reusable domain behavior.
- App-local pages/components are for composition and app-specific deltas.
- Use `definePageMeta`, `useHead`, `useSeoMeta`, and Nuxt imports consistently with nearby siblings.

Do not:
- Introduce React patterns.
- Add another router.
- Add unrelated state frameworks.
