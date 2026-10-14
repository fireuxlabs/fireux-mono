# Identity and Workspace reconciliation

Updated: 2026-10-04
Role: roadmap, not implementation authority
Baseline: 997624d71

## Accepted sequence

Complete and accept each stage before broadening into the next:

1. App, User and AppUser: finish the browser journeys and resolve the remaining
   foundation issues within these owners.
2. Ecosystem: verify its identity, App relationship and management experience.
3. Project: prove its Workspace and domain ownership against that foundation.
4. Kitchen: prove the same shared Workspace mechanics with Kitchen-owned rules.
5. Capabilities: review each page and its tools, deciding sign-in requirements
   at the point of use case by case.
6. Release preparation: replace and verify development-open Firestore Rules
   and close the remaining release checks.

Firestore Rules remain open under the accepted development policy while these
stages are being built and accepted. Rule hardening does not block the earlier
development stages. Existing application command permissions remain in force.
Completing the functional sequence starts release preparation; it does not
itself establish release readiness.

## Immediate scope: App, User and AppUser

Product decision: the current data is authored example data. Compatibility with
it is not a requirement for foundation design. Establish the intended contract
first, adapt or explicitly disable incompatible consumers, and migrate data
separately. Do not add old-name aliases or runtime legacy readers to preserve an
obsolete design. This does not authorize accidental data changes during tests.

User owns shared person identity. AppUser owns the relationship to one App,
including membership, subscription and App access. Keep their CRUD readers
separate and compose them in the session with independent pending, missing
and error states. A missing optional profile must not block ordinary Workspace
entry or selection.

Before moving on, finish browser acceptance for saves, uploads, account
switching, membership removal and the intended create/delete journeys. Verify
the App, User and AppUser read/session contracts, including missing membership,
read failure and collection bounds. Do not call the family aligned on compilation
alone. The recorded checks below establish the completed source repairs and
their remaining verification limits.

Source entrypoints:

- `packages/core/fireux-core/src/runtime/user/composables/useUserRead.ts`
- `packages/core/fireux-core/src/runtime/user/composables/useUserCollection.ts`
- `packages/core/fireux-core/src/runtime/user/composables/session/useUserSession.ts`
- `packages/core/fireux-core/src/runtime/app/composables/membership/useAppUserMembership.ts`
- `packages/core/fireux-core/src/runtime/app/composables/membership/useAppUserRead.ts`
- `packages/core/fireux-core/src/runtime/app/composables/membership/useAppUsers.ts`
- `packages/core/fireux-core/src/runtime/app/composables/membership/useAppUserAccess.ts`


## Optional cross-ecosystem identity

### Now

The local User contract remains ecosystem-owned. FireUX and the Main Misebox App
have an optional account-connection service, consent/ownership UX and custom-auth
handoff in source. The first integration uses existing Firebase Auth accounts;
no external OIDC provider is configured. Local App memberships, profiles and
workspace permissions remain their existing owners. The authoritative source,
checks and activation boundary are mapped in `docs/ai/account-connections-context.md`.

### Next

Approve and provision the separate private `identity-connections` database, deploy
its deny-all browser policy, configure the private peer secret and activate the
participating Apps. Run signed-in acceptance with the human's two existing accounts,
including reconnect, expired/replayed codes, conflicting accounts and normal local
sign-in. Source checks do not establish a live connection or migration.

### Later

Add Granite as a materially different approved participant after the first real
journey passes. Consider a standard external OIDC identity provider if provider
management or additional clients justify it. Firebase Auth is not automatically a
cross-project identity issuer. A global sign-in does not create an EcosystemUser
permission layer; add such a role only if an independent product need proves it.

## Recorded acceptance — 2026-09-12

The audit at `680d1a0cd` reproduced three failures against source
`2ad79ea99`. This repair closes those failures and the read/presentation gaps.
Firestore Rules retain the accepted development policy; no live records,
Storage objects or account permissions were changed for verification.

### Repairs

- **Join requests:** review reads every required snapshot before transaction
  writes. Approval and rejection retain their existing atomic write set and
  authority checks.
- **Account switches:** provisioning checks its captured UID/generation before
  clearing consent or continuing. Bootstrap keeps the intended Auth user and
  stops subsequent stages when that account is no longer current. Membership
  commands retain the actor they validated.
- **App media:** uploads use unique immutable revision paths before attaching
  URLs. Failed, uncertain and concurrent attachments cannot revoke a previously
  saved URL. Superseded and unattached revisions remain in Storage deliberately;
  this command performs no cleanup. Production disables the development-only
  Sync action with an explanation.
- **Single membership:** another person's membership uses `useAppUserRead`;
  the current person's membership reuses the session. Neither subscribes to the
  administrative lists for a single relationship.
- **Directories:** Core `firestoreCollectionPage` supplies one bounded live
  window (25 records plus one lookahead by default). User and AppUser readers
  expand it only on Load more. Admin roles and join requests have independent
  pages; identity hydration covers loaded ids only. AppUser consumers expose
  pagination rather than silently treating a first page as complete. Native
  bindings replace stale account data/errors when the account changes, including
  on the first page.
- **Search:** App and User filters explicitly say they apply to loaded records
  until the last page is loaded. User filtering survives loading another page.
- **Create:** the unsupported App draft/review form and placement policy are
  retired. Core `/apps/create` states that creation is unavailable; generic
  pricing no longer advertises it. FireUX's landing opens its existing Project
  Apps capability, which saves an inactive App and preview. It does not provision
  hosting. Configured-App initialization remains separate.
- **Presentation:** an absent App tagline is omitted instead of displaying
  “missing”.

### Verification and remaining limits

The combined focused suite passes **96 tests**, including transaction ordering,
account switch races, media attachment failures/concurrency, live pagination
insertions/removals, and first-page account rebinding. Core package TypeScript
passes. The affected Misebox App check has **331 existing diagnostics**, with
none in changed files. FireUX has **50 existing diagnostics**, also outside
changed files. There is no claim of a clean whole-App typecheck.

Browser verification on localhost:3001: Users load 25 then all 29; App members
load 25 then all 27; admin roles remain visible independently; App directory
returns six Apps; own membership presentation remains Developer/Business and another member's
exact read shows Free with its management doorway;
`/apps/create` shows the explicit unavailable state and returns to Explore Apps.
The old directory tab briefly showed a read error during server hot rebuild;
fresh navigation settled successfully. No live publication, membership or
Storage mutations were used as tests. Guest/account switching, real saves and
uploads, and mobile acceptance remain unproven in the browser.

App/User primitive Delete still has no maintained lifecycle UI. That is an
unsupported product journey, not a reason to add an unreviewed cascade. Hosting
provisioning and Storage retention cleanup also remain separate work. These
limits must remain explicit as the sequence continues to Ecosystem, Project,
Kitchen and capabilities.

### Shared foundation type repairs — 2026-09-12

The baseline Misebox/FireUX checks reported 331/50 diagnostics. This bounded
repair reduces them to **302/21**, with no introduced diagnostics when comparing
canonical source paths, diagnostic codes and messages. Deduplicating location,
code and message across both Apps reduces the combined count from **337 to 306**;
17 remaining diagnostics appear in both. Counts describe diagnostics, not
independent root causes or proof of runtime correctness.

Completed at the shared owners:

- Collection search now distinguishes its default variants from an explicitly
  supplied nonempty custom set; initialization and toggling stay within that
  set. Editable-list initials handle empty and single-word names safely.
- Public image address validation proves IPv4/IPv6 parts before indexed reads.
  Valid address-range decisions, DNS behavior and deadlines are unchanged;
  malformed address records fail closed.
- SEO path handling and FireUX App directory/Admin initialization now narrow
  array entries before using them, without broad assertions.
- The retired simulation database option and Kitchen read branch are removed.
  Kitchen still uses the live Core read contract, same-id Place hydration and
  scoped operator collection overrides. Demo data and the separate Test
  capability are outside that reader.
- Chef, Customer, Driver, Professional and Agent profile creators use the
  supported User bootstrap API and retain one authenticated actor through the
  composed operation. Bootstrap failure or account changes stop the workflow.
  These five call sites close one stale User boundary; other Jobs and Kitchen
  feature errors remain outside this pass.
- Misebox's App TypeScript configuration now excludes the standalone Nuxt
  imports bridge, matching the inspected FireUX/Werkbox configurations.

Verification: Core package TypeScript passes; the two generated Nuxt App checks
produce the reduced counts above. Search variant compile-time checks run with
strict indexed access. Focused image, search, profile, live read/session,
Workspace readiness and platform App tests pass. The resolved Misebox App
configuration contains generated imports and no standalone shim.

Browser verification: Users loads its first 25 records; App directory loads six
Apps and filtering for Friiites shows one result. The Friiites detail URL loads
its identity and missing-address state. Automated card click and keyboard
activation timed out, so card activation is not newly proven by this pass.
No live writes or Storage cleanup were used for testing.

Nine remaining distinct Core diagnostics are in chat, search-demand, dev model
inspection and tool-provider code. The original Kitchen batch contributed 169
and Jobs 46 diagnostics across their features and support code; continue their
remaining work in the owning Kitchen/capability passes. Finance, Companies,
Suppliers and other domains keep their own passes. Project's connected-App UI
and ecosystem composition belong to their planned passes. Group repairs by root
cause and verify both generated Apps after each bounded batch; do not silence
diagnostics with broad casts. Both generated checks also retain a pre-existing
vue-router Volar plugin export warning, a separate toolchain concern.

App media retention is a separate lifecycle decision, not a type failure.
Uploads preserve previous URLs. A later cleanup policy must identify obsolete,
unreferenced versions and account for URLs still in use before any deletion.

## Foundation simplification — 2026-09-11

The second source audit found real mismatches despite matching CRUD filenames:
User creation/editing accepted different name lengths; profile patch callers
and the endpoint disagreed about fields; avatar editing bypassed provisioning's
validation; App media had two writers and a retired editor reference; User
session instantiated private account reads, commands and presentation for all
consumers and exposed inconsistent aggregate loading/error states.

Implemented within those owners:

- User session now composes live User/AppUser readers, policy and access state.
  Private account reads and card formatting are explicit in their consuming
  screens; mutations remain named commands. App and User session purposes stay
  separate. Aggregate pending/error/outcome agree and preserve independent reads.
- User name validation is shared at 1–120 characters. Name/bio patches support
  single or grouped edits. One authenticated avatar command validates image
  bytes, uploads, attaches the URL to an existing User and cleans exact unused
  uploads. Uncertain save outcomes preserve any file selected by the User;
  cleanup failure is logged and is not an automatic orphan sweep.
- Single-image and bulk App media sync use the existing trusted server command.
  Missing local artwork cannot fall back to the parent App's brand. The editor
  reports recorded URLs, which do not prove source-file freshness.

The primitive CRUD APIs remain distinct from these multi-step workflows. Their
matching shape does not prove finished create/delete UX or lifecycle cleanup.
Outstanding READ work includes bounding the User/AppUser collections. The custom live server
transport still serves authorized projections and still needs the separate
simplification described below.

Verification: 34 focused tests pass, including Auth/membership state changes,
reader contracts, field validation, media scope and failed/uncertain avatar
attachment. Core's standalone typecheck passes. The generated Misebox App check
also inspects Vue consumers; it found public-User email and unchecked string
indexing errors in this slice, which were corrected. Whole-App compilation
now reports no diagnostics in changed/new files. It remains red outside this
slice (349 TypeScript diagnostic lines), including the Vue Router Volar export,
SEO/Pricing, AppUser command typing and Product/Misebox solution types. The
initial browser connection blocker was subsequently resolved; current browser
evidence is recorded in the foundation closure below. No live records or
Storage objects were changed for verification. The source tests are not a
substitute for interactive save, upload and account-switch acceptance.

The follow-on shared read repair now hides retained native document/collection
data when idle, pending or failed, with coherent error/pending state. It lives
in `useFirestoreRead`, so ordinary consumers inherit the correction. User
directory composition no longer inserts the current person after collection
failure. It changes no stored schema and needs no data migration.
Verification for this follow-on: 32 read/session/collection checks pass, Core
typecheck passes, and the generated App check has no diagnostics in changed
or new files. The same 349 whole-App diagnostics remain outside this slice.

### Foundation closure — 2026-09-12

The queue audit found accumulated changes across transport, reads, sessions,
commands, assets and UX, rather than one conceptual change. Three remaining
composition seams were repaired in their existing owners:

- App About/Social sections call `useAppSettings`; the parent no longer relays
  individual field callbacks while administering membership.
- User editing takes only a User and its read outcome. The profile route owns
  subscription, AppUser and private-account composition. The unused User-owned
  App membership display was removed.
- Dashboard reads User, App, membership and account independently, so one read
  failure cannot misclassify the others. A focused test exercises that isolation.

Browser navigation exposed a separate shared-layout bug: global `out-in` page
transitions cannot animate Dashboard panels with fragment roots. The Dashboard
layout now disables its page transition once, rather than wrapping every page.
Dashboard → profile → settings → App detail → management → directory works by
following links. User display-name and App name drafts cancel without changing
the displayed saved values; App address edit/cancel and all 27 membership rows
also render. No live writes were used to verify these journeys.

The final type review also corrected existing foundation errors: AppUser's
literal relationship pairs, missing public-profile snapshot pairs, App pricing
JSON-LD, avatar initials and single-query results. The live adapter now declares
its actual generic JSON-call contract instead of pretending to implement the
whole Nuxt `$fetch` API. Three Jobs/demo helpers adopt that type; their calling
pages need no changes. Developer App media uses the owning read outcome directly.

Final verification: 44 foundation and 17 transport checks pass, as does Core
typecheck. The generated Misebox App check has no diagnostics in changed files
or in Core's App/User/shared Firestore directories. Its remaining 338 diagnostics
are outside those paths; comparison with the initial check finds no new errors.
Browser verification also covers the 29-person directory, search → public
profile → App membership management, and Developer → App media. Saves, uploads,
guest/account-switch acceptance and live membership revocation were not exercised
in the browser. This proves the scoped repairs, not finished Create/Delete UX,
bounded large collections, domain relationship extraction or every consumer.
The remaining ownership work below remains explicit; do not call all Core
consumers aligned.

### Intended Core boundary

Review real consumers to discover repeated behaviour, then give that behaviour
one Core contract. Core must not name or branch on the products consuming it.
Keep genuine domain differences with their domain owners; migrate consumers
instead of adding compatibility paths. This applies the existing source-first
family discipline to the current foundation reconciliation.

| Core responsibility | Intended contract | Remaining structural issue |
| --- | --- | --- |
| Identity | User is the person; App is the product; AppUser is membership; Ecosystem groups Apps | Runtime association ownership is cut over to six domain access records; example-data migration remains |
| Reads | One native live document/query mechanism; authorized server projections only where required | Exact-id subscription composition and server projection transport still have separate lifecycle code; large directories need bounded live queries |
| Writes | Record primitives below named domain commands; commands own authority and cross-record invariants | Primitive CRUD facades are not proof of complete creation/removal journeys |
| Assets | App owns brand; User owns avatar; one writer per responsibility | Local/Storage freshness is not established by the presence of a URL |
| UI mechanics | Shared state, navigation and presentation contracts; products compose them | Project domain implementation still lives inside Core and needs an ownership cutover |

The AppUser association cutover is implemented. Project implementation still
lives in Core and remains a separate ownership move; do not describe this as
complete Core extraction.

### Domain access cutover — 2026-09-12

The foundation repair batch was committed and pushed as `e7c391de2` before this
change. AppUser now stores role, subscription and audit stamps only.
Kitchen, Project, Property, Portfolio, Supplier and Blank each own one explicit
App-scoped access record. Core provides `useMembershipAccess`, strict parsing,
next-record validation and exact membership-lifetime matching. Domain commands
own paths, grants and capacity. Team remains a roster, not an access index.

Readers, authority checks and onboarding writers changed together. Unused
primary-selection fields and commands are removed; Core `useWorkspace` remains
the App/family-local selection owner. Core no longer scans retired App-nested
Entity grants when removing membership. A removed/recreated AppUser cannot
reactivate the previous membership's access record. Project's UI now counts
Project ids, matching its command; it no longer totals other domains.

Shared live read state hides old document/query values synchronously when scope
changes, before VueFire's asynchronous rebind. Project and Kitchen use the
existing exact-document loader for their bounded access lists; a single
Firestore `in` query no longer limits them to 30 ids. The tests exercise 35
Projects and 50 Kitchens plus their Places, live updates, revocation, errors,
listener disposal, atomic grants, membership removal/rejoin and storage limits.

No live data was migrated. Existing AppUser arrays and primary fields remain
stored migration sources and are ignored by runtime code. Until the separate
migration, those example Workspace associations can be absent. The exact
migration requirements live in `docs/ai/firestore-mutations-context.md`.
No Rules were changed or deployed. The accepted development-open policy remains;
retained restricted fragments still contain obsolete AppUser schema and are not
release-ready.

Integrated verification: 131 focused tests pass and Core standalone TypeScript
passes. The generated Misebox App check has 332 diagnostic lines versus 338 at
the checkpoint, with no new diagnostic signatures and none in changed files.
The generated FireUX App check has 50 diagnostic lines, none in changed files;
a clean full-App typecheck is not established. The four smaller domains passed
focused imported-graph checks; full Properties/Suppliers checks retain unrelated
errors. Browser control was unavailable because the Mac was locked and the
existing browser tab timed out; no live writes were used as verification.

This is still a broad ownership cutover, not evidence that the previous design
was already modular. Its runtime/source changes are approximately size-neutral;
most added lines are behavioral tests. Future shared read/lifetime changes now
have a Core owner, while domain policies stay outside that owner.

### Retire AppUser onboarding status — 2026-09-12

AppUser no longer stores, initializes, validates or changes an onboarding
completion flag. Its setter command and membership badges are removed. A User
can arrive in a Workspace and begin shaping an Entity; identity/membership,
capacity and domain-specific requirements still apply when executing commands.
Historical stored status fields are ignored and need no runtime compatibility
path. Their physical removal can accompany the separate sample-data cleanup.

Interlaken Essen’s profile/locality preferences remain App-owned information,
edited explicitly from `/mis` and prefilled from its live account read. The
automatic homepage prompt, Skip command, duplicate status subscription and
developer reset endpoint are removed. Profile saves preserve delivery-address
data and do not write AppUser; managed Store records still establish seller
availability. An unsaved profile draft belongs to the account that opened it
and cannot be submitted after an account switch.

Verification: 32 focused membership/read/profile tests pass, Core TypeScript
passes, and Interlaken Essen's Nuxt prepare plus the three changed Vue SFC
compilations pass. The Marketplace reader now accepts Core's existing callable
live-fetch contract, matching the Job clients; command transport is unchanged.
Generated Interlaken checks still report 147 App and 73 server diagnostics,
all outside changed files. The Main Misebox check reported 332 diagnostics,
unchanged from its prior benchmark, before that read-type correction. Browser
interaction was not verified in this pass. No live data, Rules or deployments
were changed.

## Return to Workspaces

After foundation acceptance and the Ecosystem pass, proceed through Project
then Kitchen in the accepted sequence above. Compare:

1. Guest arrival, empty state and active Entity selection.
2. User/AppUser identity and membership versus Entity-specific access.
3. Shared collection/single read states and subscription ownership.
4. Capability composition, then Project Apps and Kitchen Menus.

Keep domain authorization and data ownership explicit. Workspace is a surface,
not another identity record. Remote-source observation remains a blocker to
claiming universal live behavior; it is not solved by folder cleanup or the
connection lifecycle repair below.

The transport pass fixes late subscriptions after disconnect, resets cancelled
retry timers and disposes hot-module consumers. Browser testing isolated
cross-tab HTTP connection contention: releasing one tab immediately unblocked
the other. Core now multiplexes distinct live server projections over one
connection per tab. The 29-user directory, search, profile, back navigation and
reload were verified with two tabs active. Focused transport tests cover
event delivery, twenty distinct readers sharing a connection, disposal, routing
restrictions and authorization separation. Identity record mutation/live-update
acceptance remains separate from this navigation repair.
Core's standalone typecheck passes. A direct generated FireUX App check remains
blocked by the Vue Router Volar export and errors outside this transport slice
(including SEO, Pricing and Product types); it is not a clean whole-App check.

The App READ simplification removes Shell's live status endpoint and eager setup
controller. Shell uses `useAppRead.exists`; setup checks start only when setup is
displayed. Existing malformed documents do not trigger creation, and failed App
reads hide retained data. Bootstrap retains its one-shot policy check.

Core's browser projection reader now receives its initial and updated values
from the live connection, then recomposes joined and paged results from those
values without duplicate GETs. Tests cover first-frame cancellation, denial,
cursor replacement and order-capability isolation. The shared server transport
still exists: public admin profiles, protected orders and cross-database App
directories have real projection boundaries. Its subscription-set reconnection
and server dependency evaluation remain further simplification work; App
initialization no longer uses it.

The initial App stream was verified against the Misebox dev server and delivered
all six directory records without a separate GET. The focused App, transport and
platform checks pass, as does Core's standalone typecheck. The browser journey
for this pass remains unverified: the embedded browser reported suspended
network I/O while this task was not visible.

See `docs/concepts/family-workspace-entity.md` and
`docs/concepts/core-models.md` for source maps.

## Deferred: optional profiles and commercial roles

Chef, Driver, Agent and Professional profile expansion/reconciliation is
postponed until a real capability needs it. Preserve existing used behavior;
do not delete records or disable working flows based on presumed inactivity.
When resumed, inventory real readers, writers and storage before migration.

Customer describes a person ordering or buying. Seller describes selling;
Store owner is a Store relationship/permission. These are product vocabulary,
not authorization to add Customer/Seller entities, duplicate User identities,
or compulsory profiles. Define additional persisted fields only with a concrete
workflow. One User may participate in multiple roles.

## Review discipline

Keep this as the single roadmap for this effort. Update it when scope or
acceptance decisions change. Move proved architecture into existing concept
maps; do not copy temporary status into living AI context. Saves are checkpoints,
not claims that every related entity or production path has been verified.

## Inspected READ boundary

Project `useProjectCollection` and Kitchen `useKitchenWorkspaceKitchens` both
consume `useAppSession` membership and Core `useFirestoreRead`. Their selection
adapters both use `useWorkspace`. This is a shared mechanism already present;
do not replace it with another transport or generic Entity framework.
Kitchen adds Place hydration; Project applies a caller filter. Preserve those
domain differences. Remaining comparison: bounded exact-id loading, consistent
missing-versus-empty outcomes and live removal of selected records. This is an
inspection result, not a claim that Workspace reconciliation is complete.

User/AppUser access must derive authority only from a ready membership read.
A retained record during pending/error is not current permission. User handle
lookup owns the combined query/document outcome; consumers must not reconstruct
it from partial state. Shared HTTP transport failures remain separately open.

## CRUD and visible journey verification

CRUD functions are not evidence of finished user journeys. Source inspection
finds User identity editing, App membership subscription editing, App identity
settings and trusted initialization/create flows. No direct calls to
`deleteUser`, `deleteAppUser` or `deleteApp` were found in Core Vue surfaces;
root deletion therefore has not been proved as a complete customer-facing
journey. Do not introduce a destructive button without defining its precise
root-only effect and relationship consequences.

Browser inventory is now accessible. The later closure pass verifies signed-in
navigation and local edit/cancel journeys; successful saves, uploads, guest and
account-switch acceptance remain unverified. Source fixes distinguish
failed/missing User reads from loading and remove Kitchen-specific copy from
reusable membership editing. This is not evidence of complete CRUD UX.

## Journey checklist — App, User and AppUser

Status means evidence, not implementation intent. “Source present” is not a
browser pass. Optional professional/commercial profiles remain deferred.

| Journey | Required result | Current evidence |
| --- | --- | --- |
| User: guest arrives | Clear sign-in/create action; no endless loading | Source present; guest session not exercised |
| User: sign in, no identity | Create one canonical User; recover safely from retry | Source present; creation not submitted |
| User: browse/search directory | Read current Users; useful empty/search states | 29 records loaded; Joe Dean search and result navigation verified; empty search not exercised |
| User: directory → detail | Correct handle resolves to one current User | Directory → Joe Dean public profile → App membership management verified |
| User: edit own identity | Name, handle, bio and avatar save to User only | Editor source reviewed; browser saves untested |
| User: invalid edit/cancel | Clear validation; cancellation writes nothing | Display-name draft/cancel verified; invalid submit not exercised |
| User: change handle | Links and lookup follow current handle, no old match | Focused lookup test passes; navigation unverified |
| User: missing/deleted identity | Explicit missing state; no old person displayed | Source states repaired; browser unverified |
| User: delete identity | Explain root-only effect versus Auth/memberships; authorized confirmation | Complete visible journey not established |
| AppUser: join allowed App | One membership for current App/User, correct defaults | Policy tests pass; browser join untested |
| AppUser: invitation/approval required | Explain pending/access state; no silent self-join | Source policy present; browser untested |
| AppUser: read own membership | Subscription/access separate from User identity | Profile shows separate membership and subscription; ready-state authority tests pass |
| AppUser: admin browses members | Membership retained if User presentation is missing | 27 membership rows render, including one unresolved User; composition test passes |
| AppUser: change subscription/role | Authorized command, feedback, live update | Subscription UI/source present; changes not submitted |
| AppUser: removed/revoked/failed read | Elevated UI authority disappears immediately | Ready-state authority test passes; browser unverified |
| AppUser: leave/remove membership | Explain effect on this App, preserve User identity | Complete visible journey not established |
| App: directory → detail | Correct local/platform scope, active records only | Local directory/detail/back journey verified; platform adapter covered by source tests only |
| App: create through Project | Required Ecosystem relationship and initial membership created together | Trusted workflow present; not exercised in this review |
| App: edit identity/settings | Correct App updates; pending/error feedback | Name, tagline and address edit/cancel verified; settings tests pass; browser save unverified |
| App: inactive/archived/missing | Public detail disappears or shows missing, private management remains scoped | Public read tests pass; browser unverified |
| App: delete | Explain root-only effect and remaining relationships | Complete visible journey not established |
| Cross-cutting READ: live changes | Open singles/collections update without refresh | Earlier Menu proof only; identity browser proof pending |
| Cross-cutting READ: account switch/logout | No previous User data, notifications or permissions | Notification/authority tests pass; browser unverified |
| Cross-cutting READ: errors/reconnect | Honest error and recovery, no stale authority | Shared transport defects remain open |
| Cross-cutting UX: mobile/keyboard | Usable controls, focus, readable states, no overflow | Not verified |

Current browser observation supersedes the earlier connection and navigation
blockers: `/users` loads 29 records, search opens the matching public profile,
and the administrator can open that person's separate App membership editor.
Dashboard profile, settings, management and media routes also navigate normally.
The shared Dashboard page-transition correction is described above. This does
not claim that unrelated hydration warnings are resolved. No live records were
created, modified or deleted for this checklist.

## Current User screen: UX → files → delivery

Starting URL: `/users/:handle` in Misebox. File paths below are relative to the
repository root. This maps current source, not a promise that browser rendering
or every error state is verified.

| What you experience | UI owner | Read/write delivery |
| --- | --- | --- |
| Open a person's URL | `projects/misebox/misebox-app/app/pages/users/[handle]/index.vue` | `user/composables/useUserByHandle.ts` resolves the handle, then `useUserRead.ts` reads the canonical User through Core `useFirestoreRead` |
| Misebox adds relevant domain content | `projects/misebox/misebox-app/app/components/User/Detail.vue` | Composes Core User detail and Kitchen memberships; no Kitchen creation form remains here |
| Person's avatar, name, handle, bio | `packages/core/fireux-core/src/runtime/user/components/Profile.vue` | Receives the User record; session is used only to decide whether the own-profile edit action is available |
| App membership strip | `packages/core/fireux-core/src/runtime/user/components/AppMembership.vue` | `user/components/Detail.vue` obtains it from `app/composables/useAppUserMembership.ts`; own membership comes from the session, administered memberships from the exact `useAppUserRead.ts` |
| Edit identity | `packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue` → `user/components/Edit/Core.vue` | `useUserSession.ts` supplies current identity; `useUserProfileUpdate.ts` sends trusted updates; avatar upload and handle change are named operations |
| Manage membership | `packages/core/fireux-core/src/runtime/pages/users/[handle]/edit.vue` → `user/components/AppMembership/Edit.vue` | `useAppUserMembership.ts` calls `runAppUserCommand.ts`; AppUser owns subscription changes, not User |
| Linked Kitchens and access notices | `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/UserMemberships.vue` | `kitchen/composables/useKitchenUserMemberships.ts` consumes its authorized server projection; Kitchen owns Kitchen/Place/Team composition |
| Browse people | `packages/core/fireux-core/src/runtime/user/components/Collection/List.vue` → `components/Collection/Cell.vue` | User directory presentation becomes shared clickable cells; real bio only, no repeated “View profile” copy |

Unless fully prefixed above, User/App/component paths are beneath
`packages/core/fireux-core/src/runtime/`. The key separation is: routes compose,
components present, domain readers own read meaning, shared Core handles
subscriptions, and named commands own writes. The Kitchen section is a separate
domain capability—not extra fields on the User model.

## App object journey review — 2026-09-11

Browser scope: Misebox on localhost:3001, signed in as the existing developer/
administrator, normal viewport and 390×844 mobile view. No records, memberships
or subscriptions were changed. Description edit was opened and cancelled;
creation review used a local unsaved draft. Guest, paid checkout, actual App
provisioning and destructive actions were not exercised.

| Journey | Observed result | Owning source beneath Core `src/runtime` |
| --- | --- | --- |
| Discover and filter Apps | Six Apps load and filtering works. Hero, current Apps and creation CTA repeat concepts; mobile's first screen contains two My apps boxes before discovery. | `pages/apps/index.vue`, `app/components/Current.vue`, `app/components/Create.vue`, `app/components/Collection.vue` |
| Recognize my App | Misebox card prints `missing` for an absent tagline, which resembles a broken membership. | `app/components/Cards/Cell.vue` |
| Open App detail | Navigation works; detail displays duplicate role/Ecosystem metadata, App ID and creation date. Misebox has no main heading or useful next action; Links says No links available. | `app/components/Detail.vue`, `app/components/Profile.vue` |
| Start another App | Directory CTA sends the user to `/get-started`, which starts a Kitchen. App pricing instead links to `/apps/create`. | `app/components/Create.vue`; Misebox `app/pages/get-started.vue` |
| Review App creation | Historical draft-only journey; retired by the current acceptance repair. Core now states creation is unavailable, while FireUX opens its real Project Apps tool. | `pages/apps/create.vue`; FireUX Project Apps capability |
| Manage current App | Dashboard's Manage Misebox link reached `/dashboard/admin` but initially rendered an empty main. Reload rendered controls and reported a hydration mismatch. Cause remains unclassified. | `pages/dashboard/admin/index.vue`, `app/components/Dashboard/Admin.vue`, dashboard layout/route lifecycle |
| Edit App presentation | Description edit/cancel works. Links promises editing but only shows a registry-metadata note. App settings/access are collapsed below domain management tools. | `app/components/Edit/Admin.vue`, `app/components/Edit/Sections/About.vue`, `app/components/Edit/Sections/Social.vue` |
| Review membership | 27 AppUsers render with subscription controls; no search in the observed list. One unresolved identity displays its raw id. Join Requests provides a clear empty state. Mutation feedback remains untested. | `app/components/Edit/Sections/AppUsers.vue`, `app/components/Edit/Sections/JoinRequests.vue` |

The blank admin navigation is repaired by the later shared Dashboard closure.
The current acceptance repair also makes App creation's available outcome truthful.
Compose three clear journeys: discover/open
an App, manage the current App, and request/create another App. Keep public
identity, App settings and AppUser membership as distinct responsibilities with
explicit doorways. Remove duplicate copy, absent-value placeholders and internal
model terminology from public presentation. Preserve the existing domain read
and command owners; this audit does not justify another transport rewrite.

### App Explore implementation

Explore, Manage and Create are the accepted App journey segmentation. This
pass implements Explore only. Both local and platform directories keep their
existing authorized readers and compose a compact heading, searchable App
collection and existing read/error/pagination states. Management and creation
promotions are removed from these discovery routes. App cards reuse the
compact shared CollectionCell presentation without role/Ecosystem badges,
placeholder descriptions or repeated action labels.

App Detail now owns public presentation directly: back to Apps, authored media,
name, optional tagline/description and a real entry action. The current App uses
its configured home path; other Apps use an HTTP(S) website from the canonical
App's social links. Missing addresses are explicit and do not produce invented
hostnames. The larger AppProfile component remains available to other existing
consumers; it is no longer the public detail composition.

Browser verification in Misebox: six Apps render; search, no-match/clear,
card-to-detail, All apps, and Open Misebox → /about work. At 390×844, cards are
compact, names wrap, and detail fits the viewport. Bären and La Tap demonstrate
the missing-address state. Six existing App read tests and Core's typecheck
pass. FireUX's directory adapter received the same presentation change but was
not browser-tested in this pass. No stored records were changed. The later
Dashboard closure repairs Manage's blank navigation; Create's unfinished
submission remains an open product slice.

### App identity and address journey

The next browser pass now reaches management and renders its live App state.
App identity/settings appear before domain admin tools and start expanded.
Name and tagline now have actual editors alongside description. The placeholder
Links section now edits the App's public address through the existing trusted
settings command. A field-specific website patch preserves other social links.
The management reader now directly uses `useAppRead` and its outcome instead of
constructing CRUD commands and reconstructing read state.

Browser verification: six Apps in the directory, La Tap detail and its absent
address state, Misebox management, tagline draft/cancel, address edit/cancel,
and View app back to Misebox detail. No live writes were performed. Four App
settings tests pass, covering runtime scope and address-only validation/patches.
The generated App check has no diagnostics in changed/new files; the wider App
check still fails outside this slice. Mobile layout and successful live saves
remain unverified for these new controls.

The field-to-UX map is in `docs/concepts/core-models.md`. Next product questions
are the distinction between an App definition and a launched App, the exact
Create journey, and membership/joining presentation. Existing placeholder copy
is editable material, not a constraint on these decisions.

## Ecosystem acceptance — 2026-09-12

- Root document and collection composables reuse Core live Firestore reads;
  App membership uses `useEcosystemApps` over the App collection reader.
- The public directory rendered seven Ecosystems; Misebox detail rendered six
  Apps and its parent Project. Direct detail navigation passed. Automated
  directory-card activation initially timed out. The shared Collection card now
  wraps content in an ordinary link; click and keyboard activation succeed.
  Directory-to-detail navigation also exposed reused disposed live handlers;
  component-owned live state keys resolve that lifecycle failure, verified in
  the browser with Misebox detail and its App list.
- Removed the misleading Create card: its destination only reads Project
  Ecosystems. Primitive CRUD functions exist, but an actual create/edit/delete
  management journey remains unfinished. Do not describe it as accepted CRUD UX.
- Root server reads now preserve Firestore document identity even when stored
  data contains an old id; the regression test and Core typecheck pass.
- These checks do not complete the App/User/AppUser browser acceptance above or
  prove Ecosystem write validation, asset handling or management end to end.

## Focus Read audit — 2026-09-13

Scope: maintained root collection/detail entrances for App, User, AppUser,
Ecosystem, Project and Kitchen, their FireUX public route adapters, and shared
Workspace access/selection readers. Kitchen capability children and unused
legacy surfaces are not claimed as exhaustively accepted by this audit.

| Entity | Collection owner | Single-record owner | Transport result |
| --- | --- | --- | --- |
| App | `app/composables/useAppCollection.ts` | `useAppRead.ts`, `useAppDetail.ts` | Core live server collection/projection and direct live document |
| User | `user/composables/useUserCollection.ts` | `useUserRead.ts`, users API by handle | Core live page/document and live server handler |
| AppUser | `app/composables/membership/useAppUsers.ts` | `useAppUserRead.ts` | Core live membership pages and document; User hydration remains separate |
| Ecosystem | `useEcosystemCollection.ts`, FireUX `usePlatformDirectory.ts` | `useEcosystemRead.ts`, `usePlatformEcosystemDetail.ts` | Core live document/query and server directory |
| Project | `useProjectCollection.ts` | `useProjectRead.ts`, `useProjectDetail.ts`, FireUX `usePlatformProjectDetail.ts` | Core exact live documents and live server projections |
| Kitchen | `useKitchenCollection.ts`, `useKitchenWorkspaceKitchens.ts` | `useKitchenRead.ts`, `useKitchenDetail.ts` | Core live server projection and exact document bindings |

Core-owned paths above are under `packages/core/fireux-core/src/runtime`;
Kitchen paths are under the Kitchen extension's `runtime/kitchen/composables`;
FireUX adapters are under `projects/fireux/fireux-app/app/composables`.
Server index/detail endpoints inspected use `defineLiveReadHandler`; FireUX's
additional Admin database resolver wraps handles in `observeRuntimeFirestore`.
No one-shot replacement was found in these root index/detail flows. Explicit
bootstrap/create validation, notification mark-read mutations and environment
diagnostics are not mutable collection/detail reads.

Remaining contract gaps:

- FireUX `usePlatformProjectDetail.ts` returns only `project` and `ready`;
  `pages/projects/[id].vue` has no pending/error/missing UI. A failed read can
  produce a blank body. This is the first repair.
- `useProjectDetail.ts` maps absent account/id to missing and collapses all
  failures to 503; App detail instead exposes idle and preserves 404.
- `useKitchenDetail.ts` has no idle outcome for an empty slug.
- Detail and collection wrappers still derive their own outcomes. Reuse of
  transport alone is not enforcement of a uniform consumer contract.
- Kitchen's optional authorized hidden collection intentionally falls back to
  public results on failure. That difference must remain explicit when its
  presentation contract is reconciled.

Verification: 67 tests passed across foundation read contracts, Firestore read
states, live client/server transport, App collections, User lifecycle/session,
membership access, selection, Ecosystem identity, platform App/Project reads
and Kitchen readiness. This audit changed no runtime behavior or remote data.

### Shared Read-state pass — 2026-09-13

Core's `read-outcome.ts` now provides state precedence to direct Firestore
bindings, the shared collection-state adapter, and App/Project/Kitchen/Ecosystem
server detail projections. User and AppUser reuse the direct document contract.
Public Project detail renders pending/error/missing states; its missing-record
page was verified in the browser. A missing identity is idle in the migrated
detail adapters. Stale and failed detail results are hidden.

This closes the named detail-state gaps above. Domain-composed collection
wrappers with custom authentication/pagination behavior still need their
individual differences assessed; this is not a repository-wide conformance claim.

### Entity detail ownership — 2026-09-13

Removed the FireUX `usePlatformProjectDetail` and `usePlatformEcosystemDetail`
wrappers. Their pages now use entity-owned `useProjectDetail` and
`useEcosystemDetail`. The unused authenticated Project detail implementation
was replaced by the existing public exact-read behavior. Ecosystem detail now
uses its existing exact endpoint instead of fetching the full platform directory.
Project's server endpoint remains FireUX-owned; its database scope is unchanged.
The earlier audit table above records the pre-repair paths.

### Collection contract consolidation — 2026-09-13

Removed unconsumed `useAppUser`, `useEcosystem` and `useProject` CRUD bundles.
App directory consumers now call `useAppCollection` directly; the retired
`useApps` page-size wrapper has no forwarding alias. Existing endpoint and
24-record page inputs are preserved at those consumers.

App collections, App member composition, User directory presentation, Project
public and membership collections, and Kitchen collection presentation now
consume Core read-outcome precedence. Domain authentication, pagination,
relationship composition and Kitchen's optional hidden-result fallback remain
with their owners. Kitchen's direct read/presentation coupling remains separate cleanup work.
The remaining App/User bundles were subsequently removed: the sole active App
consumer uses `useAppRead` directly, 35 unused User imports are removed, and
the unconsumed Misebox forwarding wrapper is retired. No mutation command
behavior changed.

### Kitchen read and presentation boundary — 2026-09-13

Kitchen's direct reader now exposes canonical Kitchen and Place records
separately. Workspace, editor and Workspace detail apply the existing interface
projection themselves. Access-only readers still omit Place hydration. Core
exact document reads replace single-result queries and shared outcome precedence
hides failed or obsolete data. This does not reconcile the older operator-field
authority consumers or the broader Workspace CRUD controller.

### Target acceptance findings — 2026-09-13

Browser acceptance exposed a real platform database delta omitted in the earlier
wrapper consolidation: canonical Ecosystems live in their owning ecosystem
databases. FireUX now selects approved targets server-side and reuses Core's
canonical reader. The directory uses those same canonical records, and Project
App relationships resolve through them rather than querying only FireUX's local
Ecosystem collection. Misebox detail and its six Project Apps are browser-verified.

App detail, User directory/detail and AppUser membership display, and Kitchen
directory/detail render. The `fireux-blank` sample document lacked `ecosystem_id`. The authorized exact
repair set it to the configured `fireux` and created its missing reverse locator
through Core guarded transaction mechanics. Record versions and source/plan hash
were checked, preimages retained, and all other App fields verified unchanged.
The browser now lists 17 Apps and opens FireUX Blank detail. Protected repair
evidence is in `/tmp/fireux-app-association-repair/plan.json` and `result.json`;
retain those artifacts before temporary-directory cleanup.

Kitchen live visibility testing saved La Tapberne as hidden. After explicit
user approval, its original `visibility: true` was restored through the Kitchen
editor and verified by reopening that editor. The authenticated observer
continued to show the detail during the test, so this attempt does not prove
guest unpublication behavior.
Create/update/delete commands and asset lifecycles have automated coverage;
full browser mutation and live two-view verification remain outstanding. This
is not complete acceptance of all six entities.

### App browser and asset acceptance — 2026-09-13

FireUX App directory, detail, Admin identity/member settings and Developer media
pages render. The five stored App media files (logo, both wordmarks, thumbnail
and cover) belong to `fireux-app` and match their local PNG sources byte-for-byte
by SHA-256. No media sync was needed. The focused App settings, media, detail,
collection and member tests pass (22 tests). `/apps/create` explicitly exposes
no primitive creation, consistent with the trusted Project/runtime creation
boundary. Browser mutation/live observer acceptance remains pending explicit
approval of a temporary tagline change and its restoration.

### User/AppUser browser acceptance — 2026-09-13

Verified FireUX User profile → profile editor → cancel display-name draft →
profile → current-App membership editor. Saved identity remained unchanged;
App membership shows Developer/Business separately from public identity.
Profile owns name, handle, bio and avatar; AppUser owns role/subscription; private
account details remain on the signed-in dashboard. The membership editor loads
the current App subscription. No stored profile, subscription or avatar was changed.

54 focused profile-command, avatar, session, membership-policy/lifecycle, member
and foundation-read tests pass. Browser saves and cross-view live mutation
verification remain unperformed; this checks navigation, edit/cancel behavior
and ownership, not complete mutation acceptance.

### Ecosystem/Project browser acceptance — 2026-09-13

Verified the seven-Ecosystem directory, Misebox Ecosystem → Project → App
navigation, and Misebox's six related Apps. The Project Workspace lists five
personal Projects; switching from Misebox to FireUX updates the selected identity.
The Project identity editor loads and cancels without saving. Restored Misebox
selection and opened its identity capability, which renders the selected Project
and its published App source. No stored records changed.

44 focused Ecosystem read, Project access/identity/membership, Workspace selection,
read-outcome and platform/Project App relationship tests pass. Approved database
selection remains on the FireUX server; Core supplies the canonical reader.
Creation, saves, deletion and cross-view live mutations were not browser-tested
in this pass.

### Kitchen access consumers — 2026-09-13

The public Kitchen editor now consumes `useKitchenAccess` instead of creator,
operator or App-admin shortcuts. Staff POS reads the menu source App's exact
AppUser and reuses Core `useMembershipAccess` with the Kitchen-owned access path;
errors, pending membership and live removal suppress access. Dedicated App-theme
reads reuse `requireKitchenWriterAccount`; App-theme writes retain their separate
App-admin requirement. Three unconsumed legacy public people/join/operator
components were removed rather than presenting root operator fields as authority.
Stored legacy presentation fields and other domains were not migrated.

17 focused Kitchen/Project membership, POS and App-theme access tests pass. The
Kitchen access suite runs with a temporary Node resolver for extensionless
TypeScript imports. The initial browser attempt stalled at Misebox's loading selector with a
hydration mismatch. Follow-up passive diagnostics showed authentication, App,
AppUser and Kitchen reads reaching ready. After development-module reload, an
uninstrumented full page load displayed five Kitchens; selection changed the
Workspace and the settings editor opened/cancelled normally. Original La Tapberne
selection was restored. The stall's exact cause was not isolated; no permanent
runtime change was justified. Temporary diagnostics were removed. No stored
records were changed. Misebox typecheck completed with 113 errors, none in the
changed access files; full typecheck acceptance remains outstanding.

Follow-up acceptance found and fixed the public editor's slug/id mismatch: its
route supplies a slug, so it now reuses `useKitchenDetail` for canonical Kitchen
and Place records. `/kitchens/la-tapberne/edit` renders the correct Kitchen and
member editing controls. Eighteen focused tests pass, including editor denial
on removal/error/unrelated association and rejection of legacy owner fields.
No real membership was revoked and no order was submitted. Browser Staff POS
acceptance remains unproved: `food.staff_pos` currently resolves through
`MenuRecord`'s JSON fallback rather than the Staff POS component. That route
integration requires its own bounded follow-up; access tests do not prove it.

### Foundation group acceptance — 2026-09-13

Scope: App, AppUser, User, Ecosystem, Project and Kitchen. This is a foundation
acceptance group, not six identical Workspace entities. Project and Kitchen own
selectable Workspaces; AppUser is membership; User is identity; App is a product;
Ecosystem owns the Project/App grouping. Capabilities are excluded except when a
consumer breaks a shared foundation contract.

| Target | Established contract and evidence | Still required for full acceptance |
| --- | --- | --- |
| App | Canonical Ecosystem association; live index/detail; trusted settings and media commands; directory, settings and matching media browser evidence | Browser save/live restoration passed; no claim of primitive self-service App creation |
| User | Canonical public identity; owned avatar command; live detail and profile edit/cancel; validation and lifecycle tests | Browser save/live restoration passed |
| AppUser | App-scoped role/subscription and membership lifetime; separate from User and domain access; command/revocation tests | Browser membership mutation and visible access removal |
| Ecosystem | Canonical named-database reads; Project relation and App directory; browser index/detail | Cross-ecosystem identity is intentionally read-only in FireUX; owning-system management and ignition are deferred |
| Project | Membership-bound collection; selected workspace; bounded identity command; related Apps; browser selection and edit/cancel | Browser saved change/restoration passed; browser membership removal and root deletion lifecycle remain unaccepted |
| Kitchen | Membership-bound collection; canonical Kitchen/Place identity; selected workspace; root editor; reactive access and read tests | Browser root save/missing/recovery passed; guest unpublication and root deletion lifecycle remain unaccepted |

The final source-owned foundation suite passes 213 tests, including this audit's
regressions. Core standalone and FireUX App typechecks both pass. Misebox's last
completed App check retains 113 errors, with none in the audited root access
files; its capability and App-composition failures remain a separate boundary. The audit fixed failure precedence
in shared Workspace landing state and Kitchen collection state: an error cannot
be hidden behind another pending prerequisite. It also removed Core's duplicate
PWA/icon module type declarations and fixed plain Markdown checklist items
accessing an absent checkbox capture. Focused regressions cover both behaviors.

Existing browser evidence above is reused rather than repeating unchanged
journeys. No remote data, membership, media or Rules were changed for this audit.
Live membership/read tests use controlled reactive sources and server dependency
notifications; they are not presented as a completed two-browser mutation test.
Open development Rules remain the explicitly accepted policy, not release security.

The group is **partially accepted for development**, not fully accepted or ready
to release. The remaining browser mutation evidence and unsupported management
surfaces are explicit gaps. Capability type errors remain outside this group;
Core/App compilation issues are recorded separately and cannot be dismissed as
capability debt. Do not expand into Staff POS, menus, orders or recipes to close
this foundation checklist.

### App browser save/live proof — 2026-09-13

Used the existing FireUX Admin tagline editor and a separately opened App detail.
Saved `Foundation live-read check` from the original empty tagline. The already
open detail displayed it without navigation or refresh. Restored the empty value
with the field's Clear action; the same observer removed the text live. The
App's normal update audit stamp changes with these writes. No membership,
publication, media or Rules changes were made. An initial empty-input Save
retained the prior text; Clear succeeded. The shared save function accepts empty
strings in source, so this observation alone does not establish a code defect.

### User browser save/live proof — 2026-09-13

Used the FireUX profile editor and an already open `/users/daniel` observer.
Temporarily saved `Daniel Watson · check`; the profile rendered the formatted
`Daniel Watson · Check` without refresh. Restored `Daniel Watson`; both the editor
and observer confirmed the original value. Handle, bio, avatar and membership
were unchanged. This proves one real User command and its live public read;
it does not claim membership revocation or avatar-upload browser acceptance.

### Disposable-member revocation integration — 2026-09-14

The real `handleRemoveMember` handler now has an integration regression using an
isolated disposable member, staged transaction writes and the real
`useMembershipAccess` reader. Committing removal clears both domain access views,
keeps the administrator unchanged and records the membership block. A replacement
membership with a new creation timestamp cannot reuse the retained old grants.
The existing protected-server projection test separately proves a subscribed
membership change produces a 403 read-error and closes the stream. All 24 tests
in the membership-lifecycle and live-server suites pass. No remote account was
created, removed or changed. A signed-in disposable browser account and its
end-to-end browser revocation journey remain unproved; this test does not close
that acceptance item.

### Project and Kitchen root browser proof — 2026-09-14

Project Identity saved `Misebox · check`; an already-open public Project detail
updated without refresh. Restoring `Misebox` updated the same observer live.
Kitchen root settings temporarily changed `la-tapberne` to
`la-tapberne-root-check`, then restored the original slug. Status remained active
and public visibility remained enabled. These writes update normal audit stamps.

The first Kitchen run exposed a shared defect: a 404 closed its live subscription,
and the public page rendered no missing state. Core now retains the dependency
subscription for 404 responses and delivers a restored document over that same
stream; denied access still closes the stream. Kitchen detail consumes the shared
StateCard for loading, missing and error states. After loading the repaired code,
the repeated browser run showed “Kitchen not found”, then La Tapberne again after
restoration, with no observer navigation or refresh between mutations. Fourteen
focused live-read tests and Core typecheck pass. This is root save/read evidence,
not guest unpublication, membership-revocation or capability acceptance.

### Ecosystem ownership and deferred ignition — 2026-09-14

FireUX's cross-ecosystem directory is read-only. Ecosystem id, owning project_id,
name, description, image_url, website_url and status remain owned by the target
Ecosystem. Project access in FireUX does not authorize editing identity in another
Ecosystem's database. Do not broaden cross-project credentials to enable that UI.
The experimental editor and PATCH endpoint were removed; no remote identity
change was persisted. Existing unused low-level CRUD helpers do not establish a
supported management workflow.

App and Ecosystem ignition will need to collect initial identity and ownership
information. The product journey, and its ordering relative to package cloning,
local setup and deployment, are deferred; do not build that flow yet. Ongoing
identity management belongs with the owning App/Ecosystem, with links from FireUX
when an actual management surface exists.

Prioritise Kitchen and Misebox next. Project and FireUX App remain available but
new product orchestration is deferred. Use Project's existing Test capability to
prove shared mechanics; do not invent Project-owned extension properties before
there is a concrete need. Keep Project-owned data distinct from the external App
or Ecosystem identity it presents.

### Kitchen workspace entry audit — 2026-09-14

Existing-member browser evidence: five Kitchens load on Misebox `/`. Selecting
Interlaken Pizza updates the header, sidebar and focused identity together;
La Tapberne was restored afterward. No entity data was edited. Twenty focused
workspace readiness, access and landing-state tests pass.

The entry source still gates creation on App membership and allowance. Its guest
welcome links to sign-in before adding a Kitchen. Signed-in members without
Kitchens receive the creation action when allowed; members without App membership
are currently conflated with signed-out users through `hasAccount` in the welcome
props. These guest/empty paths were source-audited, not browser-proved here.
The agreed anonymous entity-to-account continuity is not delivered by this entry
flow and needs a bounded design/implementation pass. Existing adoption endpoints
alone do not establish that the landing uses them. Do not describe an unnamed
Kitchen as already persisted before that path is proved.

The live collection composes membership-bound Kitchen records with Place identity
through shared Core readers. Workspace selection uses the shared reconciliation
mechanic. The UI repeats selection in top tabs, the collection and sidebar;
creation also appears twice. Simplify presentation separately from the guest
ownership and persistence contract. No menus/orders/recipes work was performed.

### Kitchen guest entry and account handoff

- Implemented one anonymous Kitchen creation command, its live Landing surface,
  and atomic adoption into current App membership. Real Kitchen/Place/menu ids
  survive sign-in; new guest Kitchens are unpublished. No capability access was
  broadened. Removed the unused mount-only entry bridge.
- Browser: a fresh Firefox private session created `kitchen-BY9NaJ` and saw it
  appear without refresh, then reached `/auth`. Existing browser sessions were
  preserved.
- Replaced the expiring Firebase proof with a Kitchen-owned recovery key stored
  in the same browser until adoption completes; only its hash is stored remotely.
  Removed token-capture hooks and the unused generic Core helper. The existing
  `kitchen-BY9NaJ` was reopened and prepared successfully in the private browser.
- The test account completed `/users/create` with the human's explicit Terms
  approval. Dashboard showed one `kitchen-BY9NaJ`; opening it selected that Kitchen
  on Landing, and the selection and single collection item survived a reload.
- Account setup and the session avatar now use the shared User avatar resolver.
  The ecosystem default visibly replaces the test account's initial when no photo
  exists. Core typecheck passes.
- Removed competing Auth System/Email Panel navigation; Auth System now waits for
  the User read and chooses one destination. User setup shares the auth layout.
  Added delayed-live-collection selection coverage for the adopted Kitchen.
  28 focused checks pass. Clearing site data still removes an unclaimed guest's
  recovery key; cross-device recovery is outside this pass.
