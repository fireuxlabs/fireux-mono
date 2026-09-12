# Identity and Workspace reconciliation

Updated: 2026-09-12
Role: roadmap, not implementation authority
Baseline: 997624d71

## Immediate scope: User and AppUser

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

Before moving on, finish the current User read cleanup and verify AppUser's
single read, membership collection and session composition. Check account
switching, missing membership, membership removal, read failure and empty
Workspace relationships. Do not call the family aligned on compilation alone.

Source entrypoints:

- `packages/core/fireux-core/src/runtime/user/composables/useUser.ts`
- `packages/core/fireux-core/src/runtime/user/composables/useUserRead.ts`
- `packages/core/fireux-core/src/runtime/user/composables/useUserCollection.ts`
- `packages/core/fireux-core/src/runtime/user/composables/useUserSession.ts`
- `packages/core/fireux-core/src/runtime/app/composables/useAppUser.ts`
- `packages/core/fireux-core/src/runtime/app/composables/useAppUserRead.ts`
- `packages/core/fireux-core/src/runtime/app/composables/useAppUsers.ts`
- `packages/core/fireux-core/src/runtime/app/composables/useAppUserAccess.ts`

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
change. AppUser now stores role, subscription, onboarding and audit stamps only.
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

## Return to Workspaces

After that bounded foundation is verified, compare Project and Kitchen:

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
| App membership strip | `packages/core/fireux-core/src/runtime/user/components/AppMembership.vue` | `user/components/Detail.vue` obtains it from `app/composables/useAppUserMembership.ts`; own membership comes from the session, administered memberships from `useAppUsers.ts` |
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
| Review App creation | Name generates a slug and review displays the draft. The journey ends with prose about a trusted provisioner; no create, submit or handoff action exists on that screen. | `pages/apps/create.vue`, `app/components/Create/System.vue` |
| Manage current App | Dashboard's Manage Misebox link reached `/dashboard/admin` but initially rendered an empty main. Reload rendered controls and reported a hydration mismatch. Cause remains unclassified. | `pages/dashboard/admin/index.vue`, `app/components/Dashboard/Admin.vue`, dashboard layout/route lifecycle |
| Edit App presentation | Description edit/cancel works. Links promises editing but only shows a registry-metadata note. App settings/access are collapsed below domain management tools. | `app/components/Edit/Admin.vue`, `app/components/Edit/Sections/About.vue`, `app/components/Edit/Sections/Social.vue` |
| Review membership | 27 AppUsers render with subscription controls; no search in the observed list. One unresolved identity displays its raw id. Join Requests provides a clear empty state. Mutation feedback remains untested. | `app/components/Edit/Sections/AppUsers.vue`, `app/components/Edit/Sections/JoinRequests.vue` |

The blank admin navigation is repaired by the later shared Dashboard closure.
Remaining product priority: make App creation's available outcome truthful.
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
