# Profile Creation Report (v1)

Purpose: document the minimal requirements and flow for creating profiles (Chef, Supplier, Employer, Professional) and answer whether a default Core User is sufficient.

## Minimal requirements

- Authenticated Firebase user (uid present)
- Core User recommended fields for best UX:
  - id (uid)
  - email (for fallback name derivation)
  - avatar (URL to core user avatar)
  - display_name (optional; preferred for name derivation)

The canonical creation flow derives:

- name: additionalData.name → currentUser.displayName → email local-part
- avatar: additionalData.avatar → currentUser.photoURL → default avatar

Therefore, the default core user payload you provided for mise6 is sufficient to create any profile:

- id: vPeLJyKkuVZxOI3M6rbsArXKiZD2
- email: mise6@test.com
- avatar: https://.../core-users/<uid>/avatar.jpg
- display_name: "mise6@test.com"

The profile will be created with:

- id: uid
- name: "mise6" (email prefix) unless overridden
- avatar: core user avatar URL
- created_at/updated_at: server timestamps

## What gets written

Global doc: `<collection>/{uid}`

- Minimal fields: `{ id, avatar, name?, ...config.defaultValues, ...additionalData(cleaned), created_at, updated_at }`
- Empties are stripped (undefined, null, empty string/array/object)

Tenant mirror (only if role === 'tenant'): `apps/{appId}/{collection}/{uid}`

- Minimal fields: `{ id, avatar, name?, created_at, updated_at }`
- AppUser.profiles is ensured to include this profile type

## Known issues previously observed

- inject() warning on create click: caused by resolving vue/nuxt/vuefire composables during the click handler. Fixed by capturing dependencies when the composable is instantiated (component setup), not at click time.
- Avatar mismatches: if additionalData.avatar is omitted and currentUser.photoURL is null, we fall back to default avatar; when a Core User avatar exists, currentUser.photoURL should be set (or we can explicitly pass the core avatar URL if required).

## Logging for diagnostics

Creation entry points now log the following to the console:

- [CTA/Chef] Click ensureProfile
- [useProfileCreate] creating profile <type>
- [useChefCreate] creating profile [chef] / success / error (if used)
- [useSupplierCreate] creating profile [supplier] / standardized payload
- [useEmployerCreate] creating profile [employer] / standardized payload / success / error
- [useProfessionalCreate] creating profile [professional] / standardized payload / success / error

Use these logs to trace click → creation flow.

## FAQ

- Q: Do I need to provide name when creating?
  - A: No. We derive it from displayName or email (local-part) if not provided.
- Q: Do we write rich fields on create?
  - A: No. We keep it minimal. Rich fields can be edited in subsequent updates.
- Q: Will tenant mirror be created in global app?
  - A: No. Mirrors are written only when role === 'tenant'.
