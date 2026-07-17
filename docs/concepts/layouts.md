Layouts spine map
Updated: 2026-06-19
Ref: 1fb119d15
Role: map, not canon

Purpose:
Map how FireUX layouts currently work so future layout work starts from repo
evidence, not generic Nuxt instinct.

Vertical links:
- Parent: nuxt4.md
- Sibling: pages.md
- Sibling: components.md
- Sibling: app-config.md

Current FireUX spine:
- FireUX runtime layouts render page content with `<NuxtPage />`.
- Core examples include `default`, `landing`, `console`, `dashboard`, `docs`,
  `dev`, `design`, and `auth`.
- Ecosystem tenant example: `misebox-tenant` also renders `<NuxtPage />`.
- The layout owns page chrome such as header, footer, shell background, sidebar,
  dashboard frame, or tenant frame.
- The page owns route metadata, content composition, and domain components.

Important nuance:
- Generic Nuxt examples often show layouts using `<slot />` because the app root
  passes page content through `<NuxtLayout>`.
- FireUX currently has an app shell that renders `<NuxtLayout><NuxtPage /></NuxtLayout>`,
  while most FireUX runtime layouts also render `<NuxtPage />`.
- That means the repo's current working layout spine is `<NuxtPage />`, even if
  generic Nuxt convention may suggest `<slot />`.

App-local layouts:
- App-local layouts are allowed when an app has real chrome needs that should not
  become package truth yet.
- Before adding one, compare the nearest package or core layout first.
- If an app-local layout differs from the FireUX spine, name the delta in the
  change and keep it small.
- App-local tenant or microsite layouts should own local navigation chrome so
  pages do not repeat it.

When creating or changing a layout:
- Name the layout family: core, dashboard, console, tenant, microsite, menu, or
  app-local special case.
- Name the nearest working sibling.
- Keep chrome in the layout and domain content in the page/component tree.
- Prefer `<NuxtPage />` unless deliberately following an existing app-local
  `<slot />` pattern.
- Do not move domain data fetching into layouts.
- Do not hide route-specific behavior inside a layout.
- A package-owned route family should also own its layout when the chrome can
  be derived from app role and explicit route scope. Menu uses this shape:
  `fireux-kitchens` owns the shared Menu layout, tenant routes close home, and
  global or kitchen-directory routes return to their Menu index.

Known examples:
- Core default layout: `packages/core/fireux-core/src/runtime/layouts/default.vue`
- Core console layout: `packages/core/fireux-core/src/runtime/layouts/console.vue`
- Misebox tenant layout: `packages/ecosystem/fireux-misebox/src/runtime/layouts/misebox-tenant.vue`
- Kitchens Menu layout: `packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue`
- La Tap local layout: `projects/misebox/la-tap-berne/app/layouts/latap-default.vue`

Open questions:
- Decide whether app-local `<slot />` layouts should be normalized to the FireUX
  `<NuxtPage />` spine when touched.
- Decide whether `misebox-tenant` should become the polished tenant reference or
  whether a newer tenant layout should replace it.
