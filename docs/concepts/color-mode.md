# Color Mode

Updated: 2026-10-21
Ref: d05ded3fd
Role: map, not canon

## Purpose

Map the native Nuxt UI light/dark owner and the remaining FireUX duplication.
Inherit [global context](../ai/gpt-context.md) and the
[Nuxt UI integration map](nuxt-ui.md#fireux-integration). Current source
and generated Nuxt imports establish implementation; this map does not claim the
duplicate implementation is already retired.

## Spine

- Owner: Nuxt UI installs `@nuxtjs/color-mode` when `ui.colorMode` is enabled.
- Nuxt UI setup: `@nuxt/ui` registers `@nuxtjs/color-mode` with `classSuffix: ''`.
- Root behavior: `@nuxtjs/color-mode` applies `light` or `dark` to the document root.
- Native state: `useColorMode()` from Nuxt `#imports` exposes resolved `value`,
  authored `preference` and hydration/forced-mode state. Current generated Blank
  imports select the native module, not the FireUX helper.
- Remaining duplication: [Core's helper](../../packages/core/fireux-core/src/runtime/composables/theme/useColorMode.ts)
  separately reads/writes `nuxt-color-mode`, reads the old `fireux:color-mode`
  key, mutates root classes, installs a media listener and observes DOM classes.
  Its `Ref` preference API differs from the native object's API.
- Token behavior: custom CSS tokens should react through `:root.dark`, not a loose `.dark` selector.
- Target display behavior: read the native resolved `colorMode.value`.
- Target preference behavior: write native `colorMode.preference`. Ordinary
  controls may use Nuxt UI's ColorMode components directly.

## Inspected consumers and retirement boundary

Two explicit entrypoints use the FireUX preference helper:
[App Shell](../../packages/core/fireux-core/src/runtime/app/components/Shell.vue)
activates it globally, and the
[design specimen](../../packages/core/fireux-core/src/runtime/components/Library/Design/Contracts.vue)
writes Light/Dark/System. Four other consumers use its resolved-mode adapter:
Core [Logo](../../packages/core/fireux-core/src/runtime/app/components/Brand/Logo.vue),
[Wordmark](../../packages/core/fireux-core/src/runtime/app/components/Brand/Wordmark.vue),
[useAppView](../../packages/core/fireux-core/src/runtime/app/composables/useAppView.ts)
and FireUX App's [Fuel](../../projects/fireux/fireux-app/app/components/Landing/Fuel.vue).
No other authored imports or consumers were found in the inspected packages and
Apps.

**Replace** the helper and migrate all six consumers to native state together.
Remove its activation, storage writer, media listener, DOM observer and obsolete
types/path. The old preference key is retirement debt, not another supported
theme contract. Update the standalone imports bridge to the native public type
rather than preserving its optional partial signature.

Keep brand/media resolution and failure handling with their existing owners.
Native `UColorModeImage` supplies two mode-specific images through CSS, but is
not by itself equivalent to Core's asset-role and failed-image fallback logic.
No new FireUX colour-mode abstraction is needed for these consumers.

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Tailwind/Nuxt UI `dark:` utilities in templates | `accepted` | They follow the same document-root mode class |
| Tenant tokens under `:root` and `:root.dark` | `accepted` | Brand values differ while mode ownership stays shared |
| Explicit local mode classes in previews | `accepted` | A preview may intentionally show a mode without changing the whole app |
| Core preference writer and DOM observer duplicate native ownership | `migration` | Migrate the six explicit consumers together and retire the helper; preserve native preference and domain media semantics |

## Avoid

- Do not scope app tokens to generic `.dark`; it can react to nested classes and make light/dark behavior hard to trace.
- Do not confuse the old FireUX helper's preference ref with the native object's
  resolved `value`; `system` belongs to native `preference`.
- Avoid `prefers-color-scheme` in component CSS unless the component is intentionally outside the FireUX app shell.
- Do not add another writer, DOM observer or compatibility adapter around the
  native state.

## Verification and refresh

The source comparison establishes duplicate authority, not a completed visual
cutover. Before accepting retirement, verify native Light/Dark/System changes,
reload and OS changes, initial hydration, mode-specific brand/failure behaviour,
generated imports and representative App/package types. Confirm that no retired
helper, legacy-key reader or extra root-class writer remains. Refresh this map
and the Nuxt UI audit when the owner or consumer set changes.
