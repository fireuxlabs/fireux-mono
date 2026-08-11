# Entity onboarding journeys

This is the practical playbook for shared Core entity onboarding journeys.

## Project onboarding boundary

- Project is a FireUX control-plane entity. `/projects` publishes only active
  identity and presentation; its private operational entry point is the
  admin-only `/console/project`.
- Canonical `fireux/projects/{projectId}` owns Project identity and
  presentation. Each Firebase host keeps one bounded
  `(default)/project/{projectId}` ProjectMeta routing projection.
- The Console is read-only. Canonical creation and changes are trusted
  provisioning operations and must synchronize the local ProjectMeta; the
  browser does not write either record.
- The minimal Console operations are Identity, Apps, Ecosystem, and Team. Team
  reads the existing FireUX `AppProject` access record; it is not a duplicate
  membership store. Do not add Project notifications until the notification
  model has a real Project-scoped emitter and User-owned delivery lifecycle.
- Audit existing Projects with
  `pnpm align:onboarding -- --all --family project --summary`. Any apply must
  use the reported plan hash, a new protected backup path under `/private/tmp`,
  and the command's post-write verification.
- Project images persisted across databases must be deployable HTTPS URLs.
  Repo-local `/img/...` paths are reported but never propagated.

## Experience contract

- `/users/create` is the explicit User provisioning journey. When entered by a
  signed-out person it first passes through `/auth`, then returns with the
  original destination intact.
- `/auth` establishes the Firebase identity only. Routine sign-in never
  creates or repairs Firestore records, uploads an avatar, or accepts legal
  terms on the person's behalf.
- User onboarding creates the canonical User and account, then creates the
  active App membership only when that App permits self-service joining.
  Invite-only Apps finish User setup without advertising a connection the
  person cannot complete.
- The final User-creation action previews the authenticated name, email, and
  avatar before asking for legal acceptance.
- Product copy says `User`, `public identity`, and `App connection`. Internal
  implementation terms such as `core user`, `provision`, `repair`, and
  `membership sync` do not appear as the primary journey.
- Onboarding copy names the immediate task and its visible result. Use plain
  headings such as `Set up your profile`; do not add slogans or metaphors in
  place of the profile, account, and App objects the screen actually creates.
- Legal acceptance is explicit and belongs beside the final `Create my User`
  action. Authentication alone is not acceptance.
- Email and Google authentication do not pass or persist a legal version. A
  new authenticated identity continues to `/users/create`, where the explicit
  final action supplies the current version to trusted account provisioning.
- Success returns to a valid `?redirect=` destination or `/dashboard`.
- `/users/create` and `/apps/create` are protected doorways. Their client auth
  guard sends guests to `/auth?redirect=<full doorway>` and returns them to the
  same journey after authentication.

## Current journey paths

- Dashboard notices a missing User and sends the authenticated person to
  `/users/create`.
- A protected entity doorway such as `/apps/create` first returns through
  `/users/create` when the authenticated identity has no canonical User.
- Primary onboarding action is now on:
  - `UserCreateSystem` (`packages/core/fireux-core/src/runtime/components/User/Create/System.vue`)
- Legal acceptance is collected in onboarding only (not on `/auth`), in line with the cleaner sign-in flow.

## What `Create my User` does

1. A guest requesting `/users/create` is sent to `/auth` and returned after
   sign-in. A signed-in identity stays on `/users/create`.
2. If no canonical User exists, they see:
   - checkbox: “I accept the Terms of Service … Privacy Policy”
   - primary action: `Create my User`
3. On click:
   - the onboarding action provisions the private account, canonical User, and
     User-owned avatar
   - private account state is read through authenticated
     `/api/internal/user/account`, and avatar bytes are saved through
     authenticated `/api/internal/user/avatar`; the journey does not require
     browser Firestore or Storage write permission
   - a self-service App membership is created only when the active App permits
     it
   - on success, user is sent to:
     - `?redirect=` target if present and valid, otherwise `/dashboard`

### Avatar defaults

- If the provisioning payload does not include an explicit avatar URL (or if the field is empty), the user creation flow now uploads the local default image (`/img/ecosystem/avatar.png`) into Firebase Storage at:
  - `users/{uid}/avatar`
- The saved Firebase Storage URL is then written to the canonical User document (`users/{uid}.assets.avatar`).
- If you clear/reset a user avatar in profile-edit flows, the same storage default is re-applied rather than writing the local `/img/...` fallback directly.

## Notes for next session

- If the button appears to do nothing, check:
  - whether Terms checkbox is checked
  - browser/network errors in console for `/api/internal/user/account`
  - whether provisioning stays in `pending` without transition
- There is an alias route for the dashboard-style location:
  - `/dashboard/user/create` -> redirects to `/users/create`
- Redirect resolution is owned by
  `packages/core/fireux-core/src/runtime/utils/onboarding-route.ts`; nested
  onboarding redirects collapse to the original destination and unsafe
  external-looking paths fall back to `/dashboard`.

## Did `testude` get onboarded correctly?

You provided a public users projection snapshot in this thread. I don’t see
`testudo` in that payload, so it’s not currently in that public projection snapshot.

What this usually means:

- Your email (`testudo@test.com`) is your auth identity, while the public route uses a **handle**.
- The handle shown (`@testo70lp9ma`) is valid and expected if the user was created with
  the display name “Test” and a generated handle.
- This means onboarding likely happened; the visible handle just didn’t use the email prefix.
- You can update the handle in `/dashboard/user-profile` if you want `/users/testudo`-style slugs.

What to verify next (in order):

1. `/users` collection public projection
   - `handle` should be present (`testudo` or similar)
   - `displayName` should match what you set (or sensible fallback from auth)
   - `assets.avatar` should be a real URL (not missing/empty)
2. `users/{uid}` canonical record
   - should exist in the Firestore identity database
   - should contain `handle`, `display_name`, `bio`, `assets.avatar`, and stamps
3. `users/{uid}/private/account`
   - should contain term acceptance + preferences record after onboarding
4. App membership (for current app only)
   - `apps/{appId}/users/{uid}` should exist if `selfJoinEnabled` path is active

If only step 2 exists (core user exists) but step 3/4 is missing, onboarding was only
partially completed.

## Functional output contract

Successful User onboarding creates or confirms these owned records:

1. `users/{uid}` — the canonical public User identity.
2. `users/{uid}/private/account` — private preferences and current legal
   acceptance evidence.
3. `users/{uid}/avatar` — the User-owned Storage object for either the
   supplied avatar or the default.
4. `apps/{appId}/users/{uid}` — only when the active App permits self-service
   membership or a separate authorized App action creates it.

The public `/users/[handle]` page exposes one bounded `objects.user` DTO from
the public User endpoint. Session comparisons such as `isOwnProfile` belong in
`derived`; route input such as `handle` belongs in `page`. Endpoint, live-self,
and selected display variants are implementation sources, not separate User
objects and must not appear in the page DTO.

Existing Users do not need migration merely because the old page displayed
`endpointProfile`, `liveSelfProfile`, and `displayProfile`: those duplicates
were created in page memory and were never stored as Firestore records. A data
migration is justified only when an audit finds a canonical User, private
account, avatar object, or required AppUser record that violates its owning
contract.

Avatar migration may copy an existing approved image or the default into the
User-owned Storage path and update the canonical User URL. Legal evidence must
never be synthesized by migration: an account without current acceptance must
return to explicit account setup. AppUser records are also not bulk-created;
their presence follows the active App's membership policy.

The guarded fleet tools are:

- `pnpm align:onboarding -- --all --summary` for non-destructive User,
  AppUser, Ecosystem, Project, App, and local metadata projection planning;
- `pnpm align:user-avatars -- --all --summary` for owned-avatar Storage
  planning.

Both default to read-only, require exact plan confirmation plus a protected
preimage for apply, and verify every result. Neither tool creates acceptance,
Users, memberships, Apps, Auth identities, or admin roles.

Quick in-app checks:

- Signed-out visits to `/users/create` and `/apps/create` should move to
  `/auth` with the complete doorway in `redirect`.
- After sign-in, visiting `/dashboard/user/create` should redirect to `/users/create`.
- Clicking `Create my User` should move forward to `/dashboard` (or the active `redirect`
  target), not stop on the same screen.
- On an invite-only App, a valid User should finish without entering a false
  `Connect` step. On a self-join App, the membership step must create the
  current AppUser before completion.
- In Dashboard:
  - `Finish your User setup` should clear to normal overview only when all required
    records exist.

## Source anchors (edit with care)

- `packages/core/fireux-core/src/runtime/components/Dashboard/Overview.vue`
- `packages/core/fireux-core/src/runtime/components/Auth/System.vue`
- `packages/core/fireux-core/src/runtime/components/User/Create/System.vue`
- `packages/core/fireux-core/src/runtime/pages/users/create.vue`
- `packages/core/fireux-core/src/runtime/pages/dashboard/user/create.vue`
- `packages/core/fireux-core/src/runtime/composables/fireux/user/useUserComputed.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firebase/useAuth.ts`
- `packages/core/fireux-core/src/runtime/utils/onboarding-route.ts`

## App onboarding

`/apps/create` always describes a new App. The App hosting the route supplies
authentication and placement policy; its existing runtime configuration must
never prefill the new App identity or make the create journey appear complete.

The shared Core surface behaves according to its current environment:

- an ecosystem Main App offers a tenant App in that ecosystem and derives the
  ecosystem relationship;
- FireUX may offer a FireUX tenant, a standalone App, or the separate new
  ecosystem path;
- tenant and standalone Apps do not offer child-App creation unless a future
  explicit capability permits it.

The browser draft contains only user-owned intent such as name, slug, and
description. Role, project, ecosystem, database, and infrastructure placement
are derived by trusted policy. Firebase credentials are never browser form
fields.

App creation is a provider/provision workflow, not a raw client Firestore
create. Source shape, registry, assets, configuration, Firebase resources, and
auth domains must satisfy their guards before the canonical App is saved. A
Codex task or future Skill/MCP may legitimately invoke this Operator lane; it
must follow the same contract rather than becoming another mutation lane.

Runtime initialization remains a separate internal recovery operation. The
App Shell mounts `AppInitializeSystem` only when the App declared by runtime
configuration lacks its canonical record. Its green environment checks mean
“this configured App is ready to initialize”; they are never progress for a
new App. Initialization authenticates the configured developer and atomically
creates the fixed runtime App plus its first App-admin membership in the named
database through the Server mutation lane. It then idempotently creates or
updates that App's bounded `(default)` AppMeta projection. App asset sync and
App-admin identity edits maintain both records through the same projection
seam. The browser cannot choose an App id, database, or path, and Firestore
Rules do not need to grant tenant-App creation to clients.

Initialization requires a fully valid environment check in every mode. Dev
mode does not bypass required Firebase configuration, live Storage
reachability, or the App-owned media contract; fix the reported requirement
before creating the canonical App and first administrator membership.

`pnpm audit:app-assets -- --all` audits every registered App against the same
five-asset source, Storage, URL, and dimension contract. It records unavailable
ecosystems as blockers, continues through the fleet, and exits unsuccessfully
while any App is warning, failing, or blocked.

### App source anchors

- `packages/core/fireux-core/src/runtime/pages/apps/create.vue`
- `packages/core/fireux-core/src/runtime/components/App/Create/System.vue`
- `packages/core/fireux-core/src/runtime/components/App/Initialize/System.vue`
- `packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppInitialization.ts`
- `packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts`
- `packages/core/fireux-core/src/runtime/server/utils/app-initialization/initialize.ts`
- `packages/core/fireux-core/src/runtime/server/utils/app-projection/ensure.ts`
- `packages/core/fireux-core/src/runtime/server/api/internal/app/settings.patch.ts`
- `packages/core/fireux-core/src/runtime/models/operations/app-onboarding.ts`
- `packages/core/fireux-core/src/runtime/utils/app-onboarding-policy.ts`
