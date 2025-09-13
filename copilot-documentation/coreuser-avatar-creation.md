# coreuser-avatar-creation.md

Purpose: Define a reliable, deterministic default avatar flow for CoreUser so downstream AppUser creation never receives `avatar: undefined`.

Effective: 2025-09-12

Owner: fireux-core

## Problem

- Current AppUser ensure fails if `avatar` is `undefined` in the payload (Firestore rejects undefined fields).
- Some CoreUsers are created without `avatar`. When a tenant tries to derive an AppUser, `ensureAppUser` may copy `avatar` and ends up passing `undefined`.

## Goals

- Ensure every newly-created CoreUser gets a valid `avatar` URL string.
- Do not override a user-provided avatar (from Firebase `photoURL`) once it exists.
- Provide a safe backfill for existing CoreUsers missing avatars.

## When to assign a default avatar

- On CoreUser creation in `ensureCoreUser` when:
  - `authUser.photoURL` is falsy AND current core-user doc has no `avatar`.
- Optional backfill on read (non-blocking): if an existing CoreUser doc is loaded without `avatar`, we may enqueue a backfill task (script) to set it.

## Source of the default avatar

Prefer a deterministic, brand-consistent avatar that:

- Is generated from stable inputs (uid, email, display_name)
- Uses a limited color palette (derived from a hash) and initials
- Is uploaded to storage and referenced by a public URL

Strategies (in order):

1. Generated SVG → PNG in-memory → upload via `useMediaStorage.uploadUserAvatar(file, uid)` to `core-users/{uid}/avatar.png`.
2. If runtime cannot generate image (SSR or missing Canvas APIs), fallback to a static asset path `/images/avatar-default.svg` (shipped with core assets) or a themed SVG template assembled as a data URL and uploaded.

## Contract

Inputs

- auth user: `{ uid: string, email?: string, displayName?: string, photoURL?: string }`

Outputs

- CoreUser doc has an `avatar: string` URL after ensure

Error modes

- Storage not configured → use static default asset path
- Upload failure → fallback to static default, do not write `undefined`

Success criteria

- New CoreUsers always have a non-empty `avatar` string
- Existing CoreUsers are not overwritten if they already have `avatar` or `photoURL`

## Implementation plan

File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts`

1. Add a small helper to generate initials and a color from uid/email:

- `getInitials(nameOrEmail: string): string`
- `hashToColor(uidOrEmail: string): string`

2. Build an SVG avatar (initials centered on colored circle) and turn it into a `Blob` or `File`.

3. Upload to storage with existing media API:

- `const { uploadUserAvatar } = useMediaStorage()`
- Path: core users (e.g., `core-users/{uid}/avatar.png`)

4. In ensure flow:

- If `u.photoURL` exists: include `{ avatar: u.photoURL }` (current behavior)
- Else if no existing avatar: generate + upload; set `{ avatar: uploadedUrl }`
- Ensure we never set `avatar: undefined`

Pseudocode (delta):

```ts
const basePayload: Partial<CoreUser> = {
  id: u.uid,
  email: u.email,
  display_name: u.displayName ?? u.email,
  updated_at: serverTimestamp() as any,
}

const snap = await getDoc(ref)
let avatarUrl: string | undefined =
  u.photoURL || (snap.exists() ? (snap.data() as any)?.avatar : undefined)

if (!avatarUrl) {
  try {
    const svg = makeInitialsSvg({
      text: getInitials(u.displayName || u.email || u.uid),
      bg: hashToColor(u.email || u.uid),
    })
    const file = await svgToPngFile(svg, `avatar-${u.uid}.png`)
    const { uploadUserAvatar } = useMediaStorage()
    avatarUrl = await uploadUserAvatar(file, u.uid)
  } catch (e) {
    // Fallback to static asset; never undefined
    avatarUrl = '/images/avatar-default.svg'
  }
}

const payload = snap.exists()
  ? { ...basePayload, ...(avatarUrl ? { avatar: avatarUrl } : {}) }
  : {
      ...basePayload,
      ...(avatarUrl ? { avatar: avatarUrl } : {}),
      created_at: serverTimestamp() as any,
    }

await setDoc(ref, payload, { merge: true })
```

Helper placement:

- `packages/core/fireux-core/src/runtime/composables/utils/useAvatarTools.ts` (new), or fold minimal helpers into the ensure file for now.

## Backfill plan for existing CoreUsers

Add a script: `scripts/backfill-core-avatars.ts`

- Iterate `core-users` where `avatar` missing or empty
- For each:
  - Generate + upload avatar
  - Update doc with `avatar` URL and `updated_at`
- Run once per environment with admin credentials

Pseudocode outline:

```ts
// pseudo: get all core-users w/o avatar
for (const user of missingAvatarUsers) {
  try {
    const file = await svgToPngFile(
      makeInitialsSvg({ text: initials(user), bg: color(user) }),
      `avatar-${user.id}.png`
    )
    const url = await uploadUserAvatar(file, user.id)
    await updateDoc(doc(db, 'core-users', user.id), {
      avatar: url,
      updated_at: serverTimestamp(),
    })
  } catch (e) {
    await updateDoc(doc(db, 'core-users', user.id), {
      avatar: '/images/avatar-default.svg',
      updated_at: serverTimestamp(),
    })
  }
}
```

## Acceptance criteria

- New CoreUser docs always include a valid `avatar` string
- AppUser ensure no longer throws invalid-argument on `avatar`
- Backfill script updates >95% of existing missing avatars; any remaining are safely set to static fallback

## Notes

- Do not perform network calls during SSR for generation; gate generation to client or Nitro server context where supported, or rely on static fallback.
- Keep colors within brand palette; consider theming by ecosystem if needed.
- Avoid overwriting if user later sets a custom avatar.
