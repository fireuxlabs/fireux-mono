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

The active consumers are Sections/Read create+label update, Items/Write placement,
Items/Read commercial-term edits and AddByName chained Dish creation/placement.
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
