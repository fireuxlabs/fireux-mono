# FireUX Entity spine audit

Date: 2026-10-01. Baseline: `2807ceca9`, branch `main`, clean at entry.
Scope: all 58 workspace manifests in the five maintained pnpm lanes; authored
TS/Vue/JS/MJS imports, runtime roots, module/config registrations, native layers,
App configurations, duplicate package route paths, and current verification.
This is a repository-wide structural and dependency audit with targeted semantic
traces. It is **not** every-line behavioral/security certification or a claim of
repository alignment. No deployment, data migration or live data write occurred.

## Decision for Misebox

The bounded existing-Kitchen Menu setup work may resume without waiting for a
repository-wide layer migration. Keep it inside current Kitchen/Menu owners,
reuse existing records and commands, and verify the affected route and selection
lifecycle. The findings below do not justify a new onboarding schema or folder
symmetry. Existing type failures and development-open Rules remain separate
release limitations; this audit does not authorize shipping.

## Findings and rule review

| Priority / state | Evidence and affected scope | Rule decision / disposition |
| --- | --- | --- |
| P1 / migration | Core `src/config/module/runtime-layer.ts` mutates `nuxt.options._layers`; 13 extension page hooks plus Core's legacy helper reference it. Ecosystem wiring calls the legacy helper. Kitchen still calls it although Misebox Apps declare native layers. | **Replace**, one consuming App/layer family at a time. Preserve conditional loading, precedence, aliases, route filtering, middleware and server scans. Core's own module already uses its native layer; do not describe the legacy helper as supported Nuxt discovery or delete it under remaining consumers. No runtime cutover in this audit. |
| P1 / drift | `fireux-properties` and Tasks/Documents/Compliance each own the same Portfolio capability route path. Property Calendar also overlaps Reservations. Property's Portfolio pages are placeholders; the dedicated extensions contain substantive tools. | **Narrow** route ownership to a verified composition policy in a separate bounded fix. Confirm the selected route in each affected host and capabilities before removal. These are real competing implementations, unlike an intentional App presentation override. Not a Kitchen setup blocker. |
| P1 / drift | `useActivePortfolio.ts` expects `portfolios`, `selection`, `runtime` and `PortfolioWorkspaceEntity`; `usePortfolioWorkspace.ts` exports `data`, `id`, `outcome`, `crud`. Tasks, Documents and Compliance consume the obsolete contract. | **Replace** the stale adapter against current access/selection semantics, with denial and scope-change tests. Do not paper over with `any` or resurrect obsolete state. Current typecheck confirms the failure. Not a Kitchen setup blocker. |
| P2 / aligned | `registerLayoutComponents` in Core delegates to `registerComponentsDir`; Kitchen and ecosystem wiring consume it. | Renamed to state its real component role; no alias. Generated before/after proving hosts retain the same four component names and four native layouts. |
| P2 / drift corrected | `spine.md` cited deleted `scripts/guards/*` as strongest current evidence; `entities.md` called a prose matrix executable; `blog.md` advertised a deleted publishing command. | **Remove** stale enforcement/publication claims. Updated those maps and the directly related components, server API, Firestore Entity and migration maps to current source/check boundaries. No deleted guard framework restored. |
| P2 / overly broad rule corrected | `lasagne.md` said dependencies travel upward while its source examples require lower owners; runtime-filesystem's shared-root language conflated generic mechanics and upper composition. | **Narrow** the prohibition to generic lower mechanics; upper composition may import named domains. Corrected direction and explained nested server folders are not security boundaries. |
| P1 / to-confirm release risk | Blog `View/Page.vue` renders `v-html` after removing only script tags; its reader and normalizer preserve other HTML. Event attributes and dangerous URLs are not covered by that filter. | **Replace** the incomplete sanitization with a reviewed content boundary before treating arbitrary authored HTML as safe. No exploit or production security test performed; this is separate from Kitchen setup and is not fixed by Entity placement. |
| P2 / migration | Core owns product-specific Project implementation; FireUX ecosystem adds Project composition. Generated FireUX components include both Core Project and ecosystem composition. | **Narrow** “Core is product-neutral” as target, not description of complete adoption. Existing global context already labels Project ownership debt. No broad Project extraction undertaken. |
| P2 / aligned placement | Five ecosystem agent metadata files now use `runtime/models/workspace-agents.ts`. Misebox has four real server consumers; the other four remain exported metadata with no observed source consumers. | Content and dependency direction preserved; package runtime wildcard exports resolve the new paths. No AI Entity, registry, forwarding alias or new activation is introduced. |
| P2 / migration | Kitchen migrations mix reusable transformation logic with exact Misebox target runners and Bären ingredient data. `baren-gourmador.py` resolves adjacent files, hashes source and uses a fixed backup URI; named-services hashes its runners. | **Narrow** generic vs operational ownership. App-specific material is operational debt in a reusable extension, but relocation changes source-bound plans and relative dependencies. Keep files in place until consumers, saved plan validity, source hashes and backup paths are reviewed together. No migration executed. |
| P3 / to-confirm | `MenuRouteContexts` and `MenuSurfaces` mix fulfilment (`delivery`, `collection`), interface (`kiosk`, `staff_pos`) and context (`room_service`). `menu/utils/menu-context.ts`, Browse, QR and ordering models consume them. | **Unproved** as one universal surface taxonomy. Existing route grammar is real; names do not establish new owners or justify changing persisted IDs. Record as naming debt, not a new framework or blocker. |
| accepted | 26 populated scoped owner roots use only real roles from components/composables/models/server/utils/demo/tools. Companies extends Place, Tasks/Documents/Compliance extend Portfolio, Reservations extends Property, profile extensions extend User. | **Keep** parent ownership and differing roles. Do not create Company/Task/Reservation roots or empty folders for symmetry. `src/test` is explicitly valid and outside runtime. |
| accepted, bounded evidence | No package dependency cycle or upward named-package source import found; no undeclared named internal source import found in the static scan. All 90 apparently absent registration literals resolve with their authored `.ts` extension. | **Keep** dependency direction and explicit imports; static results exclude computed imports and do not prove semantic ownership of every function. No phantom registration finding after resolving extensions. |
| accepted, bounded evidence | Place route → `usePlaceDetail`/Detail; Place API → `readPlace`. Kitchen transition HTTP adapter → `executeKitchenOrderAction`, shared lifecycle validation and domain authority. | **Keep** useful adapters with transport/composition work; do not mandate wrappers or the same file count for all Entities. |
| accepted / verification limit | Three template consumers import only the flagship result type from a server file. Kitchen embedding middleware dynamically imports trusted code inside `import.meta.server`. | **Keep** distinction between erased types, guarded server execution and executable browser imports. No secret leak established from these paths. Full production client-bundle analysis remains unperformed. |
| to-confirm | AI navigation benefit in the published article was stated as fact; no measured comparison found. | **Unproved** performance claim. Replacement article labels this experience-based reasoning. |

## Registration and sibling evidence

Core's `defineFireuxConfig` supplies its native layer. Twelve packages currently
ship `src/runtime/nuxt.config.ts`: Core, Docs, FireUX/Misebox/Werkbox ecosystems,
AI, Blogs, Companies, Jobs, Kitchens, Places and Products. A layer file's presence
is not proof that every consumer uses it. FireUX and Misebox host configs declare
selected layers; numerous other Apps still rely on legacy module loading.

Kitchen and Place register Entity components with explicit prefixes; Kitchen
Workspace uses `WorkspaceKitchen`, priority 20, and ignores overlapping paths in
the generic Kitchen scan. Supplier/Property/Portfolio use comparable explicit
registrations with their domain differences. Jobs adds capability-sensitive
page filtering; Kitchen adds tenant Menu aliases and reserved route keys.
These real policies must survive a future loader cutover.

Fresh FireUX and Misebox `nuxi prepare` both succeeded. Their generated
`app/.nuxt/components.d.ts` resolves BlogViewArticle, Core and ecosystem Project
composition, and Kitchen Workspace components to current owning files. Generated
names are inspected evidence, not a guarantee that every route renders.

Six duplicated package page paths were found: the three Portfolio capabilities,
Property Calendar, Kitchen index and Place detail. Kitchen/Place ecosystem
compositions can be intentional upper overrides; the Portfolio placeholders
compete with real capability implementations. Classify by consumer meaning,
not by duplicate filenames alone.

## Publication outcome

The existing public URL was read in the browser. Its article has a valid Place
example but overstates AI benefits, blurs shared mechanism/composition direction,
and does not explicitly explain nested Entity discovery. The replacement draft
is [entity-spine-article-2026-10-01.md](entity-spine-article-2026-10-01.md).
It preserves URL intent, uses current source examples, and qualifies migration
and verification claims. No private account/customer material was added.

**Live update blocked:** `Blog/Edit.vue` is empty; the old local publisher is
absent from the App/root manifests and source. `useBlogUpdate` exists as a client
mutation, but there is no supported current edit surface or MCP/Skill write
adapter. Mutation context forbids bypassing this with arbitrary database writes.
The article remains live unchanged; the draft is not falsely described as published.

## Verification limits

The inventory includes all declared workspace packages, including the template
and two tools. The static embed harness and launcher without their own manifests
are supporting source, not additional workspace packages. Dependencies, generated
artifacts, build output, caches and Git history were excluded from source scanning.

No exhaustive click-through of every App, live authorization test, production
bundle analysis, data consistency audit, Firebase Rules deployment/readback or
provider integration test was performed. Every business function was not manually
read. Tests and type checks below report their actual scope and failures; no green
structural result overrides a failed typecheck. Remaining stale references in
other maps are listed separately rather than silently certified.

## Maintained package/App inventory

Each row was included in manifest/dependency, authored-source import and
runtime/configuration scans. Root lists describe actual folders, not Entity
classification by name. “Native” means a runtime layer file exists, not universal
consumer adoption. App layer declarations are reviewed separately above.

| Package / App | Source path | Runtime roots | Native layer | Internal dependencies |
| --- | --- | --- | --- | --- |
| ausfinn-apartments | `projects/buenohost/ausfinn-apartments` | App/tool source | no | fireux-blogs, fireux-buenohost, fireux-core |
| baeren-ringgenberg | `projects/misebox/baeren-ringgenberg` | App/tool source | no | fireux-blogs, fireux-companies, fireux-core, fireux-go-qr, fireux-jobs, fireux-kitchens, fireux-misebox, fireux-places, fireux-products, fireux-sproochli |
| bangin-coffee | `projects/misebox/bangin-coffee` | App/tool source | no | fireux-blogs, fireux-core, fireux-go-qr, fireux-misebox |
| book-with-nats | `projects/buenohost/book-with-nats` | App/tool source | no | fireux-blogs, fireux-buenohost, fireux-core |
| bringli-app | `projects/bringli/bringli-app` | App/tool source | no | fireux-blogs, fireux-bringli, fireux-companies, fireux-core, fireux-places, fireux-suppliers |
| buenohost-app | `projects/buenohost/buenohost-app` | App/tool source | no | fireux-blogs, fireux-buenohost, fireux-core, fireux-properties |
| find-my-seo-app | `projects/fireux/find-my-seo-app` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux, fireux-jobs, fireux-products |
| fireux-ai | `packages/extensions/fireux-ai` | components, composables, models, pages, server, tools, types | yes | fireux-core |
| fireux-app | `projects/fireux/fireux-app` | App/tool source | no | fireux-blogs, fireux-core, fireux-docs, fireux-fireux, fireux-misebox, fireux-products |
| fireux-blank | `projects/fireux/fireux-blank` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux |
| fireux-blogs | `packages/extensions/fireux-blogs` | components, composables, models, pages, server, user, utils | yes | fireux-core |
| fireux-bringli | `packages/ecosystem/fireux-bringli` | ai, pages, public | no | fireux-ai, fireux-core, fireux-suppliers |
| fireux-buenohost | `packages/ecosystem/fireux-buenohost` | ai, public | no | fireux-ai, fireux-core, fireux-properties, fireux-reservations |
| fireux-companies | `packages/extensions/fireux-companies` | pages, place, server | yes | fireux-core, fireux-demo, fireux-places |
| fireux-compliance | `packages/extensions/fireux-compliance` | pages, portfolio | no | fireux-core, fireux-properties, fireux-tasks |
| fireux-core | `packages/core/fireux-core` | app, assets, components, composables, ecosystem, layouts, middleware, models, pages, project, public, server, tools, types, user, utils | yes | fireux-nuxtfire |
| fireux-demo | `packages/extensions/fireux-demo` | utils | no | none |
| fireux-docs | `packages/core/fireux-docs` | components, layouts, models, pages | yes | fireux-core |
| fireux-documents | `packages/extensions/fireux-documents` | pages, portfolio | no | fireux-core, fireux-properties, fireux-tasks |
| fireux-finance | `packages/extensions/fireux-finance` | components, models, server, utils | no | fireux-core |
| fireux-fireux | `packages/ecosystem/fireux-fireux` | ai, components, pages, project, public, server | yes | fireux-ai, fireux-core |
| fireux-go-qr | `packages/extensions/fireux-go-qr` | components | no | fireux-core |
| fireux-granite | `packages/ecosystem/fireux-granite` | ai, components, pages, public | no | fireux-ai, fireux-compliance, fireux-core, fireux-documents, fireux-properties, fireux-tasks |
| fireux-jobs | `packages/extensions/fireux-jobs` | components, composables, job, models, pages, public, server, utils | yes | fireux-companies, fireux-core, fireux-finance, fireux-places |
| fireux-kitchens | `packages/extensions/fireux-kitchens` | ingredient, kitchen, layouts, menu, middleware, models, pages, public, server, user, utils | yes | fireux-ai, fireux-core, fireux-demo, fireux-finance, fireux-places, fireux-sproochli, fireux-suppliers, fireux-translation |
| fireux-marketplace | `packages/extensions/fireux-marketplace` | marketplace-store, server | no | fireux-core, fireux-finance, fireux-suppliers |
| fireux-mcp-firestore | `tools/mcp-firestore` | App/tool source | no | none |
| fireux-misebox | `packages/ecosystem/fireux-misebox` | ai, app, assets, components, composables, content, layouts, models, pages, plugins, public, server, utils | yes | fireux-ai, fireux-core, fireux-jobs, fireux-kitchens, fireux-places |
| fireux-nuxtfire | `packages/core/fireux-nuxtfire` | plugins | no | none |
| fireux-places | `packages/extensions/fireux-places` | pages, place, server | yes | fireux-ai, fireux-core |
| fireux-products | `packages/extensions/fireux-products` | pages, product, server, user | yes | fireux-core |
| fireux-properties | `packages/extensions/fireux-properties` | composables, demo, pages, portfolio, property, server | no | fireux-ai, fireux-core, fireux-places |
| fireux-reservations | `packages/extensions/fireux-reservations` | pages, property, server | no | fireux-core, fireux-finance, fireux-properties |
| fireux-sharer | `packages/ecosystem/fireux-sharer` | components, pages, public, server, share-profile | no | fireux-core |
| fireux-slap | `packages/ecosystem/fireux-slap` | pages, public | no | fireux-core |
| fireux-sproochli | `packages/extensions/fireux-sproochli` | assets, components, composables, models, server, utils | no | fireux-core |
| fireux-suppliers | `packages/extensions/fireux-suppliers` | pages, server, supplier | no | fireux-ai, fireux-companies, fireux-core, fireux-demo, fireux-places |
| fireux-tasks | `packages/extensions/fireux-tasks` | pages, portfolio | no | fireux-core, fireux-properties |
| fireux-template | `projects/templates/fireux-template` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux, fireux-products |
| fireux-tenant | `projects/fireux/tenant` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux |
| fireux-toolbar | `tools/vscode-fireux-toolbar` | App/tool source | no | none |
| fireux-translation | `packages/extensions/fireux-translation` | App/tool source | no | none |
| fireux-werkbox | `packages/ecosystem/fireux-werkbox` | public | yes | fireux-core |
| friiites | `projects/misebox/friiites` | App/tool source | no | fireux-blogs, fireux-core, fireux-go-qr, fireux-kitchens, fireux-misebox, fireux-places, fireux-sproochli |
| go-qr-app | `projects/fireux/go-qr` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux, fireux-go-qr |
| granite-app | `projects/granite/granite-app` | App/tool source | no | fireux-blogs, fireux-core, fireux-granite, fireux-properties |
| holzworm-app | `projects/fireux/holzworm` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux |
| interlaken-essen | `projects/misebox/interlaken-essen` | App/tool source | no | fireux-blogs, fireux-companies, fireux-core, fireux-jobs, fireux-marketplace, fireux-misebox, fireux-places, fireux-sproochli, fireux-suppliers |
| kjordi | `projects/sharer/kjordi` | App/tool source | no | fireux-blogs, fireux-core, fireux-go-qr, fireux-sharer |
| la-tap-berne | `projects/misebox/la-tap-berne` | App/tool source | no | fireux-blogs, fireux-core, fireux-go-qr, fireux-kitchens, fireux-misebox, fireux-places |
| lifeguard-community-app | `projects/fireux/lifeguard-community` | App/tool source | no | fireux-blogs, fireux-core, fireux-fireux |
| misebox-app | `projects/misebox/misebox-app` | App/tool source | no | fireux-ai, fireux-blogs, fireux-companies, fireux-core, fireux-demo, fireux-go-qr, fireux-jobs, fireux-kitchens, fireux-misebox, fireux-places, fireux-sproochli, fireux-suppliers |
| richies-reinigung | `projects/werkbox/richies-reinigung` | App/tool source | no | fireux-blogs, fireux-core, fireux-werkbox |
| sharer-app | `projects/sharer/sharer-app` | App/tool source | no | fireux-blogs, fireux-core, fireux-sharer |
| slap-app | `projects/slap/slap-app` | App/tool source | no | fireux-blogs, fireux-core, fireux-products, fireux-slap |
| sproochli-app | `projects/fireux/sproochli` | App/tool source | no | fireux-ai, fireux-blogs, fireux-core, fireux-fireux, fireux-products, fireux-sproochli |
| werkbox-app | `projects/werkbox/werkbox-app` | App/tool source | no | fireux-blogs, fireux-companies, fireux-core, fireux-jobs, fireux-places, fireux-werkbox |
| yellow-velo-app | `projects/slap/yellow-velo` | App/tool source | no | fireux-blogs, fireux-core, fireux-products, fireux-slap |

## Executed checks

- FireUX and Misebox `nuxi prepare`: both passed; generated components inspected.
- Kitchen `test:commerce`: **144/144 passed**.
- All 30 package `vue-tsc --noEmit` checks: **13 passed, 17 failed**.
- All 26 App/template `nuxi typecheck` checks: **10 passed, 16 failed**.
- These are baseline failures: this pass edits documentation and a draft only.

### Package failures

`packages/core/fireux-core`, `packages/core/fireux-docs`, `packages/ecosystem/fireux-sharer`, `packages/extensions/fireux-blogs`, `packages/extensions/fireux-products`, `packages/ecosystem/fireux-fireux`, `packages/extensions/fireux-places`, `packages/extensions/fireux-companies`, `packages/extensions/fireux-properties`, `packages/extensions/fireux-jobs`, `packages/extensions/fireux-suppliers`, `packages/extensions/fireux-tasks`, `packages/extensions/fireux-compliance`, `packages/extensions/fireux-documents`, `packages/extensions/fireux-kitchens`, `packages/ecosystem/fireux-granite`, `packages/ecosystem/fireux-misebox`.

### App failures

`projects/bringli/bringli-app`, `projects/buenohost/buenohost-app`, `projects/fireux/fireux-app`, `projects/fireux/fireux-blank`, `projects/fireux/tenant`, `projects/granite/granite-app`, `projects/misebox/baeren-ringgenberg`, `projects/misebox/bangin-coffee`, `projects/misebox/friiites`, `projects/misebox/interlaken-essen`, `projects/misebox/la-tap-berne`, `projects/misebox/misebox-app`, `projects/sharer/sharer-app`, `projects/slap/slap-app`, `projects/werkbox/richies-reinigung`, `projects/werkbox/werkbox-app`.

Failure examples include obsolete Portfolio state fields; Supplier `company_place` projections; Blog query typing; missing Place auto-import types in standalone checks; solution data missing required `seo`; and incompatible vue-router 4/5 route types in the installed dependency graph. These require scoped repairs, not blanket casts or a folder reorganization. Full local logs: `/private/tmp/spine-package-types.log`, `/private/tmp/spine-app-types.log`, `/private/tmp/spine-commerce.log`.

## Remaining documentation debt

Other maps still cite retired guards, including `family-like-menu`, `card-family`, `app-ignition`, `apps-that-slap`, `finance`, `privacy-measurement`, `collection-manager`, `theming`, `landing-templates`, `sharer` and `search-visibility`. Their feature-specific assertions were not recertified here. The global instructions and corrected spine explicitly state that retired checks are unavailable. This is documentation debt, not proof of current enforcement.


## Authorized Blog editor follow-up

The existing `Blog/Edit.vue` now provides an admin-only original-language editor,
isolated preview and editorial review checks using `useBlogUpdate`; the admin
route is `/dashboard/admin/blogs/[slug]`. The narrow patch preserves identity,
publication settings, media and translations. Four focused editorial-update
tests pass. Package typechecking retains six existing diagnostics in create
state, collection query typing, public SEO typing, developer presentation and
server projection; the new editor and update helper have no reported errors.

The local route correctly requires sign-in. The available browser has no admin
session, and Google sign-in returned a connection error. No live Blog write has
been performed. The replacement remains a reviewed draft until an authorized
admin session can save it and the public URL is read back. No application or
Rules deployment was performed. The existing public HTML sanitization limit
remains outside this change; the new preview is sandboxed with a restrictive CSP.

## Menu creation scope repair evidence

- `menu/composables/firestore/mutations/useMenuCreate.ts` captures the intended
  Kitchen and payload before credential waits. Synchronous account and default
  Kitchen epochs invalidate changes away and back, including logout/login to the
  same UID. Explicit input Kitchens remain independent of Workspace selection.
- `src/test/menu-create-scope.test.mjs` executes the owning composable with
  controlled credential waits: 5 tests pass, including both wait stages and
  account/Kitchen round trips. This proves pre-dispatch invalidation with mocked
  transport, not a live Menu creation or deployed behavior.

## Alignment execution checklist — 2026-10-01

This is working evidence, not a repository-alignment claim. All completed slices
remain local/uncommitted; no live writes, deployment or Rules rollout were tested.

| Slice / owner | State | Evidence and next action |
| --- | --- | --- |
| Menu creation / Kitchen Menu | Accepted locally | `menu-create-scope.test.mjs`: independently 5/5; synchronous account/Kitchen round-trip invalidation. |
| Capability launchers and AI / Kitchen | Accepted locally | `capability-tool-scope.test.mjs` + `ai-assistant-scope.test.mjs`: independently 8/8; stale modal/draft/AI results invalidated; Waste route repaired; obsolete Team modal removed. |
| Station Create / Kitchen | Accepted locally | Named `kitchen/server/stations/create.ts`, thin API, active create caller cut over; `station-create.test.mjs`: independently 4/4. Membership-bound authority checked in transaction; no new capacity policy. |
| Station read/default Pass UI / Kitchen | Accepted locally | `station-read-scope.test.mjs`: independently 4/4; pending/error/empty distinct; obsolete ensure requests/results invalidated. |
| Project Identity / FireUX + current Core consumer | Accepted locally | Three Identity/app-context suites independently 18/18; transaction authority, connected-App field ownership, exact PATCH body and stale outcomes covered. App typecheck still reports unrelated subscription-capacity and Blog query diagnostics. Project extraction remains separate debt. |
| Tool catalogue / Kitchen | Implemented, owner checks passed | Three rendered/behavioral tests and focused typecheck passed per Product UX; Menu descriptions no longer advertise callable AI registration, real Team executors retained. Coordinator inspection remains due. |
| Dish/Drink active Create/Update/Delete / Kitchen | Prepared, migration | Three adapters and actual UI callers identified; next serialized implementation slice. |
| Recipe, Prep, Waste, Menu sections/items and compound update / Kitchen | Migration | Enumerate exact callers per slice; retire active browser write alternatives with trusted authority and honest compound recovery. |
| Portfolio adapter and optional capability routes / Properties + capability owners | Prepared, drift | Verify generated enabled/disabled host routes before adapter/registration cutover; then active Task/Document writes. |
| Remaining active non-Kitchen writes / owning domains | Migration | Rank actual consumers; preserve provider recovery and existing authority. |
| Legacy layer consumers, misleading layout helper, ecosystem agent metadata | Prepared, migration/drift | Separate bounded registration/placement slots; generated imports/routes/server discovery before and after. Retire helpers only after final consumer migrates. |
| Project/Core ownership extraction | Deferred to final structural slice | Requires complete consumer/registration closure; Identity pilot does not prove extraction. |
| Blog trusted editorial migration | Human-deferred | Preserve existing editor/article work; no cross-App privilege inferred. |
| Public provider execution permissions | To-confirm | Policy questions block only dependent slices; no invented permission gate. |
| Unused Station Update/Delete and Supplier Ingredient exports | Unconsumed, to-confirm | No authored callers found; require generated/export proof before removal or migration. |
| Default `/api/translate` | Latent gap | Inspected Recipe/Dish/Prep paths pass `translate:false`; no endpoint implementation without an active consumer. |

Each subsequent cut must record exact callers/retired paths, authority and
transaction boundaries, checks, context changes and remaining scope here.
Unresolved migration/drift prevents a repository-aligned claim.


## Dish/Drink protected-command boundary evidence

The three active `kitchen/composables/dish/useDish{Create,Update,Delete}` adapters
now dispatch to `kitchen/server/dishes/commands.ts` through thin API handlers.
The transaction rereads current App membership and membership-bound Kitchen
access, validates allowlisted fields, preserves create-only collisions and
keeps deletion document-only. Image writes remain with the existing upload
owner. The shared domain transport snapshots inputs and rejects obsolete
account/Kitchen epochs before dispatch and after response.

`src/test/kitchen/dish-commands.test.mjs`: six focused tests pass, including
food/drink creation, nested specification validation, transaction revocation,
protected fields, exact adapter envelopes and asynchronous scope changes.
This proves the mocked command boundary; chained UI continuations require
separate acceptance and no live write or deployment was performed.


### Dish UI continuation evidence

The eight active Dish/Drink callers and Menu section controller now use the
protected adapters without obsolete storage options. Dish editor scope epochs
cover account/Kitchen/focus round trips and unmount; the transport also observes
route changes during credential waits. Original image/proposal/spec inputs are
captured before asynchronous work. Stale results do not trigger upload,
placement, navigation, toast or overwrite the current edit state. Saved Dish /
failed image and saved Dish / failed placement remain explicitly partial results.

The command suite plus `dish-ui-scope.test.mjs` pass 14 tests, including actual
SFC scripts with delayed dependencies. Eight affected SFCs compile. This is local
verification; no live saved record, media upload, placement, or deployed behavior
is asserted. The earlier full Kitchen typecheck reports 100 diagnostics outside
the new Dish command/adapters; it is not a green package check.


### Dish media credential boundary

`useDishImageUpload` now captures actor/file/target before its token wait and
uses synchronous scope invalidation for account/Kitchen round trips and disposal.
Pending includes the credential wait; obsolete completion cannot clear a newer
request's pending state. The media, command and UI suites pass 17 tests. Final
focused typecheck before this narrow media repair reports only the existing
Core `useWorkspaceEntryCta.ts:41` route-meta mismatch, with no Dish diagnostics.
The media helper is additionally exercised directly with delayed tokens and
responses; no live upload is asserted. Menu item creation remains its separate
pending writer migration, and create-plus-placement is not atomic.

## Recipe protected-write evidence

Recipe Create/Update/Delete now call named Kitchen-owned commands. The active
Form and Detail consumers no longer pass obsolete write-target options. Trusted
commands validate supported fields, reread current membership/bound Kitchen
access, prevent duplicate overwrite, and preserve document-only deletion.
Form sends edited-language deltas; the update transaction preserves unrelated
stored translations, including concurrent changes, while empty text clears the
specified language only. Pure language seeding and `failedLanguages` remain;
the actual Form uses `translate: false`, with no provider work added.

Ten focused tests pass across `recipe-commands.test.mjs` and
`recipe-scope.test.mjs`, covering authority/revocation, duplicate/input rules,
translation merge, envelopes, preparation/auth/token/response invalidation and
actual Form/Detail stale outcomes. Recipe save does not call Prep creation;
that existing button is a separate subsequent writer slice. Tests use controlled
transactions/transport. No live data write, provider call or deployment occurred.

## Active Prep Create boundary

The only observed Prep writer consumers are the separate buttons in Recipe
Form and Dish Spec. Package/project source search found Update/Delete method
and composable names only in their declarations; generated Misebox imports were
not present for additional inspection. Their exported/registration availability
does not prove active execution, and those adapters remain unmigrated.

Create now uses a named Kitchen command, strict supported-field validation,
transaction-time authority and create-only collision protection. Its adapter
captures seed inputs, actor and Kitchen before awaits and invalidates scope
round trips/disposal. The two callers retain separate Recipe/Dish saves and
suppress obsolete continuation. Recipe's inserted Prep row uses its captured
quantity/unit and is still a local draft, not an automatically saved Recipe.
`prep-create.test.mjs` and `prep-scope.test.mjs` exercise authority, duplicate/input
rules, delayed seeding/auth/token/response and actual button scripts. No live
Prep/Recipe/Dish mutation or provider request was performed.

## Active Waste recording boundary

`Workspace/Waste/Create.vue` → `useKitchenWaste.recordWaste` now uses the named
Kitchen `server/waste/record.ts` command. Existing tool-schema bounds/enums are
enforced; ownership/time/audit fields are server supplied and transaction-time
membership/bound Kitchen access is required. No inventory, cost, update/delete
policy or live-reader change is introduced.

Five focused tests pass in `kitchen/waste-command.test.mjs` and
`kitchen/waste-scope.test.mjs`: real authority helper denial/revocation, accepted
bounds and malformed body rejection, captured input and same-tick scope changes
during auth/token/response, and actual Create success/error suppression. These
use controlled transactions and transport, not live writes or browser proof.

## Menu section/item protected content writes

The active consumers are Sections/Collection create+label update, Items/Add/Repertoire placement,
Items/Edit commercial-term edits and Items/Add/ByName chained Dish creation/placement.
Section POST/PATCH and item POST join the existing protected item PATCH; no
archive/reorder endpoints were added. Facade exports alone are not active-action
evidence. Request bodies are captured before credentials; same-tick account,
Kitchen and route round trips and disposal invalidate pending intent/outcomes.

Eight focused tests pass in `kitchen/menu-content-commands.test.mjs` and
`kitchen/menu-content-scope.test.mjs`, including actual authority, strict bodies,
missing parent/Dish, shared Sellable denial, adapter waits and active SFC
outcomes. Eight existing Dish UI tests also pass, covering the AddByName chain.
Four affected Menu SFCs compile. These are controlled transport/transaction
tests; no live Menu edits, publication, browser proof or deployment occurred.
Metadata/directory atomicity and active Menu Delete remain a subsequent slice.

## Menu metadata/directory and removal

The active Details metadata/rename and Delete consumers now use named trusted
commands and captured scoped transport. Metadata plus its merged directory
projection commit together; the real root-entry helper preserves source IDs,
created stamp and duplicate archival. Free metadata editing remains available,
while name changes require Plus. Publication fields remain excluded.

Removal is explicitly a compound domain command: archive only matching root
source projections and delete the scoped Menu document, with no child/source
cascade. It does not redefine lower primitive Delete. The public index already
rejects a published doorway whose scoped source is missing.

Six focused tests (`kitchen/menu-metadata.test.mjs`,
`kitchen/menu-metadata-scope.test.mjs`) and seventeen existing Menu name/workspace
tests pass. Coverage includes actual root-helper read/write ordering, stable
identity, rollback without partial metadata/projection, authority revocation,
field/tier policy, foreign projections, retained children, and stale credential
and Details/Delete outcomes. No live write, commit or deployment occurred.

Menu completion follow-up: rename/removal navigation now belongs to the
surviving Record context rather than a conditionally mounted Details/Delete
child. The additional actual-context test removes the live Menu before the
response, verifies canonical completion, and distinguishes external
account/Kitchen/routed-slug round trips and parent disposal. No stale Menu data
is retained to keep editors mounted.

Dish removal follow-up: the routed Dish owner now owns command and completion;
the Delete child supplies confirmation and local busy/error presentation. Its
actual script test removes the live Dish before response and verifies return
navigation only for the original route intent. Transport disposal invalidates
predispatch credential waits and obsolete responses. No child cascade or stale
reader retention was introduced.

## Portfolio adapter and route prerequisites

`useActivePortfolio` now consumes the real `usePortfolioWorkspace` data/id/outcome
contract and canonical Portfolio type. The root subscription is gated by ready
current membership-bound IDs; pending, revoked, forged or recreated-membership
selections cannot produce a root read target or child path. Root data with an
obsolete ID or failed outcome is hidden rather than relabelled. This is a reader
prerequisite, not a claim that Task/Document/Compliance writes are migrated.

Nuxt-generated temporary host evidence showed Properties placeholder routes
shadowing the real Tasks/Documents/Compliance owners when installed and
advertising unfinished pages when absent. Removing those three placeholders
produces the owner routes when present and no competing routes when absent.
`portfolio-routes.test.mjs` retains generated route/navigation verification;
`portfolio-workspace-scope.test.mjs` executes the actual adapter/access/reader
chain against controlled live outcomes. Production/browser proof is separate.

## Active Portfolio Task Create/Update

The owning Tasks module registers named create/update commands through exact
POST/PATCH handlers. Current membership lifetime, Portfolio association and App
management authority are rechecked transactionally using the existing Properties
helper. Supported field/type/date/enum checks exclude caller identity and audit
fields. Create is create-only; Update requires the scoped Task. No Delete
endpoint, role restriction, capacity policy or projection rewrite was added.

Task adapters and the active Tasks page capture intent and suppress obsolete
account/App/Portfolio/route/disposal outcomes. The initial Documents link→optional Task guard was superseded by the Documents
cutover below.
Tests execute the actual command/authority and adapters/page/chain with
controlled transaction and credential waits; they do not submit live writes.

## Active Portfolio Documents upload and links

Documents now owns protected upload-and-record and link commands. Multipart and
JSON grammar are checked, authority is checked before upload and again at record
commit, and existing typed references remain references rather than invented
cross-domain authority. Storage is create-only with exact request fingerprints;
uncertain uploads are retained for retry, never blindly deleted. Record retries
and link retries are idempotent for the same actor/App/Portfolio/input. Link and
optional Task stage into the same transaction through Tasks' named helper.

The page captures file/notes/link inputs and keeps unchanged in-page retry IDs.
Credential, response and UI tests exercise account/App/Portfolio/route round
trips, disposal, stale catch/finally and newer drafts. The old browser record
Create adapter and active browser Storage/link writes are retired. Unused
Update/Delete adapters are not claimed migrated. Abandoned upload cleanup and
cross-reload retry recovery remain gaps; no live upload or write was performed.

Evidence: Documents-owned `document-commands.test.mjs` (8 cases, including rejected bearer before multipart parsing),
`document-scope.test.mjs` (3 cases), Tasks command/scope regression (7 cases),
Documents SFC compilation, focused Documents typecheck and `git diff --check`.
These are controlled implementation checks, not provider or browser proof.

## Active Portfolio Identity

The six actual Identity callbacks now use a strict trusted PATCH rather than
browser root update. Existing App/membership-lifetime/Portfolio management
checks run transactionally; immutable root identity and ownership cannot be
patched. Four authority/body cases and two actual adapter/editor cases cover
field validation, revocation/recreated membership, credential waits, scope
round trips and obsolete feedback. The SFC compiles. Blank/Property Identity
have no active editing control in the inspected source; their read-only
surfaces do not justify new mutation endpoints.

## Layout component registration naming

Core's misleading `registerLayoutsDir` export is now
`registerLayoutComponents`, with its two consumers changed directly. The helper
still registers Vue components; native layouts continue through the Kitchen and
Misebox runtime layers. Actual generated before/after hosts retain KitchenMenu,
KitchenOrders, Menu and MiseboxTenant component identities, alongside their
native layout names. `layout-components.test.mjs` reproduces that bounded
registration proof. No runtime files, layout semantics or compatibility wrapper
were added.

## Interactive Product create/provision

The sole observed rendered admin create page now calls a Products-owned trusted
command instead of Stripe followed by browser Product/Price writes. An owned
inactive reservation binds canonical input, actor/App and request; provider IDs
and attempt timestamps allow the same request to continue after partial failure.
Current admin/dev/`canManageProducts` authority is rechecked before final atomic
Product+Prices persistence. Unknown provider outcomes at or beyond the documented
24-hour idempotency retention floor stop for reconciliation rather than issuing
another create. The official basis is
https://docs.stripe.com/api/idempotent_requests; live provider behavior remains
unproved here. Existing service-key endpoint semantics are unchanged.

Seven command/provider cases, three adapter/page scope cases and one generated
Nuxt/Nitro endpoint-discovery case pass. The actual active page compiles and the
focused typecheck passes. Two stale permission imports found by that check were
replaced with the existing UserSession import; its nonexistent User augmentation
was retired without altering the AppUser flag policy. No provider operations,
commits or deployment were performed.

## Werkbox native-layer consumer proof

The runtime helper now returns from public resolved native membership before
entering legacy `_layers` insertion. Both actual Werkbox hosts were generated
before and after: all captured layers, routes/navigation, components, imports,
layouts, middleware, plugins and Nitro handlers matched. Main retains 7 layers,
84 routes, 527 components and 117 handlers; Richies retains 4 layers, 45 routes,
394 components and 51 handlers. These are bounded generated-source snapshots,
not runtime browser/provider proof.

The two-case `runtime-layer.test.mjs` verifies native membership without reading
fallback internals, Jobs native capability-on/off and actual legacy route
discovery. Remaining legacy consumers retain their original insertion behavior;
no shared hook or package registry was deleted.

Whole-host typechecks remain red outside the changed helper: Werkbox reports
16 diagnostics across Blog collection typing, Company/Place field/type drift,
Job/Profile consumers and its pricing route validator; Richies reports the Blog
collection query-type diagnostic at `useBlogCollection.ts:34`. Both exit 2.
These checks do not justify claiming either complete host type-clean; no related
feature code was changed by the native membership cut.

### Granite native layer alignment evidence

Granite's App now declares its existing ordered runtime composition explicitly:
Core → conditional Properties/Compliance/Documents/Tasks → Granite → Blogs.
The five newly exposed `./layer` exports own conventional Nuxt discovery; existing
modules retain domain registration and explicit technical-role server handlers.
The App's Portfolio workspace decision gates both extensions and their layers.
Core config preserves an explicit Core position, deduplicates layers and still
appends Core by default when omitted (`app-layer-order.test.mjs`, 1 passing case
covering first/middle/default/string/dedup inputs).

Actual Granite generated before/after snapshots match exactly for resolved
layers, routes/navigation, components, layouts, middleware, plugins, Nitro
handlers and imports: 8 layers, 83 routes, 449 components, 91 handlers. A second
actual-host prepare with Portfolio disabled resolves App/Core/Granite/Blogs and
no Portfolio, Tasks, Documents or Compliance routes. The source enablement is
restored afterward. Representative Werkbox generated output also matches its
prior baseline in all eight categories. Other legacy consumers retain their
fallback; no shared helper was removed. These are discovery/configuration
checks, not production or end-to-end functional proof.

### Bringli native layer alignment evidence

The single Bringli host now explicitly declares its established runtime order:
Core → conditional Suppliers → Bringli → Blogs → Places → Companies. Bringli and
Suppliers expose native `./layer` exports; existing owner/consumer module policy
and explicit domain server registration remain unchanged. All host dependencies
already existed, so no dependency installation or lock changes were required.
Actual generated before/after output matches across all eight categories used
above: 7 layers, 86 routes, 503 components and 101 handlers. Supplier-disabled
actual-host preparation omits its layer, routes and API handlers; other layers
remain. Focused layer TypeScript validation exits 0. Source enablement and its
generated output are restored afterward. No end-to-end or production proof is
claimed; remaining legacy hosts retain the shared fallback.

### Sharer native layer alignment evidence

Sharer global and Kjordi explicitly declare Core → Sharer → Blogs, using the
new Sharer native layer export. Both actual hosts' generated before/after
snapshots match in all eight discovery categories. Global retains 48 routes,
397 components and 55 handlers; Kjordi retains 47 routes, 398 components and
55 handlers. Both resolve four layers including the App. Kjordi's Go QR module
remains a component/provider integration, with no new layer. Focused layer types
exit 0; no dependency or provider/auth policy changes accompany this cut.

### BuenoHost native layer alignment evidence

All three maintained Apps declare Core → conditional Properties/Reservations →
BuenoHost → Blogs. The existing Property workspace flag gates both module and
native layer installation. BuenoHost and Reservations expose their native layer;
Apps declare the direct workspace dependencies they now import (five exact
workspace importer additions, no registry version changes or installation).
Actual before/after generated discovery matches in all eight categories for
BuenoHost, Book with Nats and AUSFinn. Global retains 77 routes/444 components;
each tenant retains 76 routes/443 components; all retain six layers and 91
handlers. Property-disabled global preparation has no Property/Reservation
layers, routes or API handlers. Enabled source/output is restored. Focused layer
types exit 0. Provider, permissions and reservation behavior are unchanged.

### Slap native layer alignment evidence

Slap global and Yellow Velo explicitly declare Core → Slap → Blogs → Products,
with a native Slap layer export. Both actual-host before/after snapshots match
in all eight discovery categories, including the Product create POST handler.
Global retains 57 routes/417 components; Yellow Velo retains 54 routes/415
components; both retain five layers and 56 handlers. Focused layer types exit 0.
No dependencies, provider behavior, permissions or Product implementation changed.

### FireUX satellite and neutral starter native alignment evidence

Eight actual hosts now declare exactly their previous resolved runtime layers:
Blank, Tenant, Holzworm, Lifeguard and Go QR use Core/Blogs; Find My SEO additionally
uses Jobs/Products; Sproochli uses AI/Products; the neutral Template uses Products.
They do not gain the FireUX main-App runtime. AI now exports its existing
conventional pages/server/runtime layer. Go QR and Sproochli component/provider
modules remain module-only. All dependencies already existed.

All eight actual-host generated snapshots match baseline in all eight categories;
FireUX main was verification-only and also matches. Layer/route/component/handler
counts respectively: Blank 3/51/410/59; Tenant 3/47/399/53; Holzworm 3/45/399/53;
Lifeguard 3/51/399/53; Go QR 3/69/421/68; Find My SEO 5/63/491/95; Sproochli
5/58/427/65; Template 4/51/420/58; unchanged Main 5/121/454/89. Focused AI layer
types exit 0 and diff check passes. No provider, Project or domain behavior was
changed. Main's optional Docs enablement remains its existing independent rule.


### Native loading closure across maintained hosts

All 26 App configs under `projects/*/*/nuxt.config.ts` were prepared with bounded
temporary fallback diagnostics: zero private insertions occurred. Diagnostics
were removed before the final change. The fallback is now deleted; existing
callers use `requireNativeRuntimeLayer`, which checks public normalized resolved
roots and reports missing config-time ownership explicitly. Jobs filters and
owner module policies remain intact. Native/absent Jobs, explicit missing-layer
failure, Core order and Portfolio owner fixtures pass 5/5; focused helper types
exit 0. No private layer mutations remain; optional debug reads are unchanged.

Every actual host then prepared again and matched its pre-removal snapshot in
all eight categories: layers, routes/navigation, components, layouts, middleware,
plugins, Nitro handlers and imports. Existing emulator-fetch/network warnings
were present while preparation exited 0; no live-data or full runtime claim is
made. Prior whole Werkbox type failures remain independently documented above.

| Actual host | Layers | Routes | Handlers | Discovery comparison |
| --- | ---: | ---: | ---: | --- |
| bringli-bringli-app | 7 | 86 | 101 | 8/8 unchanged |
| buenohost-ausfinn-apartments | 6 | 76 | 91 | 8/8 unchanged |
| buenohost-book-with-nats | 6 | 76 | 91 | 8/8 unchanged |
| buenohost-buenohost-app | 6 | 77 | 91 | 8/8 unchanged |
| fireux-find-my-seo-app | 5 | 63 | 95 | 8/8 unchanged |
| fireux-fireux-app | 5 | 121 | 89 | 8/8 unchanged |
| fireux-fireux-blank | 3 | 51 | 59 | 8/8 unchanged |
| fireux-go-qr | 3 | 69 | 68 | 8/8 unchanged |
| fireux-holzworm | 3 | 45 | 53 | 8/8 unchanged |
| fireux-lifeguard-community | 3 | 51 | 53 | 8/8 unchanged |
| fireux-sproochli | 5 | 58 | 65 | 8/8 unchanged |
| fireux-tenant | 3 | 47 | 53 | 8/8 unchanged |
| granite-granite-app | 8 | 83 | 91 | 8/8 unchanged |
| misebox-baeren-ringgenberg | 9 | 266 | 249 | 8/8 unchanged |
| misebox-bangin-coffee | 3 | 46 | 51 | 8/8 unchanged |
| misebox-friiites | 6 | 227 | 202 | 8/8 unchanged |
| misebox-interlaken-essen | 6 | 91 | 136 | 8/8 unchanged |
| misebox-la-tap-berne | 6 | 231 | 201 | 8/8 unchanged |
| misebox-misebox-app | 9 | 300 | 252 | 8/8 unchanged |
| sharer-kjordi | 4 | 47 | 55 | 8/8 unchanged |
| sharer-sharer-app | 4 | 48 | 55 | 8/8 unchanged |
| slap-slap-app | 5 | 57 | 56 | 8/8 unchanged |
| slap-yellow-velo | 5 | 54 | 56 | 8/8 unchanged |
| templates-fireux-template | 4 | 51 | 58 | 8/8 unchanged |
| werkbox-richies-reinigung | 4 | 45 | 51 | 8/8 unchanged |
| werkbox-werkbox-app | 7 | 84 | 117 | 8/8 unchanged |

### Project owner extraction closure

The former 70-file Core Project tree is removed. Project implementation now
belongs to the FireUX ecosystem alongside its existing intent/context files;
the generic publication transport was separated into Core App event ownership.
Four source-owned Project tests moved with the domain. Actual FireUX App imports,
shared test consumers and component/composable registration follow the new owner.
Project root/Team/Test mutation targets moved to domain-owned `server/targets.ts`;
generic database infrastructure and `projectMeta` remain Core-owned. No Core
runtime import points upward to the FireUX ecosystem.

Generic `/api/internal/events/user-joined` stays Core-owned. Its wire envelope,
OIDC audience validation, existing environment names and disabled/delivered/
duplicate outcomes are retained. Three mocked transport checks cover disabled,
configured OIDC/payload, duplicate, malformed target and receiver failure. No
network/provider call was made. Project monitor model/validator declarations
moved without creating an unevidenced receiver endpoint.

Focused extraction/authority/guest/identity/team/shared reader/transport suite:
42/42 passed. Domain model/helper/server type check exits 0. Broader Vue checking
with actual generated globals exits 2 on the existing Blog collection query-type
error; it is not a full type-clean claim. Wider existing mock suites expose
unrelated stale bindings: Kitchen selection `useAppSession`, Project intent
`watch`, Project landing performer `useAuth` and page `performLandingAction`.
The moved-path reference in the latter suite was corrected; no unrelated product
or mock behavior was altered to claim those suites passed.

All 26 current host snapshots were collected after extraction and compared to
the native-loading baseline. Layers, routes/navigation, layouts, middleware,
plugins and handlers remain identical. Every host retains the Core user-joined
POST exactly once. Nine FireUX ecosystem hosts retain all 33 Project components
with only source paths moved; the 17 other hosts lose exactly those 33 previously
leaked components. Imports have exactly the corresponding Project path moves or
removals (ignoring registration order), with no other differences. No Core
Project source path or compatibility forwarder remains. No live or production
verification, commits or deployments accompany this owner move.

## Final reconciliation — 2026-10-02

This disposition supersedes the historical prepared/migration states above.
Accepted means the bounded local implementation and recorded checks, not deployed,
production-secure, universally type-clean or every-line repository certification.

| Audited slice | Current disposition | Source / scope boundary |
| --- | --- | --- |
| Menu create stale intent | Accepted | Menu `composables/firestore/mutations/useMenuCreate.ts`; captured scope/epoch tests above. |
| Kitchen tools/catalogue/AI launch | Accepted locally | `kitchen/tools`, current owning executors; final catalogue and scope suites passed. Navigation and demand metadata describe capabilities, not an execution registry. Requested tools remain requested. |
| Stations | Active Create/default ensure/read accepted | `kitchen/server/stations/{create,ensure-default}.ts`; Update/Delete adapters remain unconsumed declarations, not migrated CRUD claims. |
| Dish/Drink | Active C/U/D, UI continuation and media accepted | `kitchen/server/dishes`, exact active adapters/UI; media and Menu placement remain distinct effects, not one atomic transaction. |
| Recipe | Active C/U/D accepted | `kitchen/server/recipes`, language delta merge and existing deletion semantics; no new translation service. |
| Prep | Active Create accepted | `kitchen/server/prep-items/create.ts`; `composables/prep-item/useKitchenPrepItem{Update,Delete}.ts` remain unconsumed, to-confirm before activation. |
| Waste | Active record command accepted | `kitchen/server/waste/record.ts`; no stock/cost policy or new Update/Delete. |
| Menu content | Active section create/update and item create/update accepted | `menu/server/workspace-commands.ts` and owning adapters; forwarding archive/reorder methods are not proof of rendered actions and were not expanded for symmetry. |
| Menu metadata/removal | Accepted | Transactional metadata/root projection and compound matching projection archive + scoped deletion; children unchanged. Route-owner continuation survives its own live disappearance. |
| Portfolio adapter/routes | Accepted | `useActivePortfolio`, access-gated Workspace; Tasks/Documents/Compliance own their destinations, competing placeholders removed with generated owner-on/off evidence. |
| Portfolio Task | Active Create/Update accepted | Tasks-owned Portfolio commands; no Delete endpoint invented. |
| Portfolio Documents | Active upload/record/link/optional Task accepted | Documents-owned commands; stable retry binding and explicit storage uncertainty. No cross-reload recovery or abandoned-file cleanup guarantee. Typed link target existence remains unproved where no authoritative reader exists. |
| Portfolio Identity | Active six-field update accepted | Properties-owned Portfolio Identity command; Blank/Property Identity were read-only surfaces, not active writer debt. |
| Project | Active Identity and full owner extraction accepted | FireUX ecosystem Project entity/targets; FireUX App protected commands; generic Core App event transport preserved. |
| Product interactive creation | Accepted locally | Products-owned `product/server/create`; mocked provider retry/reservation/transaction tests. Existing service-key route policy remains separate/to-confirm; expired uncertain provider requests require reconciliation, not blind retry. No unused Publish endpoint built. |
| Other unconsumed writer exports | Unconsumed / to-confirm | Kitchen `useKitchenTeamJoinRequestMutations`, `firestore/useKitchenDelete`, supplier Ingredient mutation declaration; Supplier `workspace/core/useSupplierWorkspace.ts` delete facade; Portfolio Clients/Units mutation factories. No observed active invocation justified migration or deletion. |
| Native registration / layout naming / ecosystem metadata | Accepted | Native assertion with 26-host proof; `registerLayoutComponents`; ecosystem `models/workspace-agents.ts`. No private layer insertion or replacement registry. |
| Kitchen server operations grouping | Accepted placement repair | 21 files now directly under `kitchen/server/{orders,finance,kiosks,dishes}`; APIs, exact imports, type-only consumers and tests updated without new behavior. |
| Remaining catalogue/category/client helpers | Outside active-writer certification | This pass does not claim every browser helper/export is protected or exercised. An exported factory, catalogue label or generated import alone is not an active writer. Activation requires its own actual caller/authority check. |
| Blog editorial/security | Human-deferred / to-confirm | Original Blog rendering/sanitization finding remains; source ownership changes do not resolve content security or authorize editorial work. |
| Menu context/surface vocabulary | To-confirm naming | Existing fulfilment/interface/context identifiers retained; no commerce model or persisted ID change in alignment. |
| Provider/live delivery permissions | To-confirm | Mocked and source evidence only; no live provider, deployment, Rules or production lifecycle proof. |

Kitchen direct-capability move preserved all eight generated Misebox discovery
categories exactly. Focused Order/Kiosk/Dish/Sellable tests passed 75/75 and
Kiosk token/labour tests 4/4; capability server types exit 0 after removing one
unused local import while retaining its public re-export. Project closure retains
its separate 42/42 tests and domain type pass; native closure retains 5/5 and
26-host evidence. Broader host/type limitations above remain unchanged. Final
source references contain no old Kitchen operations implementation paths or Core
Project runtime paths; navigation URLs are not filesystem ownership claims.

Within the original audited active-writer list, no known actionable migration
remains after the accepted slices above. This excludes the explicitly human-deferred
Blog work and retained provider-policy questions. The unconsumed entries are not
known active flows. The non-exhaustive qualification applies to unaudited repository
paths and future activation, not a concealed unfinished item in that active list.
Final catalogue/launcher/AI scope regression passed 11/11.

## AI context ownership and explicit public explanation — 2026-10-02

Five ecosystem guides moved from central `docs/ai` to their owning ecosystem
package `docs/ai`: Misebox, Werkbox, BuenoHost, Sharer and Apps That Slap. Global,
Firestore mutation, identity literature and template guidance remain central
because their scope crosses owners. Root `AGENTS.md` remains the sole router.
All current references and the existing explicit Content/manifest sources were
updated; old files and forwarding paths are absent. No new per-folder guide or
context registry was added. The moved guides retain inheritance, authority,
refresh, verification and maintenance guidance.

The existing curated `readPlatformContext` adds intended industry/white-label/
connected-ecosystem meaning, with Misebox explicitly a proving example rather
than a completed generator. FireUX `/context` reads that projection directly and
links its existing public JSON endpoint. API schema version/visibility/revision
behavior is retained. This page neither reads internal guides nor automatically
injects context into AI requests. Existing `/docs` rendering has separate
explicit sources and unchanged access/publication behavior.

Three tests cover fresh public values and stated limits, unchanged API envelope/
revision, and moved-guide/router/viewer roots. All pass. Focused runtime/API/
manifest types exit 0; the page SFC compiles and actual App preparation discovers
`/context`. Retired-path scan and diff check pass. No live publication, deployment,
command execution or commit accompanied this local slice.
Docs-enabled App preparation also exits 0 and retains `/docs`, its catch-all and
component routes alongside `/context`; ordinary docs-disabled generated output
is restored afterward. This is route/source discovery, not a browser rendering
or production content-index assertion.

### Menu order creation and lifecycle commit boundary

The public order POST now delegates to Menu-owned `ordering/create.ts`;
existing H3 auth adapters remain an explicit dependency. Original Kitchen/Place
inputs survive context resolution. A Menu-specific pricing observer records
actual Menu/Dish/section/item/Sellable reads; commit validation includes complete
collection membership, paginated beyond the transaction reader page size.
Current routing, fulfilment, scheduling and Staff/Kiosk authority are checked
before sequence or Order writes. Idempotent replay retains the prior result;
existing preflight can still reject an unpublished/disabled offering. Pre-order
notification failure after commit no longer reports failed Order creation.
Kitchen lifecycle actions now recheck current membership-bound authority in the
same transaction as Order/Sale/financial-fact writes.

Focused local regression: 69/69 tests pass across creation orchestration, commit
guards, idempotency, Kiosk authority, confirmation-first payment, scheduled
pickup, Sellables and completion identity. Focused dependency types exit 0.
Actual Misebox host preparation retains all eight generated discovery categories,
including exactly one order-create POST. No live order, provider call, deployment,
Rules change or commit was performed. This is source/controlled verification,
not a production ordering proof.
Review repair: a root Menu source that resolves its Kitchen solely by slug now
rechecks that original limit-two lookup in the order transaction. A newly
ambiguous slug is rejected; an explicit Kitchen id retains its existing direct
lookup semantics. The focused guard/orchestration rerun passes 13/13, including
the two added slug-only/explicit-id cases.

### Shared Kitchen website-ordering setup

App `/services/ordering/setup` and Workspace Integrations now consume the same
Kitchen-owned `components/Ordering/Setup.vue`; the former Workspace-only setup
component moved to that owner. The shared flow reuses the actual Service setup
form and configure command. Saved Menu/service checks, enabled state and
unverified operational proof remain distinct. Payment/installation/Incoming
retain their existing editors behind an explicit authorized Kitchen selection
and navigation action; opening setup never changes Workspace selection.

The existing identity/services readers accept an explicit Kitchen context gated
by settled membership-bound access. Service writes snapshot input and invalidate
account/Kitchen/App round trips and disposal during credentials or completion.
No configuration copies or persisted verification flags were introduced.

Local evidence: 38/38 focused setup, service-summary, service-configuration and
Kitchen-service tests pass; all five touched SFCs compile. Actual Misebox host
preparation preserves routes, handlers, layers, layouts, middleware, plugins and
imports, replacing only the old setup component registration with its Kitchen
owner. Focused Vue dependency checking reports the existing Core
`useWorkspaceEntryCta.ts:41` RouteMeta overload diagnostic; it is not a clean
application typecheck. Browser desktop/mobile rendering and live saved-editor
behavior were not verified in this worker. No live writes, commits or deployment.


## Workspace family source alignment — 2026-10-03

Project, Kitchen, Supplier, Portfolio and Property use named selected-Entity
navigation and Core App/family-scoped selection. Blank demonstrates the same
selection contract. Settled authorized collections retain valid selection,
replace invalid selection, and clear only when empty; pending/error reads retain
selection. MarketplaceStore has no proved Workspace interface and is excluded.
Property Reservation record switching returns to its capability first.
The Core page boundary disposes local state on family/Entity/route change.

Workspace composables own selection/navigation/page state; domain access,
readers/commands and pure helpers live under their actual Entity roles and named
capabilities. Portfolio Compliance/Documents/Tasks and Property Reservations
retain their contributing extension owners. Eighty mapped file moves have valid
destinations and no retired authored-path consumers. The shared Kitchen Finance
Overview controller moved from components to workspace/overview composables;
component-local Calendar, Day Detail and AI presentation helpers remain local.
Supplier Catalogue/Ingredients/Items labels now use the existing live detail
projection's Place rather than an absent hydrated field on root records.

Verification: original focused suite 115/115; expanded final family/contribution
suite 96/96 (different selected test set), commerce 146/146, ordering setup 10/10.
Changed Vue compilation: 78 files, zero errors. Relative-import scan: 215 changed
sources, zero unresolved imports. Five App preparations passed: FireUX, Misebox,
Bringli, Granite, BuenoHost; generated navigation names resolve their owners.
`git diff --check` passed.

Limits: broad Kitchen suite 494/511; remaining failures include stale harness
injections (`useLiveAsyncData`, `useMenuMutation`, `useMenuDelete`, `useAuth`,
`serverKitchenAccessTarget`) and an extensionless Node import. Inspected Team
controller bodies are unchanged from benchmark; selected failing harnesses
changed only their moved source paths. This is not a claim all failures are
independently reproduced at the benchmark. Owning typecheck diagnostics:
Core 24, FireUX 3, Kitchen 96, Supplier 6, Properties 3; Reservations, Documents,
Tasks and Compliance zero. Supplier's six relevant `company_place` errors and
Property's three obsolete active-context errors were repaired; remaining
standalone failures still limit certification. Existing Kitchen browser preview
refused the connection, so signed-in desktop/mobile switching remains unverified.
No commit, push, deployment or production mutation belongs to this alignment.

## Team / onboarding contract pass — 2026-10-03

### Actual capability and operation inventory

This inventory distinguishes the active surfaces and commands inspected here
from a promise that every advertised capability is complete. `Workspace/Home`,
`Overview`, `Identity`, `Team`, `Calendar`, and `Test` names describe composition;
folder presence alone is not readiness.

| Family / contribution | Implemented human responsibility | Agent/tool evidence | Coordinating operation / limit |
| --- | --- | --- | --- |
| Project | Home creation, Identity, Team, Apps and Ecosystem management; Overview and Calendar presentation | Human Team commands consume Core controls; no proved Project Team agent executor | `useProjectWorkspaceCreate` calls App-owned `server/project/index/create.ts`; Project-owned App `server/project/apps/create.ts` is separate. Guest create/resume has no account adoption. App + initial membership transaction is followed by non-atomic reference reconciliation. |
| Kitchen | Home/Identity/OperatingHours, Team, Menus, Dishes, Recipes, Ingredients, Orders, Stations, Services, Integrations; finance reads completed sales | `kitchen/models/capability-tools.ts` and Kitchen agent execution are actual structured declarations/executors; do not infer execution elsewhere | `completeKitchenOnboarding` coordinates required Place, root, Team/access and defaults in its existing trusted transaction. Directory contribution, guest handoff and shell creation are distinct. Prep planning, food-safety work and stock/purchasing/receiving are not certified by this pass. |
| Supplier | Home/onboarding, Team, Items, Ingredients, Catalogue and Overview | Human named Team commands; no proved agent Team declarations | Trusted Supplier onboarding requires canonical Company; root/Team/access composition. Identity editing and Test production are incomplete. |
| Portfolio | Home/onboarding, Identity, Team and Properties; Overview/Calendar | Human named Team commands; agent execution unproved | Trusted Portfolio onboarding owns root/Team/access. Finance remains parked. Clients/Units writer exports have no observed active invocation in this pass. |
| Property | Home selection, Team and Overview; server onboarding implemented, creation UI doorway incomplete/unproved | Human named Team commands; agent execution unproved | Trusted Property onboarding owns root/Team/access. Optional private manual is a later client write, not atomic. Identity editing and Test production are incomplete. |
| Portfolio Compliance | Live records, expiry status and Create task from a selected compliance record | Actual `useTaskProjection` → `useTaskCreate` consumption; no agent proof | Compliance contributes Portfolio child records and consumes Properties authority. Its mutation exports are not all proved through a user-facing form. |
| Portfolio Documents | Documents page, upload and link creation | No agent executor proved | Domain commands and scope tests own child-record operations; no new Portfolio authority owner. |
| Portfolio Tasks | Tasks page and create/update commands | Compliance-to-Task projection is a real cross-capability consumer | Child commands reuse Portfolio authority; no generic coordinating engine required. |
| Property Reservations | Collection, create, record and calendar routes contributed by `fireux-reservations` | No agent executor proved | Named reservation command/read/access implementation is real; Properties' placeholder alone must not be treated as proof Reservations is missing when its extension is enabled. |

Primary source locations: each owning Entity's `components/Workspace`,
`composables`, `server`, and `models`; contributions' actual
`pages/workspace/portfolio/**` / `pages/workspace/property/**` and domain commands.
Blank is a selection demonstration. MarketplaceStore is outside this Workspace
sequence. No empty parity folders, service wrappers or generic registry added.

### Implemented lifecycle repair

All five Team adapters capture Entity/account/App/membership intent before
credential waits; Kitchen PATCH retains its captured target. Mutable command
inputs are copied. Already dispatched results remain truthful, with obsolete
focus/refresh effects suppressed. Core Team forms independently invalidate
account/App/membership and draft/record/dialog round trips before showing
completion effects.

Project, Supplier, Portfolio and Property onboarding adapters now capture
account/App/membership and immutable request intent before credentials.
Project/Portfolio/Supplier active creation forms suppress obsolete selection,
errors and navigation. Kitchen preview/completion snapshot input; its onboarding
controller guards preview/completion and cancels live-collection waits on
account/App/membership/route/disposal changes. Optional Property manual is
skipped if root completion belongs to obsolete intent; no atomicity claim.

The next Kitchen Menus proving slice is to compare its real human actions and
agent execution against the same named command/intent boundary, starting with
one existing create/update operation. Preserve the settled commerce model;
do not redesign Menu ownership or introduce an engine.

### Verification and limits

- Actual Team adapter → shared form tests: 162 passing, including every family
  and create/update/delete after account/App/membership round trips. Controlled
  transport deliberately returns successful already-dispatched outcomes.
- Combined scope/dialog/Kitchen completion and ordering-setup suite: 166 passing
  before the additional 45 integrated controller/form cases; onboarding reset
  tests cover delayed validation and delayed completion success/failure.
- Domain authority/onboarding/Team and Documents/Tasks/Reservations command
  suite: 81 passing. No live Firestore calls or mutations.
- FireUX, Misebox, Bringli, Granite and BuenoHost App prepares: all exit 0.
  Eight changed Vue scripts compile. Relative changed-source imports resolve;
  `git diff --check` passes.
- Owning standalone typechecks remain failing: Core 21, Kitchen 94,
  Properties 1, Supplier 4, FireUX ecosystem 1 diagnostics. No diagnostics in
  the new scope helper, Team forms, onboarding controllers or creation adapters.
  Supplier Create retains its pre-existing `public` mode mismatch; Project
  Identity retains its missing `useToast`; Properties Demo has a stale Place
  `source` field. Remaining Core/Kitchen errors are outside this bounded pass.
  This is not a clean repository typecheck claim.
- Preview `workspace.localhost:3001` refuses connections. Desktop/mobile
  interaction is unproved; no server restart, production change or deployment.
- Property Workspace creation has an adapter exposed through Workspace CRUD,
  but no rendered active creation consumer was found in this inspected scope.
  Its request/credential boundary is tested, not a working creation-page proof.
- Kitchen selection invalidation cancels its owned live wait and releases the
  pending handoff. Core onboarding reset/invalidation suppresses late validation
  or finish errors/results, preserving a newer flow.

All edits remain local and uncommitted. No Rules changes, commits, pushes,
database migration or production mutation occurred.

### Per-capability/action source matrix

Implemented means a current source-backed surface/command, not deployed or
proved in production. Unproved means this pass did not establish its behaviour.
Research catalogue entries remain proposals unless an actual handler/executor and
consumer are identified. Source links below locate current route composition.

| Family / capability | Disposition | Actual action / limit | Source anchor |
| --- | --- | --- | --- |
| Kitchen · Home | Implemented | Select/manage Kitchen; creation through existing onboarding | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/index.vue) |
| Kitchen · Overview | Implemented / unproved in use | Read operational summaries; not every child source is connected | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/overview/index.vue) |
| Kitchen · Identity | Implemented | Edit Kitchen identity through domain-owned controls | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity/index.vue) |
| Kitchen · Appearance | Implemented / unproved in use | Configure presentation | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity/appearance.vue) |
| Kitchen · Operating hours | Implemented | Configure venue windows; separate from service availability | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity/operating-hours.vue) |
| Kitchen · Menus | Implemented | Browse/create/edit/publish; Delete not certified; record perspectives canonical | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menus/index.vue) |
| Kitchen · Dishes | Implemented | Browse/create/update/delete specification; selected-record actions | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/dishes/index.vue) |
| Kitchen · Drinks | Implemented | Same dish family with drink context; not an independent storage owner | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/drinks/index.vue) |
| Kitchen · Recipes | Implemented | Browse/create/update/delete; downstream usage incomplete | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/recipes/index.vue) |
| Kitchen · Ingredients | Implemented / partial | Browse/connect/edit/remove Kitchen-scoped links; canonical identity separate | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/ingredients/index.vue) |
| Kitchen · Orders | Implemented | Incoming/accept/prepare/ready/complete and payment/order state; no live journey proof here | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/index.vue) |
| Kitchen · Pass / Queue | Implemented / unproved in use | Operate selected working orders; station preparation requirements domain-owned | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/pass.vue) |
| Kitchen · Pre-orders | Unproved | Destination exists; scheduled-order behaviour not re-proved by this pass | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/pre-orders.vue) |
| Kitchen · Services | Implemented | Configure named context, schedule and fulfilment eligibility | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/services/index.vue) |
| Kitchen · Tables | Partial / unproved | Read-only table presentation; full service workflow not certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/tables/index.vue) |
| Kitchen · Stations | Implemented | Browse/select/create station; broader catalogue hypotheses remain proposals | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stations/index.vue) |
| Kitchen · Fulfilment | Implemented / unproved in use | Existing working surface; no new lifecycle proof here | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/fulfilment.vue) |
| Kitchen · Calendar | Partial | Date selection/presentation; not a claim of connected planning events | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/calendar/index.vue) |
| Kitchen · Prep | Incomplete | Planning and batch records explicitly not connected | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/prep/index.vue) |
| Kitchen · Food safety | Incomplete | Checks/issues/procedures explicitly not connected | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food-safety/index.vue) |
| Kitchen · Suppliers | Partial / unproved | Browse linked supplier/catalogue/supply-option destinations; procurement not certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/suppliers/index.vue) |
| Kitchen · Inventory | Proposed / incomplete | Literature/research entrance; no working stock command certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/inventory/index.vue) |
| Kitchen · Purchasing | Proposed / incomplete | Literature/research entrance; no purchase workflow certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/purchasing/index.vue) |
| Kitchen · Receiving | Proposed / incomplete | Literature/research entrance; no receiving workflow certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/receiving/index.vue) |
| Kitchen · Waste | Implemented | Record/read Waste event; other research tools not implemented by inference | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/waste/index.vue) |
| Kitchen · Finance / Sales | Implemented / partial | Read completed sales/transactions; not full accounting | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/finance/index.vue) |
| Kitchen · Costs | Proposed / incomplete | Literature/research entrance; no cost pipeline certified | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/costs/index.vue) |
| Kitchen · Performance | Proposed / incomplete | Literature/research entrance; metrics pipeline unproved | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/performance/index.vue) |
| Kitchen · Waste report | Proposed / incomplete | Research/report entrance distinct from actual Waste event recording | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/waste-report/index.vue) |
| Kitchen · Integrations | Implemented / unproved in use | Configure ordering integration/snippet; no deployment proof here | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/settings/integrations.vue) |
| Kitchen · Kiosks | Unproved | Existing destination; not proof of complete kiosk/payment hardware flow | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/settings/kiosks.vue) |
| Kitchen · Team | Implemented | Create/update/remove selected members; shared human/agent authority boundary | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/team/index.vue) |
| Kitchen · Test / Developer | Partial / development only | Existing development surfaces; not customer deliverables | [source](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/developer/test/index.vue) |
| Project · Home | Implemented | Create/resume anonymous Project or account-owned Project | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/index.vue) |
| Project · Identity | Implemented | Domain identity editing; existing type failure retained | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/identity.vue) |
| Project · Team | Implemented | Human create/update/remove; agent executor unproved | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/team/index.vue) |
| Project · Apps | Implemented | Project-authorized App creation; exact identity replay | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/apps.vue) |
| Project · Ecosystem | Implemented / unproved in use | Existing management/read surface; cross-database identity editing not inferred | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/ecosystem.vue) |
| Project · Overview | Implemented | Read summaries | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/overview.vue) |
| Project · Calendar | Partial / unproved | Presentation not proof of event persistence | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/calendar.vue) |
| Project · Test | Development / unproved | No production parity claim | [source](../../packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/test/index.vue) |
| Supplier · Home / Create | Implemented | Canonical Company-backed onboarding | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/create.vue) |
| Supplier · Identity | Incomplete | Editing not connected | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/identity.vue) |
| Supplier · Team | Implemented | Human create/update/remove; agent executor unproved | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/team.vue) |
| Supplier · Items | Implemented / unproved in use | Supplier item management surface | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/items.vue) |
| Supplier · Ingredients | Partial / unproved | Ingredient relationship surface; no full procurement proof | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/ingredients.vue) |
| Supplier · Catalogue | Implemented / unproved in use | Catalogue presentation/management | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/catalogue.vue) |
| Supplier · Overview | Implemented | Read summaries | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/overview.vue) |
| Supplier · Calendar | Partial / unproved | Presentation | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/calendar.vue) |
| Supplier · Test | Incomplete | Canonical test producer absent | [source](../../packages/extensions/fireux-suppliers/src/runtime/pages/workspace/supplier/test.vue) |
| Portfolio · Home / Create | Implemented | Trusted root/Team/access onboarding via rendered form | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/create.vue) |
| Portfolio · Identity | Implemented | Domain identity update | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/identity.vue) |
| Portfolio · Team | Implemented | Human create/update/remove; agent executor unproved | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/team.vue) |
| Portfolio · Properties | Implemented / unproved in use | Browse managed properties; not proof of Property creation doorway | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/properties.vue) |
| Portfolio · Overview | Implemented | Read summaries | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/overview.vue) |
| Portfolio · Calendar | Partial / unproved | Presentation | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/calendar.vue) |
| Portfolio · Finance | Proposed / parked | Explicit placeholder | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/finance.vue) |
| Portfolio · Test | Incomplete | Canonical test producer absent | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/test.vue) |
| Property · Home | Implemented selection; creation incomplete | Collection selection only; /workspace/property/create target has no source page | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/index.vue) |
| Property · Identity | Incomplete | Editing not connected | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/identity.vue) |
| Property · Team | Implemented | Human create/update/remove; agent executor unproved | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/team.vue) |
| Property · Overview | Implemented | Read summaries | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/overview.vue) |
| Property · Calendar | Extension-dependent | Reservations extension contributes actual calendar | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/calendar.vue) |
| Property · Reservations | Placeholder in Properties; implemented contribution | Use fireux-reservations routes/commands when enabled | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/reservations.vue) |
| Property · Test | Incomplete | Canonical test producer absent | [source](../../packages/extensions/fireux-properties/src/runtime/pages/workspace/property/test.vue) |

### Tool catalogue versus executable actions

The [Kitchen catalogue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/capability-tools.ts)
contains Identity, Dishes, Drinks, Ingredients, Food safety, Menus, Orders,
Inventory, Purchasing, Receiving, Waste, Recipes, Stations, Team, Suppliers,
Finance/Sales, Costs, Waste report and Performance entries. Most are generated
from `toolHypotheses`: `requested`/`available` labels are authored catalogue
claims, not evidence that an action executes. The matrix above deliberately
keeps those areas partial/proposed/unproved where appropriate.

The [human action handler map](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenCapabilityTools.ts)
actually registers Menu create/update; Dish and Drink create/update/delete;
Ingredient add/delete; Recipe create/update/delete; Station create; Waste event
recording. Target-route handlers require a selected record. A route handler is
an entrance, not independent proof of a successful mutation. Unregistered
hypotheses do not become executable because they appear in the catalogue.
Team's `liveTools` are distinct from `proposedTools`; its actual domain adapter,
shared forms and agent executor are the proving seam. This pass does not promote
other catalogue claims into an agent contract.

| Contribution / retained export | Disposition | Actual action and source |
| --- | --- | --- |
| Portfolio Compliance | Implemented read/status and selected-record Task projection; broader CRUD UI incomplete/unproved | [Compliance page](../../packages/extensions/fireux-compliance/src/runtime/pages/workspace/portfolio/compliance.vue) reads records and calls Task projection/create. |
| Portfolio Documents | Implemented commands; production use unproved | [Documents page](../../packages/extensions/fireux-documents/src/runtime/pages/workspace/portfolio/documents.vue), upload/link handlers and command tests. |
| Portfolio Tasks | Implemented create/update; production use unproved | [Tasks page](../../packages/extensions/fireux-tasks/src/runtime/pages/workspace/portfolio/tasks.vue) and command tests. |
| Property Reservations | Implemented contributed collection/create/focus/calendar; production use unproved | [Reservation collection](../../packages/extensions/fireux-reservations/src/runtime/pages/workspace/property/reservations/index.vue) and [command](../../packages/extensions/fireux-reservations/src/runtime/property/server/operations/reservations/command.ts). |
| Portfolio Clients / Units | Unused in the inspected active-surface inventory; not deleted | [Clients create](../../packages/extensions/fireux-properties/src/runtime/portfolio/composables/clients/useClientCreate.ts) and [Units create](../../packages/extensions/fireux-properties/src/runtime/portfolio/composables/units/useUnitCreate.ts) have no observed rendered invocation here. |
| Property creation | Trusted implementation retained; rendered journey unavailable | [Onboarding](../../packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts) and [root planner](../../packages/extensions/fireux-properties/src/runtime/property/utils/property-create.ts) remain. The unused browser root/manual/onboarding adapter and dangling public Create CTA are retired. Home Collection/Index select existing records; no `/workspace/property/create` route or working rendered creation flow is claimed. |

### Retry semantics are not universal

- [Supplier onboarding](../../packages/extensions/fireux-suppliers/src/runtime/supplier/server/index/onboarding.ts)
  rejects a repeated new-root request when the generated organization identity
  already exists (409). Explicit existing-root attachment is a different branch.
- [Portfolio onboarding](../../packages/extensions/fireux-properties/src/runtime/portfolio/server/index/onboarding/onboarding.ts)
  and [Property onboarding](../../packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts)
  likewise conflict when a new-root request resolves to an existing ID. The
  `idempotent` client plan label does not prove transparent new-root replay.
- [Project-owned App creation](../../projects/fireux/fireux-app/server/project/apps/create.ts)
  resumes only when existing App identity/configuration, creator and initial
  admin membership match. Root App + membership creation is transactional;
  Ecosystem/User reference reconciliation follows afterward and is non-atomic.
  A reconciliation failure can therefore occur after successful creation.

These are documented implementation differences, not changed retry policy.
No inventory gap was repaired by adding a feature. This closes the bounded
source inventory; browser/production verification limits remain as recorded.

## Main Entity foundation then Workspace base — 2026-10-03

This is a separate, narrowed pass. Team/onboarding edits above are preserved.
Capability internals, Menu migration, production/data operations and new product
features are excluded.

### Stage 1 finite foundation checklist

Acceptance items for each Entity: (A) one owner and technical-role placement;
(B) canonical model/identity and relationships; (C) consumed collection/read/detail;
(D) actual lifecycle commands and established lower mechanics, with no unused
CRUD parity lane; (E) registration/real consumers and classified retired paths.
A closed source checklist does not certify deployment or complete product CRUD.

| Entity | Owner / canonical contract | Read and real consumers | Actual lifecycle / accepted difference | A–E disposition |
| --- | --- | --- | --- | --- |
| App | Core `runtime/app`; [App model](../../packages/core/fireux-core/src/runtime/app/models/app.model.ts), document ID and `ecosystem_id`; App database | `useAppRead`, `useAppCollection`, `useAppDetail`; App session/Shell, public detail and directory. Native read and public HTTP visibility are distinct. | [Initialization](../../packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts), configured-App client and Project-owned App create; trusted settings/media/membership commands. No ordinary root Delete consumer. | A/B/C/D closed; E checked by explicit Core registration and generated consumers. |
| Ecosystem | Core `runtime/ecosystem`; [model](../../packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem.model.ts), document ID and `project_id`; owning identity database | `useEcosystemRead`, `useEcosystemCollection`, `useEcosystemDetail`, directory/card/route and App relationship readers | No active generic root mutation consumer found. Owning-system provisioning/identity authority is preserved; cross-database directory does not become an editor. | A/B/C/D closed; no parity writes retained. E checked through Core registration. |
| User | Core `runtime/user`; [User model](../../packages/core/fireux-core/src/runtime/user/models/user.model.ts), UID identity; private account separate; AppUser owned by App | `useUserRead`, `useUserCollection`, `useUserDirectoryDetail`; User session/profile/directory with membership visibility | [Account provisioning](../../packages/core/fireux-core/src/runtime/user/server/user-account/provision.ts), bootstrap, trusted profile/handle/avatar. No root Delete consumer; no Auth/account cascade invented. | A/B/C/D closed; E checked through Core registration. |
| Project | FireUX ecosystem `runtime/project`; [Project model](../../packages/ecosystem/fireux-fireux/src/runtime/project/models/project.model.ts); current App-owned protected commands remain justified | `useProjects` public collection, `useProjectCollection` membership-bounded collection, `useProjectRead`, `useProjectDetail`; public routes, guest Home and Workspace | Trusted account/guest create/resume and narrower Identity updater retained. No rendered caller of primitive Workspace create/delete existed; no duplicate Core Project owner. | A/B/C/D closed; E checked through ecosystem registration and direct consumers. |

Exact source cutover: retired the unconsumed App client Update/Delete and server
Update/Delete; Ecosystem and User client/server Create/Update/Delete parity files;
Project primitive Create/Delete and their unconsumed Workspace facade exposure.
The only imported type from the retired App Update file was in its also-unused
server parity adapter. Searches across authored package/App sources found no
other callers. Actual trusted lifecycle commands, models, storage, routes and
relationship policy are unchanged. No forwarding aliases remain.

Ordinary Update grammar: the retired App/User/Ecosystem adapters accepted naked
changes and were not active one-object command consumers. They were removed,
not normalized into more unused files. Project's retained updater is a bound,
trusted Identity capability (`name`, `description`, `image_url`) rather than a
broad ordinary root update. Its narrow change object is an accepted domain
exception under `composables.md`, not a template for unrelated Entity CRUD.

The foundation map was corrected to actual named readers and commands. Missing
`useApp/useUser/useEcosystem/useAppUser` facades and retired scripts are no longer
advertised. Free/Plus/Business product language is distinguished from existing
`free/premium/business` storage. No retired tool was recreated.

Separate feature gaps: Ecosystem editing/provisioning UX and relationship-aware
root removal are not supplied by this structural pass. Property creation UI is
also a separate gap; it does not block verifying an existing Workspace base.

### Stage 2 finite Workspace base checklist

Base items: (S) persistent valid selection and settled empty/error distinctions;
(R) canonical root/current Entity projection; (A) exact membership-bound access;
(N) Home/navigation/routes and page disposal; (O) Entity-owned technical roles.
Capability internals are deliberately excluded.

| Family | Base source anchor | S/R/A/N/O | Actual repair / accepted difference |
| --- | --- | --- | --- |
| Project | [Workspace base](../../packages/ecosystem/fireux-fireux/src/runtime/project/composables/workspace/useProjectWorkspace.ts) | Closed locally | Root projection now waits for exact access; public/anonymous guest reader remains separate. Project stays FireUX-owned; trusted App commands remain App-owned. |
| Kitchen | [Workspace base](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenWorkspace.ts) | Closed locally | Root + Place hydration now starts only for an exact access-granted selection. Adoption/allowance remain Kitchen-owned; no Menu/capability edits. |
| Supplier | [Workspace base](../../packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/useSupplierWorkspace.ts) | Closed locally | Exact access gates current Supplier root; Company/Place identity hydration stays with its existing domain reader. |
| Portfolio | [Workspace base](../../packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/usePortfolioWorkspace.ts) | Closed locally, unchanged | Existing access-bound projection was the working reference; no manufactured source change. |
| Property | [Workspace base](../../packages/extensions/fireux-properties/src/runtime/property/composables/workspace/usePropertyWorkspace.ts) | Closed locally | Exact access gates current Property root. Reservation route-safe switching remains unchanged. Missing creation UI is a separate feature gap. |

All five actual access readers consume Core `useMembershipAccess` and validate
membership creation timestamps. Core persistence owns only active IDs. Domain
collections, roots and access remain separate; no Workspace Entity model or
capability engine was introduced. Existing Home/navigation and Entity/route
boundary disposal were verified through their source-owned checks.

### Separate stage evidence and remaining limits

Stage 1: 71 focused App/Ecosystem/User/Project/read-state/lifecycle checks pass.
Two Project Home harnesses were stale: the first lacked current `useAuth`; the
second loaded public `/` instead of the actual Workspace route that owns the
App action. Both now exercise current source. The independent foundation read
suite also passes: its Dashboard assertion now preserves the existing rule that
membership failure blocks App management but not an available Workspace entrance.

Stage 2: five actual Workspace projection checks pass, including forged IDs,
account loading, old root responses and recreated membership grants. The
selection/navigation/disposal/access batch has 47 passing checks and one legacy
file unable to load under ordinary Node. With a temporary extension resolver,
that file runs 16 checks: 10 pass and 6 expose stale harness dependencies rather
than a new Workspace projection failure:

- `kitchen-access.test.mjs:213,266,279,581` omit `createDefaultKitchenStation` from
  shell/guest transaction harnesses.
- `kitchen-access.test.mjs:707` omits current `useRoute` in its Index harness.
- `kitchen-access.test.mjs:745` omits `resolvePostAuthDestination` from Auth.
- Its ordinary Node load fails at Core `server/utils/ids/path.ts`'s extensionless
  `utils/firestoreDocumentId` import. The temporary resolver changes no repo source.

These legacy tests are not advertised as passing. Their shell/guest/Auth harness
repairs are outside the changed current-Entity projection seam; actual membership
resolution and base disposal tests above are green. No capability migration was
started to address them.

FireUX and Misebox prepare again exited 0 after the retired-path cutover.
Generated imports omit retired mutation names and retain actual App/User/Ecosystem
readers. Project, Kitchen and Supplier generated navigation consumers resolve;
Portfolio/Property registration and consumers are unchanged from the five-App
prepare proof above. No new Vue source changed during these two stages; the
preserved eight edited Vue scripts had already compiled.

Whole authored-source reference scan covered 4,432 files under packages,
projects and tools. No retired mutation symbol/path consumer remains; the only
name match is the deliberately forbidden `useUserDelete` stub in User session's
test. All 72 changed relative imports resolve. `git diff --check` passes.

Standalone owning checks still report Core 21, Kitchen 94, Supplier 4,
Properties 1 and FireUX ecosystem 1 diagnostics. None point at the repaired
Workspace bases or retired mutation paths. Exact existing diagnostic files and
codes are listed below, rather than treating them as a blanket green check.
Preview remains unavailable (connection refused); no desktop/mobile or production
proof is claimed. Both source stages stop here, before any capability work.

| Owning check | Existing diagnostic file | Codes / count |
| --- | --- | --- |
| Core | [packages/core/fireux-core/src/runtime/app/components/Cards/Cell.vue](../../packages/core/fireux-core/src/runtime/app/components/Cards/Cell.vue) | TS6133 / 1 |
| Core | [packages/core/fireux-core/src/runtime/app/components/Cards/Pill.vue](../../packages/core/fireux-core/src/runtime/app/components/Cards/Pill.vue) | TS6133 / 1 |
| Core | [packages/core/fireux-core/src/runtime/app/components/Shell.vue](../../packages/core/fireux-core/src/runtime/app/components/Shell.vue) | TS2339 / 1 |
| Core | [packages/core/fireux-core/src/runtime/app/components/UserProfile.vue](../../packages/core/fireux-core/src/runtime/app/components/UserProfile.vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/components/layouts/default/Footer.vue](../../packages/core/fireux-core/src/runtime/components/layouts/default/Footer.vue) | TS2305 / 1 |
| Core | [packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue](../../packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue) | TS2304, TS2305 / 2 |
| Core | [packages/core/fireux-core/src/runtime/components/layouts/shared/RoleBadge.vue](../../packages/core/fireux-core/src/runtime/components/layouts/shared/RoleBadge.vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/components/molecules/forms/editable/ArrayOfStrings.vue](../../packages/core/fireux-core/src/runtime/components/molecules/forms/editable/ArrayOfStrings.vue) | TS6133 / 1 |
| Core | [packages/core/fireux-core/src/runtime/pages/chat.vue](../../packages/core/fireux-core/src/runtime/pages/chat.vue) | TS2305 / 1 |
| Core | [packages/core/fireux-core/src/runtime/pages/search-demand/index.vue](../../packages/core/fireux-core/src/runtime/pages/search-demand/index.vue) | TS2307, TS7006, TS7053 / 3 |
| Core | [packages/core/fireux-core/src/runtime/pages/search-demand/tools.vue](../../packages/core/fireux-core/src/runtime/pages/search-demand/tools.vue) | TS2307, TS7006, TS7053 / 3 |
| Core | [packages/core/fireux-core/src/runtime/pages/solutions/[slug].vue](../../packages/core/fireux-core/src/runtime/pages/solutions/[slug].vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/pages/users/index.vue](../../packages/core/fireux-core/src/runtime/pages/users/index.vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/user/components/AppMembership/Index.vue](../../packages/core/fireux-core/src/runtime/user/components/AppMembership/Index.vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/user/components/Profile/Index.vue](../../packages/core/fireux-core/src/runtime/user/components/Profile/Index.vue) | TS2304 / 1 |
| Core | [packages/core/fireux-core/src/runtime/user/components/SubscriptionControl.vue](../../packages/core/fireux-core/src/runtime/user/components/SubscriptionControl.vue) | TS2305 / 1 |
| Kitchen | [packages/core/fireux-core/src/runtime/user/composables/session/useUserSession.ts](../../packages/core/fireux-core/src/runtime/user/composables/session/useUserSession.ts) | TS2769 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/ingredient/components/CTA.vue](../../packages/extensions/fireux-kitchens/src/runtime/ingredient/components/CTA.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/ingredient/components/dev/System.vue](../../packages/extensions/fireux-kitchens/src/runtime/ingredient/components/dev/System.vue) | TS2322 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Image/Batch.vue](../../packages/extensions/fireux-kitchens/src/runtime/ingredient/components/Image/Batch.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Onboarding/Provision.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Onboarding/Provision.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FinanceCalendar.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FinanceCalendar.vue) | TS6133 / 22 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Fulfilment/Delivery/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Fulfilment/Delivery/Index.vue) | TS6133 / 22 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Identity/Sections/Sproochli.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Identity/Sections/Sproochli.vue) | TS2339, TS2554 / 2 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Create/Url.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Create/Url.vue) | TS2554 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Review/Apply.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Review/Apply.vue) | TS2554 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Cost.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Cost.vue) | TS2554 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink/Menus/Process/Index.vue) | TS2554 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Overview/Finance.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Overview/Finance.vue) | TS6133 / 10 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Overview/Menus.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Overview/Menus.vue) | TS2352 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Team/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Team/Index.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/overview/useKitchenOverview.ts](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/overview/useKitchenOverview.ts) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/suppliers/useKitchenWorkspaceSupplierSupplyOptions.ts](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/suppliers/useKitchenWorkspaceSupplierSupplyOptions.ts) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/presentation/index.ts](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/demo/presentation/index.ts) | TS2322, TS2339 / 2 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/menu/components/Order/Kiosk/Item.vue](../../packages/extensions/fireux-kitchens/src/runtime/menu/components/Order/Kiosk/Item.vue) | TS6133 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[handle].vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[handle].vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/customer/profile.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/customer/profile.vue) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/drivers/[handle].vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/drivers/[handle].vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/[id].vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/[id].vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/kitchen/member-invitation/[token].vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/kitchen/member-invitation/[token].vue) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/finance/index.vue](../../packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/finance/index.vue) | TS6133 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/server/api/kitchens/[kitchen].get.ts](../../packages/extensions/fireux-kitchens/src/runtime/server/api/kitchens/[kitchen].get.ts) | TS2322 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/server/plugins/kitchen-embedding.ts](../../packages/extensions/fireux-kitchens/src/runtime/server/plugins/kitchen-embedding.ts) | TS2307 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Profile/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Profile/Index.vue) | TS2339 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/CTA.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/CTA.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Identity/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Identity/Index.vue) | TS2339 / 2 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Customer/CTA.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Customer/CTA.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Customer/Identity/Index.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Customer/Identity/Index.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/dev/Chef/System.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/dev/Chef/System.vue) | TS2322 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/CTA.vue](../../packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/CTA.vue) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/composables/chef/useChef.ts](../../packages/extensions/fireux-kitchens/src/runtime/user/composables/chef/useChef.ts) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/composables/customer/useCustomer.ts](../../packages/extensions/fireux-kitchens/src/runtime/user/composables/customer/useCustomer.ts) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/runtime/user/composables/driver/useDriver.ts](../../packages/extensions/fireux-kitchens/src/runtime/user/composables/driver/useDriver.ts) | TS2304 / 1 |
| Kitchen | [packages/extensions/fireux-kitchens/src/test/kitchen/menu-website-snippet.test.ts](../../packages/extensions/fireux-kitchens/src/test/kitchen/menu-website-snippet.test.ts) | TS2739 / 1 |
| Kitchen | [packages/extensions/fireux-places/src/runtime/place/composables/usePlaceOnboarding.ts](../../packages/extensions/fireux-places/src/runtime/place/composables/usePlaceOnboarding.ts) | TS2339 / 1 |
| Supplier | [packages/extensions/fireux-suppliers/src/runtime/pages/dev/fireux-drop.vue](../../packages/extensions/fireux-suppliers/src/runtime/pages/dev/fireux-drop.vue) | TS2345 / 2 |
| Supplier | [packages/extensions/fireux-suppliers/src/runtime/supplier/components/Create/System.vue](../../packages/extensions/fireux-suppliers/src/runtime/supplier/components/Create/System.vue) | TS2367 / 1 |
| Supplier | [packages/extensions/fireux-suppliers/src/runtime/supplier/components/Create/Write.vue](../../packages/extensions/fireux-suppliers/src/runtime/supplier/components/Create/Write.vue) | TS2367 / 1 |
| Properties | [packages/extensions/fireux-properties/src/runtime/demo/properties/scenarios.ts](../../packages/extensions/fireux-properties/src/runtime/demo/properties/scenarios.ts) | TS2344 / 1 |
| FireUX | [packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Identity/Write.vue](../../packages/ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Identity/Write.vue) | TS2304 / 1 |


## Fixed foundation action closure — 2026-10-03

Coordinator-owned implementation pass. This fixed inventory covers existing
main Entity and Workspace base actions. Menu/other capability internals, new
features, live data, Rules and releases are excluded. Human actions need no
unused agent metadata; named trusted workflows need no mandatory service folder.

| Fixed row | Acceptance | Verified disposition |
| --- | --- | --- |
| App initialization/media | Runtime-derived target and real trusted command consumers | Closed: original UID/App/kinds captured; exact result checked; lifecycle and command fixtures pass |
| App settings | Original actor/App/input; trusted command; exact result | Closed: immutable submitted body, shared scope, exact App response |
| App membership | Captured actor/App/input; trusted membership command; exact result | Closed: original actor and request, App/account round trips rejected, exact action/App/User result |
| User account/bootstrap | Explicit current-actor lifecycle and identity-before-media | Closed: existing captured-actor lifecycle retained and current fixtures pass |
| User profile/handle/avatar | Self-only trusted commands; captured actor and submitted values | Closed: self identity and original input retained across credentials; transient watchers released |
| Ecosystem | Owning identity readers; no root write consumer | Closed: accepted read-only foundation; unused CRUD parity remains retired |
| Project create/guest/Identity | Trusted commands and real consumers; current action surface typing | Closed: creation and guest fixtures pass; Identity uses shared intent capture, disposal/App invalidation and exact returned Project |
| Five Workspace bases | Valid selection, exact membership-granted root and page disposal | Closed: current five-domain projection and selection tests pass; Workspace remains a surface over the owning Entity |
| Kitchen creation/adoption/update | Trusted workflows and captured update intent | Closed: shell/guest/adoption fixtures current; update captures submitted patch, actor, App, membership, selected Kitchen and route |
| Supplier/Portfolio/Property root actions | Keep consumed domain commands; remove unused Workspace CRUD exposure | Closed: real create/update adapters retained; unused Workspace CRUD facades retired |
| Root removal | No rendered Workspace delete consumer; remove unused browser-write exposure | Closed: unconsumed Kitchen browser delete removed; no unused Workspace create/delete exposure remains |
| Verification | Current action fixtures/types, discovery and read-only preview | Closed with the verification boundary and evidence below |

Initial exact edit owners: `useAppSettings`, `runAppUserCommand`,
`useUserProfileUpdate`, `useUserHandleUpdate`, `userAvatarProvisioning`,
`useKitchenUpdate`, unused `useKitchenDelete`, four extension Workspace bases;
consumed command intent helper/direct imports only if its scope changes;
source-owned foundation tests, stale Kitchen shell/guest/Index/Auth harnesses,
and recorded type errors on main Entity/Workspace action surfaces.
Preserve domain authority and account/guest/provisioning differences. No new
command engine, forwarding aliases or capability redesign.


### Foundation closure evidence — 2026-10-03

This closes the twelve rows above. Main Entities are App, Ecosystem, User and
Project; Workspace bases are Project, Kitchen, Supplier, Portfolio and Property.
Capability interiors remain a separate phase, including Menus. Optional absent
features and unused agent metadata are not new foundation migration tasks.

Four current regression batches pass: 371 command/lifecycle/projection checks,
31 reader/selection/Project-entry checks, 26 Kitchen access/creation checks and
25 Project Identity/Properties creation checks: **453 passing tests, zero failures**.
The command batch includes real Vue scope invalidation and source-owned adapters;
committed work is retained while obsolete UI completion effects are suppressed.

Reproducible commands from the repository root:

```sh
node --test packages/core/fireux-core/src/test/foundation-command-intent.test.mjs packages/core/fireux-core/src/test/app-settings.test.mjs packages/core/fireux-core/src/test/app-media-sync.test.mjs packages/core/fireux-core/src/test/user-profile-commands.test.mjs packages/core/fireux-core/src/test/user-membership-lifecycle.test.mjs packages/core/fireux-core/src/test/onboarding-command-scope.test.mjs packages/core/fireux-core/src/test/workspace-team-command-scope.test.mjs packages/core/fireux-core/src/test/team-ui-completion-scope.test.mjs packages/core/fireux-core/src/test/workspace-entity-projection.test.mjs
node --test packages/core/fireux-core/src/test/foundation-read-contract.test.mjs packages/core/fireux-core/src/test/workspace-selection.test.mjs packages/core/fireux-core/src/test/workspace-page-state.test.mjs packages/core/fireux-core/src/test/workspace-page-transitions.test.mjs packages/ecosystem/fireux-fireux/src/test/project-landing-client.test.mjs packages/ecosystem/fireux-fireux/src/test/project-landing-intent.test.mjs packages/extensions/fireux-suppliers/src/test/supplier-workspace-identity.test.mjs packages/extensions/fireux-properties/src/test/portfolio-workspace-scope.test.mjs packages/extensions/fireux-properties/src/test/property-workspace-switch-route.test.mjs
node --experimental-loader ./packages/core/fireux-core/src/test/relative-typescript-loader.mjs --test packages/extensions/fireux-kitchens/src/test/kitchen/kitchen-access.test.mjs packages/extensions/fireux-kitchens/src/test/kitchen/kitchen-creation-identity.test.ts
node --test packages/ecosystem/fireux-fireux/src/test/project-identity.test.mjs projects/fireux/fireux-app/app/tests/project-identity-command.test.mjs packages/extensions/fireux-properties/src/test/team-onboarding.test.mjs
```

Owning `vue-tsc --noEmit -p <package>/tsconfig.json` succeeds for Core, FireUX,
Supplier and Properties. Kitchen's package-wide check still reports **90**
diagnostics across capability/legacy surfaces (including Sproochli attachment,
Fulfilment, Finance, Menu and domain-profile UI). The current check reports no
diagnostic in the changed foundation command helper, Kitchen root updater,
Workspace base/Home editor, Admin provisioning, Team entry or Place onboarding.
The wider Kitchen check is a recorded capability-phase limit, not a passing check.

FireUX and Misebox `nuxi prepare` succeed. Generated discovery retains App/User/
Ecosystem readers and Workspace components and contains none of the retired
App/Ecosystem/Workspace mutation names or old command-helper path. The command
helper is consumed by direct imports rather than forced auto-registration.

Read-only local preview: HTTP 200 at `http://[::1]:3000/workspace/project`; browser
and screenshot show Project Workspace settling from loading to Guest, with its
name field, Create Project action and Auth return link. No creation, sign-in or
save was submitted; authenticated live writes and remote provider behavior were
not exercised. The FireUX development server remains on port 3000. Localhost
navigation initially timed out; the verified IPv6 listener resolved the preview.

`git diff --check` passes. This pass changes source and fixtures only; no live
Firestore mutation, Rules change, release, commit or push was performed.


## Accepted three-pass scope — 2026-10-03

The human-defined migration order is:

1. **Main Entities and Workspace Entities, including their directly owned Tools
   and Services.** Main Entities: App, Ecosystem, User and Project. Workspace
   Entities: Project, Kitchen, Supplier, Portfolio and Property. Compare the
   Entity spine, Workspace base surface where present, actual action consumers,
   trusted workflows, authority and verification together.
2. **Workspace Entity capabilities, including their Tools and Services.** Compare
   each capability's composition, records, action consumers and trusted workflows
   within the selected Workspace Entity. This is the owning-capability pass;
   it does not relocate independently owned Entities beneath a Workspace.
3. **Other Entities, including their Tools and Services.** Compare the remaining
   Entity families and their real consumers/workflows. Their use inside a
   Workspace capability does not change their Entity ownership.

Classify work by its owning responsibility, not by a folder called `tools` or
`services`. For example, Kitchen Menus composition belongs to pass two; the Menu
Entity's own spine belongs to pass three. Fix an integration seam in the current
pass without duplicating ownership or claiming the lower Entity fully audited.
Project participates as one Entity with a Workspace surface, not two models.

The fixed twelve-row foundation closure above remains valid evidence for its
inspected actions and base surfaces. It is not a substitute for the complete
pass-one inventory of directly owned Tools and Services. Close each full pass
against its explicit inventory and evidence before advancing; preserve completed
work and do not reopen it merely for optional feature or folder parity.


## Pass one fixed inventory and repair register — 2026-10-03

Pass one owns the eight unique Entities below (Project appears in both Main and
Workspace categories). Existing action consumers, client dispatches, protected
server workflows and Entity-role files were inventoried together. Formal agent
Tool metadata is optional when no agent consumer exists; no mandatory Services
folder is introduced. Read-only views, diagnostics and provider checks retain
separate outcomes and authority. Root creation and adoption preserve actual
lifecycle differences. The pass-two handoff contains all Workspace capability
interiors, including Team, Identity presentation, Test and operational areas.

| Owner | Direct Tools / trusted workflows included in pass one | Disposition |
| --- | --- | --- |
| App | Configured initialization, Project-composed creation, identity/settings editing, public featured-slug curation, media synchronization, AppUser ensure/join/review/role/subscription/removal, joined-event publication; status/environment/asset diagnostics and directory readers | Existing command/lifecycle proof retained; public curation repair required |
| User | Account provision/bootstrap, handle reservation/identity creation, profile edit, avatar provisioning, notification mark-read; owner feed and directory/profile readers | Existing lifecycle/profile proof retained; notification command/owner placement and completion repair required |
| Ecosystem | Owning identity and App/directory readers; no actual root-write Tool consumer | Accepted read-only foundation; no invented CRUD parity |
| Project | Signed-in create, UID-keyed guest create/resume, root identity command, selected-root/access and landing-intent dispatch; owning directory/public readers | Existing proof retained; Project capability interiors are pass two |
| Kitchen | Shell/name-only create, Place-backed onboarding/connection, directory contribution, guest creation/adoption, root identity command, selected-root/access and landing-intent dispatch; owning public/index readers | Existing proof retained; fulfillment/theme/Sproochli/Team/services/orders and other capability interiors are pass two |
| Supplier | Root create/onboarding/connection, root identity update (delivery areas), selected-root/access and public/index readers | Capture update intent and UI completion; retire unused umbrella |
| Portfolio | Root create/onboarding/connection, identity update, selected-root/access and public/index readers | Shared intent capture and exact response proof; retire unused umbrella |
| Property | Root create/onboarding/manual creation, selected-root/access and public/index readers; no observed root/manual edit consumer | Retire unused umbrella and unconsumed browser update adapter; preserve consumed creation workflow |

The additional finite repair list is:

1. `app/composables/useAppPublicSettings.ts` and its two actual featured-slug UI consumers: snapshot values, capture account/App/admin/surface intent and verify exact response.
2. User notification mark-read: place the trusted workflow under `user/server`, make the route thin, capture client identity before credentials and verify exact result; the slideover suppresses obsolete completion and observes the live reader.
3. `supplier/composables/firestore/mutations/useSupplierUpdate.ts` and `supplier/components/Edit/Core.vue`: captured input/account/App/membership/record/route/disposal and completion effects.
4. `portfolio/composables/firestore/mutations/usePortfolioUpdate.ts`, its server identity command and current scope fixtures: consume the shared helper and return/check the exact Portfolio; retain truthful committed results.
5. Retire the unconsumed `firestore/useSupplier.ts`, `firestore/usePortfolio.ts`, `firestore/useProperty.ts` multi-job wrappers and `usePropertyUpdate.ts`. Supplier Preview's sole type import moves directly to the actual interface owner.
6. Move the User profile workflow from its HTTP entrypoint into `user/server/profile`, preserving validation/transaction semantics; keep the route as the existing adapter.
7. Refresh source-owned proof, generated imports and applicable living/context maps, then close this full pass-one register against evidence before pass two.

All seven items are closed against the current source. The real UI dependency
chain additionally required shared field completion repair: SimpleField and
ArrayOfStrings capture their draft, editing session, value and owner intent;
parent User/Supplier/Portfolio messages consume that current-surface predicate.
List actions and image inputs cannot release a newer pending action. Root edit
surfaces dispose on record changes. This is completion hygiene, not new authority.

Closure evidence:

- The expanded foundation suite passed 520 tests, plus 26 Kitchen access and
  creation tests through the maintained relative TypeScript loader.
- After the shared-field repair, 236 affected tests passed, including the actual
  field sources, User/Supplier parent messages, curation membership round trips,
  protected adapters and Portfolio identity completion. These are separate
  runs with overlapping coverage; do not add their counts as unique tests.
- Core, Supplier, Properties and FireUX ecosystem owning typechecks are clean.
  Kitchen's wider package still has 90 diagnostics in capability, Menu and
  profile source: these remain the following passes' work, not a pass-one claim.
- Both consuming Apps prepared successfully; removed browser wrappers and the
  retired notification adapter are absent from generated imports. The new
  notification adapter is explicitly imported by its consumer.
- The local Project Workspace returned HTTP 200 and settled to its guest
  entry with Create Project and the sign-up destination. No live write was made.

Pass one is complete for the fixed eight-Entity inventory. This does not close
Workspace capability interiors or other Entities. Continue with pass two.

## Pass two fixed inventory and repair register — 2026-10-03

This pass covers the maintained Project, Kitchen, Supplier, Portfolio and Property
Workspace capability interiors. Home/selection/base authority is the closed
pass-one seam. Overview is summary composition; Calendar, AI and Research may
be support surfaces rather than new storage owners. A description of requested
work is not an executable Tool. Capability source remains beneath the Entity's
technical roles; independent children retain their actual domain authority.

| Workspace owner | Current capability and supporting source | Executable Tool / trusted Service boundary |
| --- | --- | --- |
| Project | Identity, Team, Test, Apps, Ecosystem; Calendar/Overview | Project identity/Team/Test commands and App-owned Project App creation; Ecosystem identity remains an owning-system read |
| Kitchen | Identity, Team, Test, Menus, Dishes/Drinks, Recipes, Ingredients, Prep, Stations, Orders, Waste, Suppliers, Finance; Appearance, Fulfilment, OperatingHours, Integrations, Services, Settings/Tables; Calendar/Overview/AI/Research | Named Kitchen and Menu commands under their existing server owners; formal Team/Waste tools; provider tests and protected read reports remain separate effects |
| Supplier | Identity, Team, Test, Catalogue, Ingredients, Items; Calendar/Overview | Root identity/Team commands and current catalogue/item readers; Test is explicitly not connected; unused browser CRUD is not a live tool |
| Portfolio | Identity, Team, Test, Properties, Finance; Calendar/Overview | Identity/Team commands and Property composition; Test is not connected; Compliance/Documents/Tasks are contributed by their named extensions |
| Property | Identity, Team, Test, Reservations, Calendar; Overview | Team commands, unconnected Test presentation, Reservation-owned record workflows and shared Calendar composition; read-only identity stays read-only |

Current action adapters and their source consumers were traced before retirement.
The finite repairs are:

1. Retire twenty-four unconsumed browser mutation adapters (Kitchen Order create,
   Prep/Station update/delete, Supplier ingredient and Team join-request wrappers;
   Portfolio Client/Unit update/delete; Supplier Catalogue update/delete and
   Item create/update/delete; Compliance create/update/delete, Document and Document-link update/delete, and Task delete). Preserve consumed named creation and server commands.
2. Rename the three remaining domain Workspace catalogues and agent declarations
   to Capability terminology, cutting over their actual ecosystem/App imports.
   Keep the existing public metadata adapter contract separate.
3. Repair live Project App creation/Test and Kitchen credential-wait seams:
   snapshot original input, capture account/App/membership/selection/disposal
   intent, recheck before dispatch, and suppress obsolete local completion.
4. Preserve truthful committed Dish/Recipe/Prep and Kitchen offering results;
   completion belongs to the current surface. Keep business offering Services
   distinct from the architectural server Service Layer.
5. Repair active capability read seams and current type mismatches: Supplier
   supply options, Overview metadata, Sproochli refreshed state and Menu process
   authentication. Remove unused view bindings rather than introducing owners.
6. Verify affected command/UI behavior, owning packages and generated consuming
   Apps; maintain the relevant maps and close this register before pass three.

The inventory includes Portfolio contributions from Compliance, Documents and Tasks, and Property contributions from Reservations. Project App/Test and Reservation writes must check existing membership-bound authority inside the writing transaction. Reservation implementation moves from its obsolete server/operations bucket to the named server/reservations capability without changing its owner.

The finite source repair register is closed. The original input and scope are captured
before credentials; proved committed results remain truthful and local completion
belongs to the originating surface. End-Service, Project App/Test and Reservation
writes recheck membership-bound authority in the writing transaction. Document
and Task contributions use the same captured-scope contract and return the exact
Portfolio identity. Unsupported Test and supply-option surfaces remain explicitly
unconnected; no feature parity is invented.

Verification recorded on 2026-10-03:

- Core editable completion: 75 passing cases, including the parent's own temporary
  saving/disabled state with an explicit owner predicate.
- Kitchen command scopes: 44 passing cases; Dish/Recipe/Prep/Station/Waste scope
  fixtures: 21 passing cases. Affected UI fixtures: 24 passing cases, plus six
  Sellable terms cases after their exact runtime-config fixture cutover.
- Queued payment and ChoiceGroup completion: eight passing cases. Embedding and
  allowed-website behavior: nine passing cases.
- Portfolio Document/Task commands and UI: 18 passing cases. Reservation commands
  and detail: 12 passing cases. These controlled tests make no live writes.
- Owning package checks pass for Core, Kitchen, Supplier, Properties, Compliance,
  Documents, Tasks and Reservations. FireUX ecosystem Project also passed its check.
- FireUX, Misebox, Granite, Bringli and BuenoHost Nuxt prepare all pass with the
  changed registrations. This proves generated registration, not a live browser
  mutation or a complete generated-App typecheck.

Pass two is locally closed for this fixed inventory and its immediate consumers.
Final generated-App integration remains part of the whole three-pass checkpoint.
Continue with pass three; no repository-wide alignment claim is made here.


## Pass three fixed inventory and repair register — 2026-10-03

This pass covers the remaining Entity owners encountered in the agreed stack and
their consumed Tools, trusted commands and immediate consumers. It does not
promote every stored child or support record into an Entity. Pass-two Kitchen
capability composition remains its owning surface; UI placement does not move
independently identified records into the Kitchen root.

| Owner / record family | Current shape and authority | Inspected Tool / Service connection |
| --- | --- | --- |
| Place and same-id Company role | Place owns venue identity; Company remains its role marker | Consumed ensure/onboarding/update/delete and Company materialization commands; Place UI and Job workplace consumers |
| Menu / KitchenMenu, Recipe, Prep, Dish and KitchenOrder | Their existing root or Kitchen-scoped identity and lifecycle remain explicit | Menu editor/schedule and section commands; the pass-two capability workflows and current order/payment command proofs |
| Ingredient | Root Ingredient model and trusted server commands | Create/update and image generation/batch workflows; Kitchen creation/edit/media consumers |
| Product and ProductPrice | Product owns commercial identity/provenance; prices remain Product children | Trusted idempotent provider creation; unsupported, unconsumed browser lifecycle stubs retired |
| Job, applications and engagements | Job owns authoring/hiring; children retain Job authority | Setup-owned author and hiring command capture; Create/Edit/Apply and User job-history consumers |
| BlogPost | Canonical implementation under `runtime/blog/<role>` | Trusted source-App authoring/create/update/publish; actual admin Create/Edit/Publish consumers |
| MarketplaceStore, Offer and MarketplaceOrder | Existing owner/team/moderation and record-specific authority | Setup-owned write controller separated from live read transport; Interlaken workbench/storefront/admin/personal consumers |
| User role records: Chef, Driver, Customer, Agent, Professional | User-owned profile records, not independent Workspace Entities | Current bootstrap/profile provisioning; Agent/Professional code under User technical roles; profile and experience consumers |

The finite repairs are:

1. Move Blog implementation from shared runtime roles into its Blog owner, and
   Agent/Professional implementation into User technical roles. Move registration,
   imports, tests and references together, with no forwarding paths or empty
   authored directories. Keep consumed generated component names stable.
2. Replace the consumed Blog browser authoring lane with named trusted commands.
   Check source-App provenance and current admin/developer membership inside the
   writing transaction, preserve publication/editorial requirements, reserve new
   slugs once and allowlist updates. Do not restore the retired CLI/MCP writer.
3. Capture original input before credentials in Job author/hiring, Place,
   Company, Marketplace, Ingredient and User-role workflows. Reject context
   round trips and disposal before dispatch; retain exact validated committed
   results afterward. Parent workflows stop obsolete next commands and uploads.
4. Repair current UI completion: Blog creation/editor/media, Job selection and
   hiring, Marketplace surfaces, Ingredient media/batch, profile provisioning and
   Menu schedule. Professional experience uses the editable draft's captured
   lifecycle rather than incorrectly requiring that draft to be in saved items.
5. Retire unconsumed Product lifecycle stubs, unused Product/Ingredient metadata,
   Job state/computed wrappers and the all-purpose Place facade. Preserve actual
   storage models, supported readers, owner-specific defaults and feature deltas.
6. Complete generated-App integration: current Kitchen/Place/configuration Demo
   projections, concrete UI prop and event contracts, direct Place consumers and
   the App typing boundary. Interlaken clears inherited standalone `files` and
   excludes the package shim, matching the generated Nuxt boundary.

Verification recorded on 2026-10-03:

- The final workflow run passes 162 tests across the actual Core scope helper,
  remaining Entity transports, Blog authoring/editor, Menu daily schedule,
  Place onboarding/media and Interlaken account UI. It includes originating input,
  credential waits, account/App/membership/page round trips, disposal, exact result
  identity and truthful post-dispatch completion. No live writes are involved.
- Earlier owner-specific runs cover Menu metadata/content/create and section
  commands, Product idempotent creation, Ingredient image/batch and User-role
  provisioning. These runs overlap; their counts are not summed as unique tests.
- Owning checks are clean for Core, Blogs, Jobs, Places, Companies, Products,
  Kitchens and Marketplace. Pass-one and pass-two owning checks remain recorded
  above. Final Core/Jobs editor checks are recorded in the closure below.
- Generated Nuxt App checks are clean for FireUX App, Misebox App and Interlaken
  Essen after their integration repairs. Pass-two representative prepare checks
  also cover Granite, Bringli and BuenoHost. Typechecks prove integration, not
  production deployment or live end-to-end trading.
- Retired ownership/import paths are absent from maintained source and current
  maps. The moved Blog, Jobs and Reservation runtimes contain no empty authored
  directory residue. Final whitespace validation precedes the local checkpoint.

The fixed three-pass inventory is the acceptance boundary. Open-development
Rules remain unchanged; restricted release permissions, verified Place claiming,
App/Ecosystem ignition, unconnected Test/Supply Options presentation and broader
route adoption remain their explicitly recorded product work. They are not
substitute implementations or hidden extra owners added by this alignment.


## Three-pass local closure — 2026-10-03

The agreed sequence is closed for the fixed inventories above: Main/Workspace
Entities first, Workspace capability interiors second, and remaining Entity
owners third, including their consumed Tools/Services and immediate integration.
The source uses one owning Entity spine, keeps independent child authority,
places trusted implementations under the owner server role, and retains only
supported, consumed client adapters. Shared contracts describe responsibilities;
they do not demand empty folders, matching file counts or invented CRUD.

The last editor verification passes 224 cases across shared editable completion,
remaining Entity command scopes and User role provisioning. That run overlaps
the 162-case workflow run and is not added to it. Final Core and Jobs owning
checks pass. FireUX, Misebox and Interlaken generated-App checks pass; Misebox is
also checked after the final editable-draft repair. Current source and context
references were reviewed, and `git diff --check` is clean before the local Git
checkpoint. No push, deployment, remote data mutation or Rules change is included.

This is closure of the agreed maintained inventory, not a claim that every
historical route or future product feature in the repository has been implemented.
The release/product limitations named above remain explicit. The next product
proof can proceed on the Misebox ordering service and its two entrance flows.

## Bounded ordering setup entrances — 2026-10-03

After checkpoint `6cd354604`, the standalone service setup and Kitchen
Workspace Integrations were verified as consumers of the same Kitchen-owned
`components/Ordering/Setup.vue` and `useKitchenServices` workflow. This does not
reopen the three-pass alignment. Existing configuration commands retain Kitchen
authority, stable Menu references and transaction-time refusal of duplicate
service creation. Management initialization preserves existing Menu records.

The repaired App entrance retains its requested Kitchen in `?kitchen=<id>`
for reload/resume. Initial account/membership hydration and pending collection
reads preserve that request; actual account/App/membership changes clear local
choice and the current URL. The query never grants authority. Selecting or
resuming setup does not change Workspace selection; an explicit authorized
handoff does. Pending resume hides the create/search form until resolved.

Controlled verification: 11 ordering-setup controller/form tests and 24 service
configuration, summary and management-default tests pass. These are separate
suites. Generated Misebox App typecheck passed during the slice; final check is
recorded in the delivery handoff. Browser read-only verification used Daniel's
existing session: both entrances showed the same Bären Kitchen, published Food
and existing pickup Service `573e39b3-6df2-4b85-b65e-91b02ecaf0cc`; standalone
selection survived reload, the existing configuration form opened and Cancel
dismissed it, and Continue in Workspace reached `/workspace/kitchen` with Bären
selected. No Save or create command was submitted. No live data, Rules, provider,
release, commit or push action was included. Customer Order proof remains the
next separate slice.

Independent review correction: requested identity changes after settled reads now
recompute availability from exact access and collection results. An inaccessible
request shows “This Kitchen is unavailable for this account” with a recovery
button; pending reads preserve the request, and read errors show a check failure.
The actual controller regression changes the query after settled reads, then
cycles access pending/ready. All 35 focused cases and the final generated Misebox
App typecheck pass. Browser verification confirmed the unavailable link settles
and Choose another Kitchen clears its query and restores search/choices. No live
command was submitted. Focused independent re-review was requested.
