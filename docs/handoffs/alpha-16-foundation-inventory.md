# Alpha 16 — Foundation file inventory

Checkpoint `02752add05f2ff4887b097817b03119373cd5d0c`. See [the decision brief](alpha-16.md). Paths below are exact paths relative to the durable reset repository; line references apply to this checkpoint. Recommendations are discussion options. **KEEP** retains the current file and boundary. **SIMPLIFY** keeps the responsibility while reducing proven complexity. **RENAME** improves the visible owner after contracts are agreed. **DISCUSS** requires evidence, consumer review or a boundary decision before changing it.

## Discovery and classification

Every tracked non-asset file in Core, Blank, Misebox and Holzworm was accounted for. App metadata, lockfiles, TypeScript project references, the stylesheet entries, developer environment defaults and manifests participate in the active foundation. Browser Auth, development diagnostics and membership routes are marked by runtime mode or consumer. Generated `.nuxt` and existing build output were inspected as evidence of native route/component registration and deployment preset. They are outputs. Third-party packages were followed through manifest/import boundaries and representative installed Nuxt UI integration, not inventoried line by line. Local ignored environment files were outside the audit.

The Holzworm `public/` directory has 40 tracked binary assets. The landing and catalogue references, root favicon and public asset convention are runtime evidence. Other generic wordmark, PWA and brand variants have no proven direct runtime source consumer in this scope. **DISCUSS** any asset pruning with branding/hosting owners because public URLs may have external consumers. No live asset references were checked.

Legacy builders, other Apps, ecosystem wiring, old global TypeScript configurations, generated bundles, unrelated tests, and repository-wide lint/editor tools are outside the verified path. For Holzworm, the declared Firebase release path is included as an inactive or blocked delivery lane. Its test files and other ecosystem server code are outside the current operational foundation. The older platform and Docs imports were checked only to establish supported package export consumers.

## Core assembly and package surface

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `packages/core/fireux-core/package.json` (6–28) | **KEEP** | Nuxt resolves ./layer from the three manifests. h3 and Firebase Admin own dependencies, UI/Nuxt/Vue are peers. Existing project/Docs/Workspace source imports ./app, ./app/detail-card and ./server/app/read-app-document. Preserve those exports until a separate consumer check. |
| `packages/core/fireux-core/README.md` (25–55, 57–103) | **KEEP** | Maintainers use the native config and guard contract. This is documentation, with no runtime edge. Fix the missing separator between the first two example links only when docs next change. |
| `packages/core/fireux-core/src/nuxt.config.ts` (1–19) | **KEEP** | Nuxt merges the declared server Firebase and scope keys, public App ID and fail-closed defaults into all three Apps. This small config enables native inheritance and adds no custom loader. |

## Core · Firebase, App and Ecosystem read path

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `packages/core/fireux-core/src/server/utils/firebase-admin.ts` (5–32) | **KEEP** | getRuntimeFirebase is called by public self/peer/list/Ecosystem routes and requireFirebaseUser. It checks loopback demo or explicit local live mode, reuses a native named Admin App and selects an exact database. Keep every guard. Consider clearer 503 wording and ownership of the diagnostics header separately. |
| `packages/core/fireux-core/src/server/utils/firestore-document-id.ts` (1–10) | **KEEP** | isFirestoreDocumentId checks untrusted path segments for App detail, cursor, configured Ecosystem, membership ID and verified UID. Keep separate from the stricter assigned App ID rule. The trim-inside-predicate and raw cursor use need one explicit normalization contract if modified. |
| `packages/core/fireux-core/src/server/api/app.get.ts` (6–15) | **KEEP** | GET /api/app is the trusted self selector and no-store boundary for AppDetail and Holzworm. It uses the deployment App ID, adds kebab-case validation, and passes optional private scope to readAppDetail. No caller ID or database override. |
| `packages/core/fireux-core/src/server/api/apps/[id].get.ts` (5–11) | **KEEP** | Caller supplies a path peer ID. Server requires private scope and uses the same record reader. This is registered in all three Apps. No in-scope live UI currently links to it, but it was explicitly verified as a bounded route and has a different trust boundary from self. |
| `packages/core/fireux-core/src/server/api/apps/index.get.ts` (5–11) | **KEEP** | AppCollection consumes first and later pages. Handler keeps server-owned scope, caller limit/cursor and no-store. A narrower payload can retain this route if the external contract allows it. |
| `packages/core/fireux-core/src/server/api/ecosystem.get.ts` (5–10) | **KEEP** | Misebox's EcosystemDetail consumes it. It selects the configured scope and existing target, with no caller selector. Does not participate in self or peer record acquisition. |
| `packages/core/fireux-core/src/server/app/detail/read.ts` (6–23) | **RENAME** | readAppDetail serves both trusted self and caller-selected peer. A later name/path such as App read by ID would express the operation more clearly. Preserve active status, exact scope comparison, ID checks, observability and 404 behavior. |
| `packages/core/fireux-core/src/server/app/collection/read.ts` (6–35) | **SIMPLIFY** | readAppCollection queries bounded active records and orders by document ID. It sends the full Detail projection and can include self, while its UI renders four fields. Discuss discovery contract first. Preserve cursor order, limit rules, invalid-record policy and scope. |
| `packages/core/fireux-core/src/server/app/read-app-document.ts` (3–30, 32–69, 71–113) | **SIMPLIFY** | Shared by self/detail/collection and exported to platform server/utils/apps.ts. Separate stored constraints and explicit public field selection more visibly before changing shape. The current inferred Omit plus broad cast gives weaker compile-time guarantees than the explicit allowlist. Preserve role/membership validation and omission of context and actor IDs. |
| `packages/core/fireux-core/src/server/ecosystem/detail/read.ts` (6–39) | **KEEP** | readEcosystemDetail reads ecosystems/{id}, requires an active record and nonblank name, and selects public fields with safe URLs. A single operation and clear projection. Relocating it during a later small naming cleanup would be optional. |
| `packages/core/fireux-core/src/shared/app/app.model.ts` (3–41) | **KEEP** | Projection, card props and supported package type export rely on this App contract and role constants. The discriminated union expresses ecosystem-free standalone. Role is classification. Make a distinct response contract explicit only if the projection discussion proves a need. |
| `packages/core/fireux-core/src/shared/ecosystem/ecosystem.model.ts` (3–20) | **DISCUSS** | The Ecosystem reader consumes a Pick of six fields. project_id, context and the stamps stay outside its payload, and no current runtime imports ECOSYSTEM_STATUSES as a value. Confirm future stored-shape and Project ownership before pruning. Do not infer that projection coverage defines all stored data. |
| `packages/core/fireux-core/src/shared/fireux-stamps.ts` (2–17) | **KEEP** | Timestamp/stamp shapes serve App, Ecosystem, UserDocument and the AppUser timestamp. Keep stable stored field semantics and separate wire values from SDK/runtime assumptions. AppUser's duplicated pair can be considered later. |

## Core · Presentation and SSR

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `packages/core/fireux-core/src/app/components/App/Detail.vue` (1–25) | **DISCUSS** | Blank and Misebox pages use AppDetail slots to render the shared name and optional discovery. One native keyed fetch owns data, but the component mixes acquisition, card/status UX and development provenance capture. Holzworm demonstrates independent composition with the same route/key. Decide the owner boundary before touching slots or introducing a helper. |
| `packages/core/fireux-core/src/app/components/App/Detail/Card.vue` (1–21, 27–72) | **KEEP** | AppDetail uses the card and FireUX Docs source imports its supported export. It is presentational, takes data via props, and projects safe renderable links and image URLs. Separate displayable URL policy from the fetch path. There is no evidence for another generic card layer. |
| `packages/core/fireux-core/src/app/components/App/Collection.vue` (7–28, 34–65) | **SIMPLIFY** | Blank and Misebox use the bounded peer grid. First-page SSR data is native, appended pages need their own state, and two computed reads choose the visible page and filter self. The main waste is the broad query response and hidden self row, not computed length. Keep retry and in-flight protection. |
| `packages/core/fireux-core/src/app/components/Ecosystem/Detail.vue` (1–27) | **KEEP** | Misebox opts into the independent Ecosystem panel. The loading, unavailable and safe link presentation are specific to this view, with keyed SSR and dev provenance. No fetching relationship to AppDetail. |
| `packages/core/fireux-core/src/app/components/User/Detail.vue` (3–15, 21–26) | **KEEP** | MiseboxAuth passes a protected self projection and exact loading/missing/error state. No fetch or authority logic here. Treat display as private to the signed-in viewer despite the model comment. |
| `packages/core/fireux-core/src/app/components/AppUser/Detail.vue` (3–15, 19–23) | **KEEP** | MiseboxAuth projects role/subscription and supplies a join action slot. No App metadata or permission checks live here. |

## Core · Identity intersection only

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `packages/core/fireux-core/src/server/utils/require-firebase-user.ts` (6–34) | **KEEP** | All five protected handlers use it. Native Firebase verifies an ID token with revocation check against the configured Admin app. Adapter owns Bearer parsing, loopback mode matching, UID shape and error translation. Keep authorization in individual operations. |
| `packages/core/fireux-core/src/server/api/users/me.get.ts` (5–9) | **KEEP** | Misebox reads the User for the verified UID with private no-store. Handler plus reader separate transport and profile projection. Authentication stays separate from the App data pipeline. |
| `packages/core/fireux-core/src/server/api/users/me.post.ts` (5–16) | **SIMPLIFY** | Misebox explicit creation uses this private dev-only route. The provisioning target predicate also appears in the join handler. Later consider one named server policy for those two exact predicates while retaining independent commands and 503/401 ordering. |
| `packages/core/fireux-core/src/server/api/app-users/me.get.ts` (6–15) | **DISCUSS** | Misebox reads membership for verified UID and configured App ID. This route has a narrower boundary than join/count because it reads only the caller's membership and checks neither active App nor Ecosystem. Owner should confirm that intentional asymmetry when identity work starts. |
| `packages/core/fireux-core/src/server/api/app-users/me/join.post.ts` (6–22) | **SIMPLIFY** | Misebox join is emulator-only and requires trusted scope and UID. Shares the provisioning target predicate with User creation, but retains its own write eligibility and scope. |
| `packages/core/fireux-core/src/server/api/app-users/count.get.ts` (6–16) | **DISCUSS** | Nitro auto-registers this protected aggregate for all three Apps. No in-scope UI caller was found. Preserve stored-role authorization and scope. Confirm supported operator/API consumers before removing the route or changing registration. |
| `packages/core/fireux-core/src/server/user/detail/read.ts` (5–21) | **KEEP** | readUserDetail owns self projection and missing profile handling for GET /api/users/me. It accepts unstamped records to preserve historic profiles, omits consent and stamps, and validates avatar URL. No AppID coupling. |
| `packages/core/fireux-core/src/server/user/create/provision.ts` (6–25, 27–50) | **KEEP** | provisionUser validates consent, input and existing handles. One transaction creates User, handle reservation and private consent. Existing Users protect handles even if unstamped. Keep real domain atomicity, and avoid bypassing the operation through a generic write layer. |
| `packages/core/fireux-core/src/server/app-user/detail/read.ts` (5–23) | **DISCUSS** | readAppUserDetail is used by the self handler. projectAppUser is also imported by the join command for idempotent existing membership results. Shared validation works; a projection under a directory named detail creates an awkward cross-operation dependency. Change placement only with identity ownership work. |
| `packages/core/fireux-core/src/server/app-user/join/create.ts` (6–32) | **KEEP** | joinApp owns an atomic membership creation and existing membership preservation. Requires active scoped App and a User for first join; first role/subscription are user/free. Keep domain access out of it. |
| `packages/core/fireux-core/src/server/app-user/admin/count.ts` (4–27) | **KEEP** | readAppMembershipCount keeps active App and stored admin/dev role checks together within the aggregate's read-only transaction. Role is independent of subscription. Retain the guard even if the route's usage is reconsidered. |
| `packages/core/fireux-core/src/shared/user/user.model.ts` (3–13) | **DISCUSS** | User describes the projected identity used by the reader, provisioning return and card. UserDocument has no current in-scope import. The comment public identity projection is misleading for a private self route. Check compatibility before dropping the type. |
| `packages/core/fireux-core/src/shared/user/user-consent.ts` (1–4) | **KEEP** | One consent version contract exported to Misebox and checked in provisioning. Removing or duplicating it could let displayed versions drift from recorded evidence. |
| `packages/core/fireux-core/src/shared/app-user/app-user.model.ts` (1–23) | **KEEP** | Defines stored roles, subscriptions and stamps used by join, projection and card props. Do not conflate with App role. Its stamp pair is structurally similar to shared stamps, but cleanup can wait until the stored contract is reviewed. |

## Blank · Independent minimal reference

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `projects/fireux/fireux-blank/nuxt.config.ts` (1–11) | **KEEP** | Native Core layer, Nuxt UI, CSS, fireux-blank selector and private fireux scope. Same assembly pattern as other Apps without their product-specific surfaces. |
| `projects/fireux/fireux-blank/env.defaults` (1–2) | **KEEP** | App command dotenv flags load expected demo project, overridden by local environment. Does not select the actual target. |
| `projects/fireux/fireux-blank/package.json` (5–24) | **KEEP** | Standard scripts, independent lock/toolchain, local Core link and UI/CSS dependencies. Firebase Admin and h3 are declared in both App and Core. Treat deletion as a clean-install and packaging test, not a proven redundant dependency. |
| `projects/fireux/fireux-blank/pnpm-workspace.yaml` (1–14) | **KEEP** | Blank's independent pinned lifecycle and Nuxt release-age rules. Alpha 15 proved standard commands with this file. Removing the reviewed policy regresses frozen install. |
| `projects/fireux/fireux-blank/pnpm-lock.yaml` (1–34) | **KEEP** | Independent reproducible resolution includes Core link and native build dependencies. The root lock intentionally excludes Blank. |
| `projects/fireux/fireux-blank/tsconfig.json` (1–9) | **KEEP** | Native Nuxt generated app/server/shared/node project references. No custom common framework. |
| `projects/fireux/fireux-blank/app/app.vue` (1–5) | **KEEP** | Native UApp and NuxtPage root. Small explicit shell belongs to the App. |
| `projects/fireux/fireux-blank/app/assets/css/main.css` (1–2) | **KEEP** | Tailwind and Nuxt UI CSS entry selected by nuxt.config. Necessary for current component styles without duplicating styling policy. |
| `projects/fireux/fireux-blank/app/pages/index.vue` (1–12) | **KEEP** | Composes AppDetail heading and optional AppCollection from the same self result. Useful as a reference for shared detail presentation. No identity or Ecosystem Detail UI. |

## Misebox · Native composition and client Auth

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `projects/misebox/misebox-app/nuxt.config.ts` (1–17) | **KEEP** | App ID, private misebox deployment scope, layer, module and CSS plus explicit public Firebase browser Auth schema. The schema and Admin keys are intentionally separate. |
| `projects/misebox/misebox-app/env.defaults` (1–7) | **KEEP** | Expected demo project and public Web SDK registration. Actual emulator URLs and Admin database/project remain runtime inputs. Optional local overrides retain precedence. |
| `projects/misebox/misebox-app/package.json` (5–19) | **KEEP** | Workspace link and browser Firebase SDK in addition to the Nuxt/UI stack. Firebase Admin and h3 repeat Core dependencies. No basis for dropping until clean frozen builds and output tracing prove it. |
| `projects/misebox/misebox-app/tsconfig.json` (1–9) | **KEEP** | Generated native Nuxt projects. Keep App-specific setup explicit. |
| `projects/misebox/misebox-app/app/app.vue` (1–5) | **KEEP** | Native UApp and NuxtPage shell. |
| `projects/misebox/misebox-app/app/assets/css/main.css` (1–2) | **KEEP** | Native stylesheet includes Tailwind and the Nuxt UI theme. |
| `projects/misebox/misebox-app/app/pages/index.vue` (3–17, 21–26) | **KEEP** | Composes public AppDetail, scoped Ecosystem and peer discovery plus the separate client Auth proof. Dev inspector is lazy and ClientOnly. Preserve App-owned composition. |
| `projects/misebox/misebox-app/app/components/MiseboxAuth.client.vue` (27–59, 64–175, 177–208, 210–295) | **SIMPLIFY** | Only browser Auth consumer. Native SDK lifecycle, two protected reads, development provisioning, join, status and form handlers are in one component. Correct ref boolean usage at line 212 as a bounded defect before broader identity redesign. Preserve abort/identity handoff safeguards and server checks. Do not lift this proof into the public App path. |
| `projects/misebox/misebox-app/app/dev/AppJsonInspection.vue` (2–34, 37–58) | **SIMPLIFY** | Only App-level consumer of the three keyed snapshots and source-header states. No additional reads. Its three string keys, JSON parsing and binding-equality logic are an actual coupling. It reports the first collection payload, not appended pages. Keep useful provenance and user feedback, and clarify that it shows acquisition snapshots. |

## Holzworm · Native storefront

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `projects/fireux/holzworm/README.md` (1–30) | **KEEP** | Owns local binding caveats and legacy product literature retained by Alpha 15. It makes production and enquiry limitations explicit. |
| `projects/fireux/holzworm/docs/brand-assets.md` (1–11, product assets table) | **KEEP** | App-owned image provenance and optimization record. It consumes no runtime code. The orphaned in-code asset record can be compared with this documentation separately. |
| `projects/fireux/holzworm/nuxt.config.ts` (1–11) | **KEEP** | Explicit Core and UI, holzworm App ID and private fireux scope. Named database belongs to deployed environment. No launcher or ecosystem builder inference. |
| `projects/fireux/holzworm/env.defaults` (1–2) | **KEEP** | Expected disposable demo project; preview scripts load it. No default Admin route selection. |
| `projects/fireux/holzworm/package.json` (5–29) | **DISCUSS** | Dev/build/preview and declared dependencies are used locally. generate and the Firebase release commands are a separate unverified/broken delivery boundary. Check rimraf usage and adapter requirements after choosing that boundary. Do not remove a released contract based on a local build. |
| `projects/fireux/holzworm/tsconfig.json` (1–9) | **KEEP** | Generated Nuxt reference projects on workspace versions. |
| `projects/fireux/holzworm/firebase.json` (2–15) | **DISCUSS** | Declared Hosting site, Gen 2 function name/region and output paths are release evidence only. Local preview emits node-server. Preserve target and guards pending a dedicated release decision. |
| `projects/fireux/holzworm/server/.gitkeep` (empty file) | **DISCUSS** | Retains an otherwise empty App server directory. No current runtime effect. Legacy CLI expects a distinct untracked runtime-env JSON. Resolve that artifact contract before cleanup. |
| `projects/fireux/holzworm/app/app.config.ts` (1–10) | **KEEP** | Native app config owns orange/stone presentation. This public theme config is separate from deployment inputs or Firestore metadata. |
| `projects/fireux/holzworm/app/app.vue` (1–7) | **KEEP** | Native UApp/NuxtLayout/NuxtPage composition activates the selected landing layout. Local shell differs intentionally from the two references. |
| `projects/fireux/holzworm/app/assets/css/main.css` (1–2) | **KEEP** | App stylesheet entry selects Tailwind and Nuxt UI and supports existing style tokens. |
| `projects/fireux/holzworm/app/error.vue` (1–19) | **KEEP** | Native Nuxt error entry uses UError and a controlled German message. Tested unknown-page 404 and home action. A missing App record is handled separately as a usable page. |
| `projects/fireux/holzworm/app/layouts/landing.vue` (1–28, 29–60) | **KEEP** | One keyed SSR self-read resolves the visible brand link and document title. It gracefully keeps local product content when App is unavailable. A second consumer for App acquisition exists across Apps, but no duplicate request exists on a page. |
| `projects/fireux/holzworm/app/pages/index.vue` (3–173, 177–206, 208–end) | **KEEP** | Native landing selection and App-owned catalogue, filters, product details, hash navigation, and enquiry copy. Local derived state changes with one selection. This is one cohesive presentation. Long CSS alone is no case for a Core abstraction. |
| `projects/fireux/holzworm/app/content/catalogue.ts` (1–62, 62–370, 371–end) | **SIMPLIFY** | Index consumes categories and 20 product concepts. holzwormAssetRecord has no caller and overlaps the asset notes. Leave catalogue and editor copy local. Discuss removing only the unused record after confirming any documented tooling dependency. |

## Shared configuration and directly selected tooling

| Source and lines | Recommendation | Owner, consumers and change consequence |
| --- | --- | --- |
| `.npmrc` (1–6) | **KEEP** | Root workspace policy sets peer, hoist, engine and package manager behavior. Keep existing resolution behavior through this audit. |
| `package.json` (7–22, 25–28, 34–45) | **KEEP** | Root command routing selects the three App manifests and Launcher/stop. The broad workspace commands also reach historical Apps, outside the verified baseline. Do not replace with a configuration builder. |
| `pnpm-workspace.yaml` (1–15, 17–50) | **KEEP** | Root membership, build allowlist and overrides for Core/Misebox/Holzworm. Explicitly excludes independent Blank. Many overrides have wider workspace consumers outside this audit. |
| `pnpm-lock.yaml` (118, 1210, 1826) | **KEEP** | Pinned importer roots for Core, Holzworm and Misebox. Keep lock and independent Blank lock responsibilities. No version-alignment finding from the read path. |
| `.gitignore` (46–50) | **KEEP** | Local dotenv secrets are ignored. Tracked env.defaults is intentionally public-safe. Never publish local environment contents to explain configuration. |
| `tools/fireux-launcher/FireUX Launcher.command` (1–5) | **KEEP** | Optional user launcher resolves repository directory and delegates to root pnpm. No impact on Nuxt's server pipeline. |
| `tools/fireux-launcher/apps.mjs` (5–55) | **RENAME** | getAppRegistryEntries derives group and a role from folders/command keys. This is a launch grouping heuristic, not Firestore authority. Rename those concepts only as a tooling cleanup with existing list/sort behavior and callers preserved. |
| `tools/fireux-launcher/launcher.mjs` (46–62, 349–376, 414–423, 458–481) | **KEEP** | CLI groups App entries, starts the exact pnpm dev script with process environment and opens the browser. It treats any listener on the fixed port as already running. Keep outside foundation ownership. Process ownership can be a separate tooling issue. |
| `tools/fireux-launcher/stop.mjs` (11–16, 20–51) | **DISCUSS** | Root kill scripts terminate listeners by port. No role/config involvement. Its assumption that the listening process belongs to the App deserves a separate lifecycle safety decision. |
| `tools/firebase-release/cli.mjs` (6–18, 56–79, 202–243) | **DISCUSS** | Holzworm explicitly references this dormant delivery CLI. Import-only verification fails on the missing retired rules composer. Build path also names retired Core build/config.mjs. This is a release blocker separate from working native SSR. |
| `tools/firebase-release/output.mjs` (8–18, 26–86, 134–175) | **DISCUSS** | Transitive release dependency. Imports a removed Core brand asset validator and expects Firebase Nitro preset, function, region and environment bindings. Do not weaken those checks to make Node preview appear deployable. |
| `packages/ecosystem/fireux-fireux/src/config/firebase/firestore.template.rules` (file named by release manifest commands) | **KEEP** | Explicit legacy preflight/deploy input. Outside native startup. No Rules or deployed policy audited or modified. Preserve until a separate release task defines which real target and policy it needs. |
| `README.md` (13–20, App table) | **KEEP** | Repository entrypoint identifies native references and distinguishes historical packages. Guidance only. |
| `docs/concepts/fireux.md` (22–78) | **KEEP** | Defines established identity, ownership, scope and acquisition canon. Audited against code; this task does not change it. |
| `docs/handoffs/2026-11-26-native-core-checkpoint.md` (168–end) | **KEEP** | Owns prior observed install/build/SSR and Holzworm verification evidence. Source audit did not rerun it. |
