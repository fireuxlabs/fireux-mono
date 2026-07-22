# Color Mode

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Map the Nuxt UI light/dark spine as used by FireUX so app chrome, tenant chrome, and shared components do not invent competing colour-mode systems.

## Spine

- Owner: Nuxt UI installs `@nuxtjs/color-mode` when `ui.colorMode` is enabled.
- Nuxt UI setup: `@nuxt/ui` registers `@nuxtjs/color-mode` with `classSuffix: ''`.
- Root behavior: `@nuxtjs/color-mode` applies `light` or `dark` to the document root.
- FireUX compatibility: `packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode.ts` currently mirrors the same storage/class behavior for shared runtime code.
- Token behavior: custom CSS tokens should react through `:root.dark`, not a loose `.dark` selector.
- JS display behavior: components that need the current visible mode should use `useResolvedColorMode()`.
- JS preference behavior: components that edit the user's setting may use `useColorMode()`.

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Tailwind/Nuxt UI `dark:` utilities in templates | `accepted` | They follow the same document-root mode class |
| Tenant tokens under `:root` and `:root.dark` | `accepted` | Brand values differ while mode ownership stays shared |
| Explicit local mode classes in previews | `accepted` | A preview may intentionally show a mode without changing the whole app |
| Core `useColorMode()` mirrors Nuxt color-mode storage and DOM classes | `migration` | It carries legacy storage compatibility and a resolved-mode observer; remove the duplicate preference writer after consumers and legacy storage are migrated |

## Avoid

- Do not scope app tokens to generic `.dark`; it can react to nested classes and make light/dark behavior hard to trace.
- Do not use `useColorMode().value` when the component needs the actual rendered mode; `system` must be resolved first.
- Avoid `prefers-color-scheme` in component CSS unless the component is intentionally outside the FireUX app shell.
- Do not add a second FireUX-owned colour-mode system; prefer Nuxt UI / `@nuxtjs/color-mode` and keep FireUX helpers thin.

## Alignment roadmap

- Now: treat Nuxt UI / `@nuxtjs/color-mode` as owner and
  `useResolvedColorMode()` as the read seam for rendered state.
- Next: inventory writers of the FireUX helper and verify whether direct Nuxt
  color-mode state covers them.
- Later: retire legacy `fireux:color-mode` storage and the duplicate writer in
  one migration, retaining only a thin resolved-state adapter if still needed.
