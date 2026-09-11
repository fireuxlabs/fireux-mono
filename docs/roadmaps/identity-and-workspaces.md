# Identity and Workspace reconciliation

Updated: 2026-09-11
Role: roadmap, not implementation authority
Baseline: 997624d71

## Immediate scope: User and AppUser

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

## Return to Workspaces

After that bounded foundation is verified, compare Project and Kitchen:

1. Guest arrival, empty state and active Entity selection.
2. User/AppUser identity and membership versus Entity-specific access.
3. Shared collection/single read states and subscription ownership.
4. Capability composition, then Project Apps and Kitchen Menus.

Keep domain authorization and data ownership explicit. Workspace is a surface,
not another identity record. Existing shared transport defects (disconnect
cleanup, reconnect cancellation and remote-source observation) remain blockers
to claiming universal live behavior; they are not solved by folder cleanup.

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

The current visual audit is blocked: browser inventory timed out twice.
Mobile layout, actual navigation and interactive save/error feedback remain
unverified. Source fixes distinguish failed/missing User reads from loading
and remove Kitchen-specific copy from reusable membership editing. Resume
browser verification before claiming a polished or complete CRUD experience.

## Journey checklist — App, User and AppUser

Status means evidence, not implementation intent. “Source present” is not a
browser pass. Optional professional/commercial profiles remain deferred.

| Journey | Required result | Current evidence |
| --- | --- | --- |
| User: guest arrives | Clear sign-in/create action; no endless loading | Source present; guest session not exercised |
| User: sign in, no identity | Create one canonical User; recover safely from retry | Source present; creation not submitted |
| User: browse/search directory | Read current Users; useful empty/search states | Directory loaded 29 records; search untested |
| User: directory → detail | Correct handle resolves to one current User | Blocked: profile click stalled; direct navigation timed out |
| User: edit own identity | Name, handle, bio and avatar save to User only | Editor source reviewed; browser saves untested |
| User: invalid edit/cancel | Clear validation; cancellation writes nothing | Not browser verified |
| User: change handle | Links and lookup follow current handle, no old match | Focused lookup test passes; navigation unverified |
| User: missing/deleted identity | Explicit missing state; no old person displayed | Source states repaired; browser unverified |
| User: delete identity | Explain root-only effect versus Auth/memberships; authorized confirmation | Complete visible journey not established |
| AppUser: join allowed App | One membership for current App/User, correct defaults | Policy tests pass; browser join untested |
| AppUser: invitation/approval required | Explain pending/access state; no silent self-join | Source policy present; browser untested |
| AppUser: read own membership | Subscription/access separate from User identity | Signed-in Business badge observed; full flow unverified |
| AppUser: admin browses members | Membership retained if User presentation is missing | Composition test passes; admin screen unverified |
| AppUser: change subscription/role | Authorized command, feedback, live update | Subscription UI/source present; changes not submitted |
| AppUser: removed/revoked/failed read | Elevated UI authority disappears immediately | Ready-state authority test passes; browser unverified |
| AppUser: leave/remove membership | Explain effect on this App, preserve User identity | Complete visible journey not established |
| App: directory → detail | Correct local/platform scope, active records only | Source tests pass; browser journey unverified |
| App: create through Project | Required Ecosystem relationship and initial membership created together | Trusted workflow present; not exercised in this review |
| App: edit identity/settings | Correct App updates; pending/error feedback | Settings tests pass; browser save unverified |
| App: inactive/archived/missing | Public detail disappears or shows missing, private management remains scoped | Public read tests pass; browser unverified |
| App: delete | Explain root-only effect and remaining relationships | Complete visible journey not established |
| Cross-cutting READ: live changes | Open singles/collections update without refresh | Earlier Menu proof only; identity browser proof pending |
| Cross-cutting READ: account switch/logout | No previous User data, notifications or permissions | Notification/authority tests pass; browser unverified |
| Cross-cutting READ: errors/reconnect | Honest error and recovery, no stale authority | Shared transport defects remain open |
| Cross-cutting UX: mobile/keyboard | Usable controls, focus, readable states, no overflow | Not verified |

Browser observation: `/users` loaded as the signed-in User. Directory-to-detail
navigation stalled and direct detail navigation timed out. Console reported
UserCurrent hydration mismatch and a hydration-completed-with-mismatches error.
This supersedes the earlier blanket browser-inventory blocker: direct browser
connection works, but the journey has a separate unresolved runtime failure.
No live records were created, modified or deleted for this checklist.

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
