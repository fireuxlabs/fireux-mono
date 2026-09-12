# Entity onboarding journeys

This is the practical playbook for shared Core entity onboarding journeys.

## Project onboarding boundary

- Project is a FireUX control-plane entity. `/projects` publishes only active
  identity and presentation; the FireUX App's `/` route is its Project
  Workspace landing, while private operations remain under
  `/workspace/project/*`.
- Canonical `fireux/projects/{projectId}` owns Project identity and
  presentation. Each Firebase host keeps one bounded
  `(default)/project/{projectId}` ProjectMeta routing projection.
- The Workspace may create an inactive empty Project shell and its caller-owned
  Team record in one trusted transaction. That shell has no provisioned named
  product database, so it has no ProjectMeta routing projection yet. Activation,
  identity changes after provisioning, and deletion remain guarded provisioning
  operations that synchronize every required local ProjectMeta through the
  explicit migration/MCP lane; no browser endpoint mutates either side.
- The minimal Workspace operations are Identity, Apps, Ecosystem, and Team. Team
  reads the Project-owned `projects/{projectId}/team/{uid}` access record. Do
  not add Project notifications until the notification
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
- Successful sign-in opens `/dashboard`.
- `/users/create` and `/apps/create` are protected doorways. Their client auth
  guard sends guests to `/auth`; sign-in does not retain the previous doorway.

## Current journey paths

- Dashboard notices a missing User and sends the authenticated person to
  `/users/create`.
- A protected entity doorway such as `/apps/create` first returns through
  `/users/create` when the authenticated identity has no canonical User.
- Primary onboarding action is now on:
  - `UserCreateSystem` (`packages/core/fireux-core/src/runtime/user/components/Create/System.vue`)
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
  - `users/{uid}/avatar/current`
- The saved Firebase Storage URL is then written to the canonical user document (`users/{uid}.avatar`).
- If you clear/reset a user avatar in profile-edit flows, the same storage default is re-applied rather than writing the local `/img/...` fallback directly.

## Notes for next session

- If the button appears to do nothing, check:
  - whether Terms checkbox is checked
  - browser/network errors in workspace for `/api/internal/user/account`
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
   - `avatar` should be a real URL (not missing/empty)
2. `users/{uid}` canonical record
   - should exist in the Firestore identity database
   - should contain `handle`, `display_name`, `bio`, `avatar`, and stamps
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
3. `users/{uid}/avatar/current` — the User-owned Storage object for either the
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
- `packages/core/fireux-core/src/runtime/user/components/Create/System.vue`
- `packages/core/fireux-core/src/runtime/pages/users/create.vue`
- `packages/core/fireux-core/src/runtime/pages/dashboard/user/create.vue`
- `packages/core/fireux-core/src/runtime/user/composables/useUserSessionState.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firebase/useAuth.ts`
- `packages/core/fireux-core/src/runtime/utils/onboarding-route.ts`

## App creation and runtime initialization

The supported browser App-creation tool is FireUX's Project Apps capability at
`/workspace/project/apps`. Its trusted Project command saves an inactive App and
initial membership and returns a minimal HTML preview. It does not provision
hosting, a new database or authentication infrastructure.

Core's `/apps/create` shows an explicit unavailable state. The former local
name/slug/review form and its placement policy are retired because they never
submitted an App. Main Apps must provide an actual supported workflow before
advertising creation. Core does not import Project to coordinate that workflow.

Runtime initialization remains a separate internal recovery operation.
Initialization authenticates the configured developer and atomically creates
the fixed runtime App plus its first App-admin membership in the named database
through the Server mutation lane. The browser cannot choose an App
id, database, or path, and Firestore Rules do not need to grant tenant-App
creation to clients.

Initialization is not the whole onboarding state. The App-owned
`public/img/app/*` family is the bundled runtime source; its five identity
masters must also be published to canonical Firebase Storage paths and their
URLs recorded in `App.media.*`. Firestore stores those URLs, not the binaries.
The Storage publication lets Ecosystems, directories and other Apps render the
brand without access to the owning bundle. App-admin identity edits maintain
the canonical App through the trusted Server writer.

The App Shell initialization blocker is shown only while the canonical App
record is missing. It must still distinguish the wider stages: `initialized`
means the App and first administrator exist, `media published` means the five
Storage objects and URLs exist, and `fully onboarded` means those stages plus
any required semantic palette are complete. Missing publication remains an
explicit retryable setup action; it does not reopen the initialization
blocker. Green environment checks prove that the configured source is ready
for the next required action; they do not prove that remote publication has
already happened.

Initialization requires a fully valid environment check in every mode. Dev
mode does not bypass required Firebase configuration, live Storage
reachability, or the App-owned media contract; fix the reported requirement
before creating the canonical App and first administrator membership.

The historical App-media audit command has been removed. Current command tests
and owner source establish upload/attachment behavior. Media sync writes a
unique immutable revision for each image, then attaches its URL. Failed or
concurrent operations preserve existing URLs; superseded or unattached revisions
are retained. No Storage cleanup or live verification is implied by these tests.

### App source anchors

- `packages/core/fireux-core/src/runtime/project/components/Workspace/Capabilities/Apps/Create.vue`

- `packages/core/fireux-core/src/runtime/pages/apps/create.vue`
- `packages/core/fireux-core/src/runtime/app/components/Initialize/System.vue`
- `packages/core/fireux-core/src/runtime/app/composables/utils/useAppInitialization.ts`
- `packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts`
- `packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts`
- `packages/core/fireux-core/src/runtime/app/server/projection/ensure.ts`
- `packages/core/fireux-core/src/runtime/server/api/internal/app/settings.patch.ts`
