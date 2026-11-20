# FireUX Core reset · Stage 0 ownership and dependency audit

Updated: 2026-11-20
Ref: 6f3a3d8cf
Role: reviewed source inventory and proposed cutover

Stage 0 covers the Core module, runtime layer, configuration and the entry points
that would change during the reset. The [Core reset handoff](../handoffs/2026-11-20-fireux-core-reset-build-order.md)
sets the implementation order. The [runtime map](../concepts/runtime-filesystem.md)
and [Core model map](../concepts/core-models.md) continue to describe the current
checkout until the relevant slice lands.

## Current and proposed dependencies

Arrows point from a consumer to the dependency it uses.

| Consumer | Current dependency | Proposed boundary |
| --- | --- | --- |
| App assembly | `fireux-app` selects Core, the Ecosystem module and default App extensions even for Go QR | Preserve App bundle ownership. Prove Core directly through its module and layer, and prove the existing standalone App without Workspace. |
| Core App shell | Core Workspace helpers, components, layout and routes are present in the same package | Core owns the App entry and default manifest. The optional Workspace module contributes its own entry, layout, routes and install behavior through a neutral App integration point where needed. |
| Core Ecosystem | Core requires `project_id` in its model, canonical reader, provisioner and public projection. Core App configuration also requires `projectId`. | Core identity should work without a required Project relationship. Preserve the exact Project scope in the FireUX control plane before loosening the Core requirement. Keep existing stored values. |
| Core User and App session | User identity and App session both consume the same App membership reader | Keep one User identity and one App-owned membership reader. Move support definitions and behavior into App's existing roles during Stage 3. |
| Workspace consumers | Kitchen, Project, Property and other Apps import Core's Workspace implementation or rely on its Nuxt registration | Domain integrations explicitly select Workspace. Workspace depends on Core and stays independent of domain packages. Domain records and authority stay with their owners. |

The target arrows are **App assembly → Core and selected extensions**,
**Workspace → Core**, and **Workspace-enabled domain integration → Workspace and
Core**. No domain, Project or Workspace import belongs in universal Core.

The Stage 0 import scan inspected 586 tracked TypeScript, JavaScript and Vue
files under Core runtime, config, module, types and utilities. It found zero
static package specifiers naming another `fireux-*` package. That result covers
literal imports and re-exports. The present coupling is internal imports,
registration, runtime config, templates and stored field expectations.

## Ownership and placement matrix

Paths in the first column are relative to `packages/core/fireux-core/src/`
unless an App or package is named. Decisions are proposed by stage.

| Current path | Classification and current responsibility | Consumers and evidence | Decision |
| --- | --- | --- | --- |
| `runtime/nuxt.config.ts`, `runtime/pages/`, `runtime/layouts/`, `runtime/middleware/`, `runtime/plugins/`, `runtime/server/` | Native Nuxt layer. Registers Fire UI scans and supplies route, layout, bootstrap and HTTP entrypoints. The native trees include optional Workspace adapters today. | Bare Core host, Go QR, FireUX Blank. Generated layouts and routes below. | **Keep** native roles and thin adapters in Stage 1. Move Workspace adapters with their layer in Stage 5. |
| `module.ts`, `config/module/{module-wiring,module-helpers,components-config,pages-config,assets-config}.ts` | Core registration and reusable module mechanics. The module adds composable scans, component groups, route transition policy, SEO/manifest handlers and generated catalogue data. | Core-only host and extensions using the exported registration helpers. Workspace and AppUser scans are explicit. | **Simplify** registration by proving which layer or module owns each entry. Transfer Workspace's scans in Stage 5. Keep public names until their consumers move. |
| `config/app/`, `config/module/{ecosystem-wiring,reserved-route-keys}.ts`, `config/firebase/`, `config/privacy/`, `types/`, `utils/` | Universal App assembly, runtime config, Firebase setup, privacy and public route policy. Includes project and Workspace config requirements today. | `fireux-app/src/config.ts`, `fireux-ecosystem/src/config.ts` and ecosystem entry modules. Package exports distinguish authored and production config. | **Keep** neutral policy. **Simplify** Core Project requirements in Stage 2. Transfer Workspace-only configuration behavior in Stage 5 after inventorying real assembly callers. |
| `runtime/composables/fireux/firebase/`, `runtime/composables/fireux/firestore/`, `runtime/composables/fireux/commands/`, `runtime/utils/firestore-mutations/`, `runtime/server/utils/` | Universal auth, data transport, guarded command and request mechanics. | App and User sessions, membership readers and optional-domain commands. | **Keep** scoped access, listener and transaction semantics. Verify independently of Workspace in Stage 4. |
| `runtime/composables/{forms,http,media,navigation,public,pwa,shared,ui}/`, `runtime/components/{Auth,Collection,Context,Create,Dashboard,Diagnostics,Onboarding,Provider,Pwa,layouts,molecules}/` | Mixed shared UI and technical glue. Includes domain-neutral controls, App account UI, and Workspace entry integrations. | The Core public component catalogue, native default and Dashboard layouts, and existing extensions. | **Keep** universal controls. **Simplify** mixed ownership by removing downstream assumptions and leaving domain-specific compositions with their owners. Keep neutral Dashboard and account navigation usable without Workspace. |
| `runtime/assets/`, `runtime/public/`, `runtime/models/utils/stamps.model.ts`, `runtime/types/`, `runtime/utils/`, `runtime/tools/{types.ts,files/}` | Shared presentation assets, record primitives, technical contracts and file tooling. The shared CSS includes Workspace rules and Dashboard uses layout classes named `workspace-*`. | Core public/profile shells, Workspace, Dashboard and domain surfaces. | **Keep** neutral styles and primitives. **Move** Workspace-owned CSS only after verifying its selectors in Dashboard and other consumers. A shared class name alone does not establish ownership. |
| `runtime/composables/diagnostics/useDiagnosticsUi.ts`, `runtime/app/components/DevControls.vue` | Neutral dev controls with a domain route allowlist in Core. | `fireux-properties/src/runtime/portfolio/components/Create/System.vue` and `fireux-suppliers/src/runtime/supplier/components/Create/System.vue` read note visibility. The allowlist also names Kitchen paths. | **Simplify** first in Stage 1. Remove industry route assumptions from Core and let actual dev-note consumers declare eligibility through an existing route boundary if needed. Preserve visibility state and dev-only behavior. |
| `runtime/app/models/model.ts`, `runtime/app/{composables,server,components}/` | Core App Entity. Owns selected App identity, configured `ecosystem_id`, App initialization, App context, branded assets and App-level readers. | `app/server/detail/read.ts`, `app/server/initialization/initialize.ts`, `app/composables/useAppSession.ts`, `FireuxApp.vue` and App administration routes. | **Keep** canonical identity and App-owned administration. Prove roots in Stage 2. Split the Workspace-specific entry and install behavior in Stage 5. |
| `runtime/app/{contracts,literature,media,utils}/`, `runtime/app/server/{chat,events,initialization}/` | App-owned support and infrastructure. Literature types import Workspace capability-family vocabulary. App chat and join publication have separate server lifecycles. | Authored App metadata and `/api/chat`, internal join events, and App bootstrap. | **Keep** App-level contracts where independently consumed. **Review** chat’s optionality in Stage 4 and **simplify** the Workspace vocabulary dependency in Stage 5. |
| `runtime/ecosystem/models/{ecosystem.model.ts,ecosystem-directory.ts}`, `runtime/ecosystem/server/{identity,directory}/`, `runtime/ecosystem/{composables,components}/` | Core Ecosystem Entity and public projection. Core reads and provisions the identity record. Project membership of the Ecosystem is currently required. | Core `/api/ecosystems`, App initialization, FireUX portal `server/project/ecosystem/read.ts`, `server/utils/apps.ts` and Project Apps. | **Keep** the identity and reader. **Simplify** Project coupling by first protecting exact Project-filtered operations in their owner. Remove the requirement for non-Project Core paths only when those consumers are reconciled. |
| `runtime/user/models/user.model.ts`, `runtime/user/{composables,components,server,utils}/` | Core User Entity, canonical profile and identity plus private account support. | `useUserRead`, `useUserSession`, public identity/profile endpoints and authorized `user/server/user-account/provision.ts`. | **Keep** one person identity and separate access for private account data. Private account, handle, profile, notification and reference lifecycles remain with User. |
| `runtime/app/app-user/{models,types.ts,contracts,utils}/` | App-owned support record currently represented as a nested technical spine. | App session and User session both read it via `useAppUserRead`. `user/server` uses the reference as a locator when the App database differs. | **Move** the membership definition into App records in Stage 3. Preserve `apps/{appId}/users/{uid}` and the User-side locator `users/{uid}/apps/{appId}` in their existing databases. |
| `runtime/app/app-user/{composables,components,server}/`, `runtime/server/api/internal/app/membership.post.ts` | App membership read, access and trusted command behavior. | App administration, header badge, User detail/edit, App session, Workspace navbar and domain access checks. | **Move** behavior into App's established technical roles in Stage 3. Cut over component registration and explicit imports together. Preserve role, subscription, stamps and command authorization. |
| `runtime/workspace/{components,composables,models,server,tools,utils}/` | Optional Workspace presentation and selection currently in Core. Includes shared Team coordination, not a domain grant owner. | Blank reference, FireUX Project, Misebox Kitchen, Granite Property/Portfolio, Supplier and Business. | **Move** Workspace as a single explicitly selected integration in Stage 5. Keep domain authority, role records and commands in each domain. |
| `runtime/layouts/workspace.vue`, `runtime/middleware/fireux-workspace.global.ts`, `runtime/pages/workspace/index.vue`, `runtime/pages/dashboard/workspace.vue` | Workspace integration currently supplied by the Core layer. The middleware handles family entry and access routing. | Generated Core-only `/workspace`, Blank routes, domain workspace layout selection. | **Move** the native Workspace adapters to the optional package. Reconcile auth and route defaults to named route intent before removing Core's Workspace paths. |
| `runtime/app/composables/useAppManifest.ts`, `runtime/server/manifest.webmanifest.get.ts`, `runtime/plugins/pwa.client.ts` | App PWA and manifest have mixed ownership today. Client calls Workspace entry helpers. The server also validates Workspace start URL independently. | `FireuxApp.vue`, browser install behavior and tests covering Workspace origin and entry. | **Keep** App manifest/provider behavior. **Move** Workspace-specific input and validation to its owner through an explicit optional seam. Preserve default App manifests and safe start URLs, including configured origins. |
| `runtime/tools/catalogue.ts`, `runtime/workspace/tools/team/create-member.ts` | Core tool discovery imports a Workspace Team primitive. | Tool catalogue readers and Workspace team tools. | **Move** the Team primitive contribution with Workspace. Keep neutral tool definitions Core-owned. |
| `runtime/server/api/{chat,proxy,diagnostics}/`, `runtime/server/api/live.post.ts`, `runtime/pages/{chat.vue,assets.vue,diagnostics/}` | Mixed App features and neutral technical adapters. Optionality, exact dependencies and supported exports require further consumer checks. | App chat, live read transport, diagnostics, media and public access. | **Verify** in Stage 4 before relocating. No duplicate authority or safe deletion established in Stage 0. |

## Dependency edges that govern the cutover

- **Project is required in Core semantics today.** The Core model, reader,
  directory projection and provisioner use `project_id`. Core
  `config/app/validate.ts` and `app/composables/config/FireUXConfig.ts` require
  `projectId`; `app/server/initialization/initialize.ts` uses its equality with
  `ecosystemId` to decide whether to provision a Main App's Ecosystem. FireUX
  control-plane code filters Project-to-Ecosystem results by the stored value.
  Removing only the TypeScript field would leave failed reads or weaken that
  scope. Verify the legitimate Core bootstrap rule and split the Project
  management relationship in Stage 2 before changing canonical validation.
  Firebase provider `projectId` remains its own infrastructure identifier.
- **Membership has a record owner and a locator.** App membership role and
  subscription belong to the App-scoped record. User identity and User-side
  locator retain their existing lifecycles. App initialization and membership
  commands both participate in the same App membership lifecycle with
  different entry conditions. The audit did not establish competing record
  owners. Keep the guards and exact target paths during the Stage 3 move.
- **Workspace has 11 incoming literal import edges from nine Core runtime
  files outside its folder.** They are `app/composables/useAppManifest.ts`
  (two), `app/literature/types.ts`, `components/Dashboard/Overview/App.vue`,
  `components/layouts/default/Header.vue`, `composables/navigation/useDashboardNav.ts`,
  `middleware/fireux-workspace.global.ts` (two), `pages/dashboard/workspace.vue`,
  `pages/workspace/index.vue`, and `tools/catalogue.ts`. Registration, App config,
  CSS and native-layout use form additional edges. Reconcile those before
  moving the directory.
- **The likely broken consumers are concrete.** Extracting Workspace by
  moving the directory alone breaks the importers above, direct consumers in
  Kitchens, Properties, Projects, Suppliers, Businesses, and the Blank and
  FireUX Apps, plus generated `Workspace*` tags and `layout: 'workspace'`
  consumers. Moving App membership alone breaks the default header and
  Dashboard subscription controls, User membership panels, and domain access
  imports. These are anticipated move-only failures. Stage 0 introduced none.

## Reference Apps and gates

| Reference | Stage 0 baseline | What the reset must prove |
| --- | --- | --- |
| Core module and layer only | Temporary Nuxt host, generated without another FireUX package. `workspaces: []` still produced `/workspace`, the Workspace layout, three sampled Workspace components, four sampled Workspace composables and App membership imports. | Extend the existing temporary Nuxt prepare test technique for the strict Core-only gate. After Stage 5, require the absence of Workspace implementation registrations and routes. Prove the Core App, User and membership journeys independently at their actual authenticated boundary. |
| [Go QR](../../projects/fireux/go-qr/nuxt.config.ts) | Existing standalone App, with `workspaces: []`. Nuxt prepare still generated `/workspace`, its layout, sidebar and entry helper. It selects Go QR and standard App extensions. | Real no-Workspace consumer. Verify its public page, App manifest, sign-in and membership work after Workspace becomes optional. Use the module-only host for package independence. |
| [FireUX Blank](../../projects/fireux/fireux-blank/nuxt.config.ts) | Existing narrow Workspace App with `workspaces: ['blank']`. Nuxt prepare generated Blank Identity, Overview, Team, Test, Calendar and Create, plus the Workspace entrance and layout. | Verify direct Workspace opt-in, selection, scoped reads, access, navigation, and Team after extraction. Use the real FireUX Project App as a follow-up for Project-owned consumers. |

Prepared output proves Nuxt registration. It does not prove a rendered page,
actual authentication or a live data operation. The 86-test baseline covers
App context and initialization scope, App users, User session, Ecosystem reads,
layout registration and page transitions, Workspace entry and selection,
selected-record projection and Team member behavior. No data or deployment
operation was performed.

## First implementation slice after review

**Stage 1A · Remove industry-specific route knowledge from Core dev controls.**
The concrete starting point is `runtime/composables/diagnostics/useDiagnosticsUi.ts`.
Keep the existing visibility toggles in Core and let the actual note-owning
routes supply the eligibility signal. Compare the current Sidebar and public
shell behavior before editing. Verify the preserved controls on the affected
Portfolio and Supplier surfaces and their absence where no notes are rendered.
Re-run the bare Core prepare probe to confirm unchanged native contracts for
this slice. Review sitemap and manifest registration separately before removing
any apparent overlap between native discovery and explicit module handlers.

Then finish the Stage 1 Nuxt registration inventory and prove each canonical
root in Stage 2. App membership and optional Workspace extraction remain
separate Stage 3 and Stage 5 cutovers. Return to Kitchen after Core and the
Workspace seam pass their consumer checks.
