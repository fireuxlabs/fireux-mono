# Dev Health Roadmap – 2025-12-04

## Goals
- Unify `/dev/*` pages so every stack (apps, users, profiles) exposes the same primitives: live preview, raw/enriched JSON, health checks, and component showcases.
- Use the health layer to compare Firestore collections against their view models (e.g., `apps.admin_ids` ↔ `users.adminOf`).
- Keep tooling intentionally verbose (dev-only) but isolate it under `fireux-core/runtime/components/dev` and `.../composables/dev` so the runtime stays lean and now guard those paths behind deploy ignores so Firebase hosting never receives them.

## Architecture Sketch
1. **Health Registry**
   - `DevHealthResult` struct encapsulates `status`, `summary`, `issues[]`, and `stats`.
   - `useDevHealth()` composes individual checks (admin matrix, membership drift, profile enrichment) and exposes helpers to filter by scope (`apps`, `users`, `profiles`).
   - Each check lives in `.../dev/health/checks/*` and only depends on public composables (`useAppCollection`, `useUserCollection`, etc.).

2. **UI Surfaces**
   - `DevHealthPanel` renders a stack of cards with badges, issue lists, and copy buttons.
   - `DevProfileDiffList` (already shipped) and a new `DevUserComponentGallery` cover diffing + component previews, respectively.
   - Dev pages arrange sections in the same order: preview → health → JSON → component gallery.

3. **Checks (MVP)**
   - **Admin Matrix**: ensures `users.adminOf`, `apps.admin_ids`, and tenant `apps/{appId}/users/{uid}.role` stay in sync; flags missing docs, mismatched IDs, and non-admin memberships.
   - Profiles pipeline will reuse the diff view to compare raw documents against enriched cards and flag legacy identity fields.

4. **Component Library**
   - Start by showcasing user pill/cell variants via `useUserInterface` so designers/devs can confirm data states.
   - Extend later with profile/preview variants once their stacks stabilize.

5. **Deployment Guardrails**
   - `fireux-deploy-ignore` in the repo root enumerates folder segments that should never ship (default: any `dev` directory), with overrides via `FIREUX_DEPLOY_IGNORE` and an escape hatch `FIREUX_DEPLOY_WITH_DEV=1` for debugging.
   - `configureDeployIgnore()` in `fireux-core` reads those rules, converts them to glob patterns (e.g., `**/dev/**`), and injects them into `nuxt.options.ignore` right after runtime setup so Nuxt skips scanning dev-only directories during build.
   - Because the ignore hook runs before component/composable/page discovery, `/dev/*` sources remain in Git for local tooling yet are excluded from Firebase hosting bundles and SSR output.

6. **Dev Asset Inventory (Dec 4 Snapshot)**
   - `packages/core/fireux-core/src/runtime/components/dev`
   - `packages/core/fireux-core/src/runtime/components/dev/HealthPanel.vue`
   - `packages/core/fireux-core/src/runtime/components/dev/JsonPanel.vue`
   - `packages/core/fireux-core/src/runtime/components/dev/ProfileDiffList.vue`
   - `packages/core/fireux-core/src/runtime/components/dev/RoutesDebug.vue`
   - `packages/core/fireux-core/src/runtime/components/dev/UserComponentGallery.vue`
   - `packages/core/fireux-core/src/runtime/components/layouts/dev`
   - `packages/core/fireux-core/src/runtime/components/layouts/dev/Nav.vue`
   - `packages/core/fireux-core/src/runtime/composables/dev`
   - `packages/core/fireux-core/src/runtime/composables/dev/health`
   - `packages/core/fireux-core/src/runtime/composables/dev/health/checks`
   - `packages/core/fireux-core/src/runtime/composables/dev/health/checks/useDevAdminHealth.ts`
   - `packages/core/fireux-core/src/runtime/composables/dev/health/types.ts`
   - `packages/core/fireux-core/src/runtime/composables/dev/health/useDevHealth.ts`
   - `packages/core/fireux-core/src/runtime/composables/dev/useDevClipboard.ts`
   - `packages/core/fireux-core/src/runtime/layouts/dev.vue`
   - `packages/core/fireux-core/src/runtime/pages/dev`
   - `packages/core/fireux-core/src/runtime/pages/dev/apps.vue`
   - `packages/core/fireux-core/src/runtime/pages/dev/avatars.vue`
   - `packages/core/fireux-core/src/runtime/pages/dev/images.vue`
   - `packages/core/fireux-core/src/runtime/pages/dev/index.vue`
   - `packages/core/fireux-core/src/runtime/pages/dev/users.vue`
   - `packages/core/fireux-core/dist/runtime/components/dev`
   - `packages/core/fireux-core/dist/runtime/components/dev/JsonPanel.vue`
   - `packages/core/fireux-core/dist/runtime/components/dev/RoutesDebug.vue`
   - `packages/core/fireux-core/dist/runtime/components/layouts/dev`
   - `packages/core/fireux-core/dist/runtime/components/layouts/dev/Nav.vue`
   - `packages/core/fireux-core/dist/runtime/composables/dev`
   - `packages/core/fireux-core/dist/runtime/composables/dev/useDevClipboard.d.ts`
   - `packages/core/fireux-core/dist/runtime/composables/dev/useDevClipboard.mjs`
   - `packages/core/fireux-core/dist/runtime/layouts/dev.vue`
   - `packages/core/fireux-core/dist/runtime/pages/dev`
   - `packages/core/fireux-core/dist/runtime/pages/dev/apps.vue`
   - `packages/core/fireux-core/dist/runtime/pages/dev/avatars.vue`
   - `packages/core/fireux-core/dist/runtime/pages/dev/images.vue`
   - `packages/core/fireux-core/dist/runtime/pages/dev/index.vue`
   - `packages/core/fireux-core/dist/runtime/pages/dev/users.vue`
   - `packages/ecosystem/fireux-misebox/src/runtime/pages/dev`
   - `packages/ecosystem/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue`
   - `packages/ecosystem/fireux-misebox/src/runtime/pages/dev/index.vue`
   - `packages/ecosystem/fireux-misebox/dist/runtime/pages/dev`
   - `packages/ecosystem/fireux-misebox/dist/runtime/pages/dev/fireux-misebox.vue`
   - `packages/ecosystem/fireux-misebox/dist/runtime/pages/dev/index.vue`
   - `packages/extensions/fireux-jobs/src/runtime/pages/dev`
   - `packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue`
   - `packages/extensions/fireux-jobs/dist/runtime/pages/dev`
   - `packages/extensions/fireux-jobs/dist/runtime/pages/dev/fireux-jobs.vue`
   - `packages/extensions/fireux-places/src/runtime/pages/dev`
   - `packages/extensions/fireux-places/src/runtime/pages/dev/fireux-places.vue`
   - `packages/extensions/fireux-places/dist/runtime/pages/dev`
   - `packages/extensions/fireux-places/dist/runtime/pages/dev/fireux-places.vue`

## Next Steps
1. Verify `fireux-deploy-ignore` covers any new dev subtrees (profiles, tenants) and document additional rules as we add tooling.
2. Build `DevHealthPanel` + `useDevHealth()` scaffolding.
3. Implement the Admin Matrix check and use it on `/dev/apps` and `/dev/users`.
4. Add the user component gallery so `/dev/users` doubles as a quick visual diff.
5. Iterate on additional checks (profile linkage, membership drift) as new stacks solidify.

## Status – 2025-12-04
- ✅ Deploy ignore guard added: `fireux-deploy-ignore` + `configureDeployIgnore()` ensure dev-only layouts/components/composables are stripped from production bundles (configurable via env flags).
- ✅ `DevHealthPanel` + `useDevHealth()` shipped under `fireux-core/runtime`.
- ✅ Admin Matrix check live on `/dev/apps` and `/dev/users`, covering `apps.admin_ids`, `users.adminOf`, and tenant membership roles.
- ✅ User component gallery added to `/dev/users` so pill/cell variants stay visible in dev.
- ⏳ Upcoming: add profile-specific checks (raw/enriched parity, legacy field detection) and expand the gallery to professional/agent previews.
