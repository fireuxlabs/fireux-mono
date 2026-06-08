# Sproochli Tenant Deploy Risk TODO
Authority: Tier2 (Operational TODO; Tier1 canon and package contracts win)
Updated: 2026-06-08

## Status

Huge TODO. Do not treat this as fixed because the La Tap Berne deploy was unblocked.

On 2026-06-08, the La Tap Berne tenant deploy failed because a Sproochli export was missing from the `fireux-sproochli/runtime/sproochli` barrel.

The immediate build error was:

```txt
"isSproochliRtlLanguage" is not exported by "fireux-sproochli/runtime/sproochli",
imported by "fireux-misebox/src/runtime/pages/menu.vue".
```

The deploy was repaired by exporting `isSproochliRtlLanguage`, but the deeper architecture risk remains.

## Why This Is Dangerous

Sproochli is a provider/tool capability. It should not be able to break a tenant app deploy unless that tenant app explicitly depends on Sproochli runtime surfaces.

La Tap Berne did not list `fireux-sproochli` in its app modules. Its app config listed:

```ts
modules: ['fireux-places', 'fireux-kitchens']
```

Despite that, the tenant build still compiled a Misebox shared `/menu` page that statically imported Sproochli UI/helpers. This means a provider-ish package created deploy risk for a tenant app that had not clearly opted into that provider as a route dependency.

That is not acceptable for FireUX tenant/product safety.

## Observed Failure Path

| Layer | What Happened |
| --- | --- |
| Tenant app | `projects/misebox/la-tap-berne` uses the `misebox` ecosystem module. |
| Ecosystem module | `fireux-misebox` registers shared runtime pages. |
| Shared page | `fireux-misebox/src/runtime/pages/menu.vue` statically imports Sproochli. |
| Provider package | `fireux-sproochli/runtime/sproochli` missed an exported helper. |
| Result | La Tap Berne deploy failed before Firebase deploy could complete. |

## Canon Direction

Provider tools must be isolated behind explicit seams.

Rules to enforce:

- App deploys must not fail because an optional provider package has a missing export.
- Ecosystem pages must not statically import optional provider UI unless that page is only registered when the provider is installed/enabled.
- Provider features must degrade at runtime when unavailable; they must not block unrelated app builds.
- Tenant apps must opt into provider-coupled routes explicitly.
- Sproochli may translate app-owned public content, but it must not own Misebox menu truth or tenant deploy viability.
- `fireux-misebox` should not silently default a tenant app into `sproochli: true` unless the tenant route/product explicitly chooses that behavior.

## Concrete Cleanup Tasks

1. Audit all static imports from `fireux-sproochli` outside the Sproochli package.
2. Classify each import as required, optional, or wrong-layer.
3. Remove static Sproochli imports from always-registered Misebox pages.
4. Gate Sproochli-coupled pages/components by explicit app/module config.
5. Move shared language-neutral menu display helpers out of Sproochli if Misebox needs them without Sproochli.
6. Keep Sproochli provider calls behind one adapter seam that can return "not installed" or "disabled" without breaking builds.
7. Add a deploy/build guard or smoke that proves a Misebox tenant can build with Sproochli disabled.
8. Add a deploy/build guard or smoke that proves a Misebox tenant can build without registering the shared `/menu` route.
9. Remove hardcoded La Tap Berne Sproochli defaults from shared Misebox runtime config unless that app explicitly owns the route.
10. Document the final provider dependency rule in the relevant Tier1 package canon.

## Candidate Files To Inspect

| File | Risk |
| --- | --- |
| `packages/ecosystem/fireux-misebox/src/runtime/pages/menu.vue` | Static Sproochli import inside a shared Misebox page. |
| `packages/ecosystem/fireux-misebox/src/config/module/pages-config.ts` | Registers shared pages into consuming apps. |
| `packages/ecosystem/fireux-misebox/src/config/module/runtime-config.ts` | Currently provides Sproochli-ish public menu defaults. |
| `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/menus/index.vue` | Kitchen public route imports Sproochli UI/helpers. |
| `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/menus/[menuId].vue` | Kitchen public route imports Sproochli helpers. |
| `packages/extensions/fireux-kitchens/src/runtime/components/Menu/Public.vue` | Shared public menu component imports Sproochli trigger/types. |
| `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/PublicMenus.vue` | Kitchen card/list imports Sproochli helpers. |
| `packages/extensions/fireux-kitchens/src/runtime/server/api/kitchens/public-menu/prepare-language.post.ts` | Server route calls Sproochli provider. |
| `packages/extensions/fireux-sproochli/src/runtime/sproochli.ts` | Public barrel must remain stable if consumers import it. |

## Acceptance Checks

Before this TODO can be closed:

- La Tap Berne builds with Sproochli disabled.
- A Misebox tenant with only `fireux-places` and `fireux-kitchens` builds without any Sproochli static import failure.
- Sproochli-enabled menu routes still show translation UI when explicitly enabled.
- Sproochli-disabled menu routes still show the original menu without translation UI.
- Missing Sproochli provider exports cannot break a tenant app that did not explicitly enable the Sproochli route/plugin.
- A failing Sproochli provider request does not break menu rendering.
- Docs clearly explain whether Sproochli is a package dependency, optional provider, hosted tool, or runtime plugin for each surface.

## Current Safe Short-Term Rule

Until this is fixed, treat any Sproochli refactor as deploy-risk for Misebox tenants.

Before deploying a tenant after Sproochli changes:

```txt
pnpm --dir projects/misebox/la-tap-berne run deploy:preflight
pnpm --dir projects/misebox/la-tap-berne build
```

This is a temporary safety habit, not the desired final architecture.
