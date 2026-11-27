# Alpha 24 Codex — Layer-only Core package interface

For FireUX — Architecture. Read-only proposal. The durable sibling reset worktree matches Alpha 23, branch `codex/app-architecture-reset`, clean at `6a3c6a0123c77ea3c3f2760479a17f2f57afd73d`. Core currently has five exports. No source, manifest, or canon edits were made.

## Recommendation

Adopt `./layer` as the only planned Core package entry. Keep the current packing allowlist. Nuxt layer discovery and the typed HTTP surface are the contracts used by the maintained Apps. Of the four extra subpaths, only `./user-consent` has an active consumer in Blank, Misebox, or Holzworm. A native shared layer utility satisfies that caller without changing identity behavior. The other three have historical consumers whose migration requirements should be scoped separately. An additional package export is justified only by an evidenced, supported caller that cannot reasonably use a Nuxt or HTTP contract, such as a future plain TypeScript consumer.

| Current subpath | Evidence and proposed disposition |
| --- | --- |
| `./user-consent` | Active `projects/misebox/misebox-app/app/components/MiseboxAuth.client.vue:64` imports the value for displayed and submitted versions. Generic Core provisioning validates the same pair at `packages/core/fireux-core/server/user/create/provision.ts:3,9–11`. Move the existing file, unchanged, from `shared/user/user-consent.ts` to a top-level `shared/utils/user-creation-consent.ts`. Misebox can explicitly import `USER_CREATION_CONSENT` from Nuxt's `#imports` and Core can continue with a relative import. The component, Firebase configuration, legal links, guard, consent payload and server authority stay with their existing owners. Remove the subpath only after the replacement is verified. This requires no Auth UI relocation or browser SDK expansion. |
| `./app/detail-card` | Only historical `packages/extensions/fireux-docs/src/runtime/pages/docs/components/app-detail-card.vue:21,36` imports and documents the subpath. Blank, Misebox, and Holzworm already generate `AppDetailCard` from the layer. Core `app/components/App/Detail.vue:15` uses a relative import. When the historical host is migrated, use `<AppDetailCard>` in the page/snippet or `#components` for an explicit script import. Alpha 23 recorded the host's `fireux-ecosystem/config` blocker. The removal will break the legacy example until that consumer is changed or retired. Host repair is separate from deciding the Core interface. |
| `./app` | Five historical type imports: `packages/extensions/fireux-ecosystem/src/runtime/components/landing/AppCollection.vue:130`, `packages/extensions/fireux-workspace/src/runtime/workspace/utils/policy.ts:1`, and `projects/fireux/fireux-app/{app/components/App/Detail/Header.vue:25,app/components/App/Detail/Index.vue:21,server/utils/apps.ts:1}`. Keep the stored model and role constants Core-owned, imported relatively by internal code. In migrated presentation, infer the public shape from typed HTTP or the owning public view/component contract. The stored App type includes private context and actor stamps. If migrated Workspace code needs the canonical role type in Nuxt and Nitro, use a deliberately shared type via top-level `shared/types` or an explicit named-layer import of a reusable contract. Keep Workspace authority with Workspace and avoid using a role type as authority. A native alias is unavailable to plain Node/TypeScript consumers without Nuxt. No maintained caller here was found that establishes that independent need. |
| `./server/app/read-app-document` | Historical platform `projects/fireux/fireux-app/server/utils/apps.ts:2,18,76` uses Core's pure validation and public projection across platform-configured databases. Its output feeds `server/utils/default-directory.ts:3,9` and `server/routes/sitemaps/directory.xml.get.ts:12,19`. Core's self/peer operations already import the helper relatively. Keep validation/projection Core-owned and platform database selection/aggregation platform-owned. If the migrated platform still acquires raw records and must use the same projection, give that helper an intentional Nitro-only interface through native `server/utils` or an explicit named-layer import. Select it during the server discussion once a supported caller is established. Do not duplicate the projection or repurpose the self/peer routes for cross-database scope. |

## Native approaches and evidence

- Vue components use native `app/components` discovery. Top-level composables and utilities can use generated `#imports`. Core implementation can keep ordinary relative imports. Keeping source in the tarball is separate from exposing package specifiers.
- The installed Nuxt versions discover top-level `shared/utils` and `shared/types` across layers for App and Nitro use. The current nested `shared/user` is outside that discovery. Choose `#imports` for the consent value because it preserves an explicit dependency without changing layer configuration. Its name becomes part of the Nuxt layer's shared namespace and should remain collision-free.
- Native named layers are a viable alternative when direct layer code genuinely needs an explicit reference. An opt-in `$meta.name` on the layer can advertise `#layers/<name>`. In both tested versions with default dirs it resolved the package layer root, including explicit imports from nested `shared/`. This keeps the owner directory intact but couples the caller to a physical path. Do not introduce it solely as a substitute export map. `#shared` in the generated host config points to that host's shared directory.
- Nitro discovers HTTP handlers and server utilities. Keep entity operations private by default. A server utility is a server-side code interface, not a new HTTP route. Keep native HTTP clients on the route's scoped response. Exports only gate package resolution and are not a security boundary.
- Disposable fixtures outside the checkout used installed Nuxt 4.7.0 and 4.6.1 with a synthetic dependency exposing only `./layer`. Both passed prepare/typecheck for native AppDetailCard, a composable, explicit `#imports` shared value/type, named layer nested import, and an inferred route response. Negative type checks caught a nonexistent route field and invalid shared role. Nitro discovered the server utility while App imports excluded it. Node rejected direct package imports of the component, shared value, and server utility. The current real Apps' generated files still show the Core card and nine Core handlers. No proposed FireUX code, deployment, or historical host was executed in this slice.

Official references: [Nuxt layer authoring](https://nuxt.com/docs/4.x/guide/going-further/layers), [components](https://nuxt.com/docs/4.x/directory-structure/app/components), [auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports), [shared directory](https://nuxt.com/docs/4.x/directory-structure/shared), [server directory](https://nuxt.com/docs/4.x/directory-structure/server), [typed useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch), [Node package exports](https://nodejs.org/api/packages.html#package-entry-points).

## Proposed complete manifest

```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": { "./layer": "./nuxt.config.ts" },
  "files": ["nuxt.config.ts", "app", "server", "shared"],
  "engines": { "node": ">=22.23 <23", "pnpm": "11.9.0" },
  "dependencies": { "firebase-admin": "^12.7.0", "h3": "^1.15.4" },
  "peerDependencies": { "@nuxt/ui": "^4.12.0", "nuxt": "^4.6.1", "vue": "^3.5.43" }
}
```

After architectural approval, verify the consent replacement in Misebox first. Then make an explicit decision about whether each historical consumer migrates or accepts a documented reset-branch break. Do not restore retired host configuration to keep a shim alive. Verify packed and linked layer resolution, native generated types and nine handlers, all three maintained builds, browser isolation, and existing SSR, authorization, projection, and emulator consent behavior before calling the switch complete. No export removals are authorized by this handoff.
