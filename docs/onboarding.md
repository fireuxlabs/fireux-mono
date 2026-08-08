# User onboarding journey

This is the practical playbook for the shared Core User onboarding journey.

## Experience contract

- `/users/create` is a deliberate three-stage journey: sign in, create the
  canonical User, then connect that User to the active App when allowed.
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

## Current journey paths

- Dashboard notices missing user profile and sends users to:
  - `/users/create`
- Primary onboarding action is now on:
  - `UserCreateSystem` (`packages/core/fireux-core/src/runtime/components/User/Create/System.vue`)
- Legal acceptance is collected in onboarding only (not on `/auth`), in line with the cleaner sign-in flow.

## What “Create core user” should do now

1. User lands on `/users/create`.
2. If no core user exists, they see:
   - checkbox: “I accept the Terms of Service … Privacy Policy”
   - primary action: `Create core user`
3. On click:
   - the onboarding action runs provisioning
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
  - browser/network errors in console for `/api/internal/user/account`
  - whether provisioning stays in `pending` without transition
- There is an alias route for the dashboard-style location:
  - `/dashboard/user/create` -> redirects to `/users/create`

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
   - should exist in Firestore identity database
   - `isPublic` should be `true`
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
3. `users/{uid}/avatar/current` — the User-owned Storage object when the
   default avatar is used.
4. `apps/{appId}/users/{uid}` — only when the active App permits or requires
   the corresponding membership.

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

Quick in-app checks:

- After sign-in, visiting `/dashboard/user/create` should redirect to `/users/create`.
- Clicking `Create core user` should move forward to `/dashboard` (or the active `redirect`
  target), not stop on the same screen.
- In Dashboard:
  - `Finish your User setup` should clear to normal overview only when all required
    records exist.

## Source anchors (edit with care)

- `packages/core/fireux-core/src/runtime/components/Dashboard/Overview.vue`
- `packages/core/fireux-core/src/runtime/components/Auth/System.vue`
- `packages/core/fireux-core/src/runtime/components/User/Create/System.vue`
- `packages/core/fireux-core/src/runtime/pages/users/create.vue`
- `packages/core/fireux-core/src/runtime/pages/dashboard/user/create.vue`
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserComputed.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/firebase/useAuth.ts`
