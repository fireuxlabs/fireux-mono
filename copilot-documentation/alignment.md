# Alignment: User vs Professional Editors and Update Composables

This doc compares the minimal User editor with Professional editor and the related update composables to guide alignment work.

## Files and locations

- User editor
  - `packages/core/fireux-core/src/runtime/components/organisms/User/Edit.vue`
- Professional editor
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit.vue`
- Update composables
  - User: `packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts`
  - Professional: `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalUpdate.ts`
  - Chef (tenant): `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts`
  - Supplier (tenant): `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierUpdate.ts`
  - Employer (jobs ext): `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployerUpdate.ts`

## Directory trees

User editor directory:

- packages/core/fireux-core/src/runtime/components/organisms/User/
  - App/
  - Cards/
  - Edit.vue
  - Profile.vue

Professional editor directory:

- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/
  - CTA.vue
  - Cards/
  - Create/
  - Edit.vue
  - Profile.vue

Professional composables directory:

- packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/
  - useProfessional.ts
  - useProfessionalCreate.ts
  - useProfessionalUpdate.ts
  - utils/

Chef editor directory:

- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/
  - CTA.vue
  - Cards/
  - Create/
  - Edit.vue

Supplier composables directory:

- packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/
  - useSupplierCreate.ts
  - useSupplierFilters.ts
  - useSupplierList.ts
  - useSupplierQuickCreate.ts
  - useSupplierUpdate.ts
  - utils/

## Editor contents (minimals)

User Edit.vue (minimal):

```vue
<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="avatar"
        :alt="displayName || 'User'"
        :update-function="onSaveAvatar"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Display Name"
        :firebase-value="displayName"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
        :validation-function="validateDisplayName"
        :formatting-function="formatDisplayName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Handle"
        :firebase-value="handle"
        placeholder="your-handle"
        :update-function="onSaveHandle"
        :validation-function="validateHandle"
        :formatting-function="formatHandle"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const {
  avatar,
  displayName,
  handle,
  updateDisplayName,
  updateAvatar,
  updateHandle,
  validateDisplayName,
  formatDisplayName,
  validateHandle,
  formatHandle,
} = useUser()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
const onSaveHandle = (v: string) => updateHandle(v)
</script>
```

Professional Edit.vue (current):

```vue
<template>
  <ClientOnly>
    <div class="space-y-8">
      <section class="space-y-4">
        <h3 class="text-base font-semibold">Section 1 — Basics</h3>
        <div class="space-y-6">
          <MoleculesFormsFirestoreAvatarPicker
            :src="avatar"
            :alt="displayName || 'Professional'"
            :update-function="onSaveAvatar"
          />
          <MoleculesFormsFirestoreSimpleField
            label="Display Name"
            :firebase-value="displayName"
            placeholder="Enter your display name"
            :update-function="onSaveDisplayName"
            :validation-function="validateDisplayName"
            :formatting-function="formatDisplayName"
          />
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-semibold">Section 2 — Kitchen Experience</h3>
        <MoleculesFormsObjectArray
          label="Kitchen Experience"
          :firebaseValue="props.professional?.kitchen_experience"
        >
          <template #display="{ item, index }">
            <OrganismsProfessionalFieldsKitchenExperience
              :kitchenExperience="item"
              :index="index"
              mode="display"
            />
          </template>
          <template #edit="{ item, index }">
            <OrganismsProfessionalFieldsKitchenExperience
              :kitchenExperience="item"
              :index="index"
              mode="edit"
            />
          </template>
          <template #create>
            <OrganismsKitchenSearchWizard />
          </template>
        </MoleculesFormsObjectArray>
      </section>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { useProfessional } from '../../../../composables/firestore/profiles/Professional/useProfessional'

const props = defineProps<{ professional: Professional | null | undefined }>()

const {
  avatar,
  displayName,
  updateDisplayName,
  updateAvatar,
  validateDisplayName,
  formatDisplayName,
} = useProfessional(props.professional)

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File) => updateAvatar(file, 'auto')
</script>
```

## Update composables

User `useUserUpdate.ts`:

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'
import { useFirestoreUpdate } from '../useFirestoreUpdate'
import { useImageStorage } from '../../firebase/useImageStorage'

type TargetScope = 'auto' | 'core' | 'app'

export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const getUid = () => userRef?.value?.id ?? authRef.value?.uid

  const targetFromScope = (scope: TargetScope) => {
    const id = getUid()
    if (!id) throw new Error('Not signed in and no userRef.id provided')

    if (scope === 'core') return { collection: 'core-users', id }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }

    // auto
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'core-users', id }
  }

  /** low-level writer */
  const updateFieldsScoped = async (
    partial: Partial<User>,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = targetFromScope(scope)
    await updateDocument<User>(collection, id, partial)
  }

  /** Field updaters (scoped) */
  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => updateFieldsScoped({ display_name } as Partial<User>, scope)

  const updateHandle = async (handle: string, scope: TargetScope = 'auto') =>
    updateFieldsScoped({ handle } as Partial<User>, scope)

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = targetFromScope(scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFieldsScoped({ avatar: url } as Partial<User>, scope)
    return url
  }

  return {
    // generic
    updateFields: updateFieldsScoped,

    // scoped helpers
    updateDisplayName,
    updateHandle,
    updateAvatar,
  }
}
```

Professional `useProfessionalUpdate.ts`:

```ts
// Note: All helpers are auto-imported from fireux-core public API by the Nuxt module.

const COLLECTION = 'professionals'

type TargetScope = 'auto' | 'core' | 'app'

export function useProfessionalUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { uploadImage } = useImageStorage()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const targetFromScope = (uid: string, scope: TargetScope) => {
    if (scope === 'core') return { collection: COLLECTION, id: uid }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    // auto → prefer app when tenant
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    return { collection: COLLECTION, id: uid }
  }

  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    await updateDocument(collection, id, { display_name })
  }

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateDocument(collection, id, { avatar: url })
    return url
  }

  return { updateDisplayName, updateAvatar }
}
```

Employer `useEmployerUpdate.ts` (standardized + scoped):

```ts
// Note: All helpers are auto-imported from fireux-core public API by the Nuxt module.

const COLLECTION = 'employers'

type TargetScope = 'auto' | 'core' | 'app'

export function useEmployerUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { uploadImage } = useImageStorage()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const targetFromScope = (uid: string, scope: TargetScope) => {
    if (scope === 'core') return { collection: COLLECTION, id: uid }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    // auto → prefer app when tenant
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    return { collection: COLLECTION, id: uid }
  }

  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    await updateDocument(collection, id, { display_name })
  }

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateDocument(collection, id, { avatar: url })
    return url
  }

  return { updateDisplayName, updateAvatar }
}
```

Employer standardized composables added:

- Computed: `useEmployerComputed.ts` (avatar, displayName)
- Formatting/Validation: `useEmployerFormattingAndValidation.ts` (display name)
- Ensure: `useEmployerEnsure.ts` (create-if-missing; tenant-aware)
- Delete: `useEmployerDelete.ts` (tenant-aware)

Employer editor wiring:

- `Employer/Edit.vue` now formats and validates display name before update; avatar uses updater pathing (with legacy fallback).

Status update:

- Professional: enforced (Computed, Formatting/Validation, Update, Ensure, Delete)
- Employer: enforced (Computed, Formatting/Validation, Update scoped, Ensure, Delete)
- User: existing split composables in core; to mirror ensure/delete shape if needed
- Chef: pending standardization to add Computed/Formatting/Ensure/Delete and optional scope param
- Supplier: pending standardization to add Computed/Formatting/Ensure/Delete and optional scope param

Chef `useChefUpdate.ts`:

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/chef/useChefUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage'

/**
 * Environment-aware updater for a Chef profile.
 *
 * Behavior mirrors `useUserUpdate`:
 * - If `chefRef` provided → writes to that chef's doc (by `id`).
 * - Else → writes to the signed-in user's chef doc.
 *
 * Scopes:
 *   - Global  → chefs/{uid}
 *   - Tenant  → apps/{appId}/chefs/{uid}
 *
 * NOTE:
 * - This composable only WRITES finalized data (e.g. an avatar DOWNLOAD URL).
 * - Uploading is done elsewhere (e.g. your AvatarPicker / storage utilities).
 */
type WithId = { id: string }

export function useChefUpdate(chefRef?: Ref<WithId | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = () => {
    const id = chefRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no chefRef.id provided')
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/chefs`, id }
    }
    return { collection: 'chefs', id }
  }

  /** Generic partial update for arbitrary chef fields */
  const updateFields = async (partial: Record<string, unknown>) => {
    const { collection, id } = resolveTarget()
    await updateDocument(collection, id, partial)
  }

  /** Update display name */
  const updateDisplayName = async (display_name: string) => {
    await updateFields({ display_name })
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (source: Blob | string) => {
    const { collection, id } = resolveTarget()
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url })
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
```

Supplier `useSupplierUpdate.ts`:

```ts
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'

const COLLECTION = 'suppliers'

export function useSupplierUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const updateDisplayName = async (display_name: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { display_name })
  }

  const updateAvatar = async (avatar: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { avatar })
  }

  return { updateDisplayName, updateAvatar }
}
```

Employer `useEmployerUpdate.ts`:

```ts
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'

const COLLECTION = 'employers'

export function useEmployerUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const updateDisplayName = async (display_name: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { display_name })
  }

  const updateAvatar = async (avatar: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { avatar })
  }

  return { updateDisplayName, updateAvatar }
}
```

## Component and composable shape per entity

This section lists the main UI components and the standardized composables set for each entity. Use it as the source of truth when adding or pruning files.

### User (core)

- Components (essential)

  - `packages/core/fireux-core/src/runtime/components/organisms/User/Edit.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/User/Profile.vue`
  - `packages/core/fireux-core/src/runtime/components/organisms/User/Cards/{Pill.vue,Cell.vue,Profile.vue}`
  - `packages/core/fireux-core/src/runtime/components/organisms/User/App/CTA.vue`

- Composables (standardized)
  - `useUserComputed.ts`
  - `useUserFormattingAndValidation.ts`
  - `useUserUpdate.ts` (scoped: auto|core|app)
  - `useUserEnsure.ts`
  - `useUserDelete.ts`

Status: in place (core has all); editors use formatting/validation and scoped updates.

### Professional (jobs extension)

- Components (essential)

  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Profile.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Cards/{Pill.vue,Cell.vue,Profile.vue}`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/CTA.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Create/System.vue`

- Composables (standardized)
  - `useProfessionalComputed.ts`
  - `useProfessionalFormattingAndValidation.ts`
  - `useProfessionalUpdate.ts` (scoped: auto|core|app)
  - `useProfessionalEnsure.ts`
  - `useProfessionalDelete.ts`
  - Transitional: `useProfessional.ts` (combined) — keep until editors swap to direct `useProfessionalUpdate`

Status: enforced; editor wired to computed + formatting/validation and delegates updates (via transitional composable for now).

### Employer (jobs extension)

- Components (essential)

  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Edit.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Profile.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Cards/{Pill.vue,Cell.vue,Profile.vue}`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/CTA.vue`
  - `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/Create/System.vue`

- Composables (standardized)
  - `useEmployerComputed.ts`
  - `useEmployerFormattingAndValidation.ts`
  - `useEmployerUpdate.ts` (scoped: auto|core|app)
  - `useEmployerEnsure.ts`
  - `useEmployerDelete.ts`
  - Existing: `useEmployerCreate.ts`

Status: enforced; editor uses formatting/validation and scoped updater; legacy utils exist (see pruning list).

### Chef (tenant: fireux-misebox)

- Components (essential)

  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Profile.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/{Pill.vue,Cell.vue,Profile.vue}`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Create/System.vue`

- Composables (desired standardized)
  - Add `useChefComputed.ts`
  - Add `useChefFormattingAndValidation.ts` (replace `utils/useChefValidation.ts`)
  - Keep `useChefUpdate.ts` and consider adding optional scope param (auto|core|app) if needed
  - Add `useChefEnsure.ts`
  - Add `useChefDelete.ts`
  - Keep `useChefCreate.ts`; `useChefFilters.ts` stays as feature-specific

Status: pending standardization; see pruning notes below after migration.

### Supplier (tenant: fireux-misebox)

- Components (essential)

  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Page.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/{Pill.vue,Cell.vue,Profile.vue}`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue`
  - `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Create/{System.vue,Quick.vue}`

- Composables (desired standardized)
  - Add `useSupplierComputed.ts`
  - Add `useSupplierFormattingAndValidation.ts` (replace `utils/useSupplierValidation.ts`)
  - Keep `useSupplierUpdate.ts`; consider optional scope param
  - Add `useSupplierEnsure.ts`
  - Add `useSupplierDelete.ts`
  - Keep `useSupplierCreate.ts`, `useSupplierQuickCreate.ts`, `useSupplierFilters.ts`, `useSupplierList.ts`

Status: pending standardization; see pruning notes below after migration.

## Alignment notes

- All update composables converge on the same shape: expose `updateDisplayName(value, scope?)` and `updateAvatar(source, scope?)`.
- The core `useUserUpdate` supports scopes ('auto'|'core'|'app'); the Professional one mirrors this behavior; Chef/Supplier/Employer have simpler (no-scope) versions — candidates to standardize.
- Editors should use composables (`useUser`, `useProfessional`) that expose display values, validators/formatters, and delegate updates to the per-entity update composables.
- For arrays (e.g., languages, kitchen_experience), prefer a shared ObjectArray pattern; scopes: app overlay when tenant, global otherwise, with optional mirror prompt.

## Proposed generic tree (enforced)

Use this template to align entities (User, Professional, Chef, Supplier, Employer, …). Substitute variables:

- ROOT: packages/core/fireux-core | packages/extensions/<ext> | packages/tenants/<tenant>
- ENTITY: User | Professional | Chef | Supplier | Employer
- DOMAIN: KitchenExperience | Languages | Certifications | …

```
ROOT/src/runtime/
  components/
    organisms/
      profiles/
        ENTITY/
          Edit.vue                 # Sectioned editor: basics + domain sections
          Profile.vue              # Read-only profile view or wrapper
          CTA.vue                  # Contextual call-to-actions (optional)
          Create/                  # Creation flows (optional)
          Cards/                   # Card fragments (optional)
          Fields/                  # Domain field renderers for ObjectArray (optional)
            ENTITYFieldsDOMAIN.vue

  composables/
    firestore/
      profiles/
        ENTITY/
          useENTITYComputed.ts                 # computed (readers)
          useENTITYUpdate.ts                   # update
          useENTITYDelete.ts                   # delete
          useENTITYEnsure.ts                   # ensure / create-if-missing
          useENTITYFormattingAndValidation.ts  # formatting + validation

  models/
    profiles/
      ENTITY.model.ts             # Types and config for the profile

  # Shared (core package owns reusable building blocks)
  components/
    molecules/
      forms/
        firestore/
          ObjectArray.vue         # Reusable object array editor
          SimpleField.vue         # Simple text/number/textarea
          AvatarPicker.vue        # Upload to storage + update doc URL
```

Pattern summary:

- Editors import `useENTITY(profile?)` to get display values, validators, and update actions.
- `useENTITYComputed` provides read-side computed state (e.g., avatar, displayName).
- `useENTITYFormattingAndValidation` provides pure helpers with no IO.
- Updates delegate to `useENTITYUpdate`, which supports scope: 'auto' | 'core' | 'app'.
- Domain lists (arrays) use shared `ObjectArray.vue` with slots (display/edit/create) and scoped save.
- Tenants and extensions keep their entity-specific editors/composables under their package ROOT, while core provides shared UI and low-level Firestore/storage utilities.

### Migration checklist per entity

- [ ] Create `useENTITYComputed.ts` exposing computed read fields required by editors.
- [ ] Create `useENTITYFormattingAndValidation.ts` with pure format/validate helpers.
- [ ] Ensure `useENTITYUpdate.ts` supports scope: 'auto' | 'core' | 'app', returns field updaters.
- [ ] Add `useENTITYEnsure.ts` to create-if-missing documents (app/core aware).
- [ ] Add `useENTITYDelete.ts` for safe deletions (soft delete when applicable).
- [ ] Update `Edit.vue` to import computed + formatting/validation, and call update.

## Enforcement status (Professional)

Created under `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/`:

- [x] useProfessionalComputed.ts — avatar, displayName
- [x] useProfessionalFormattingAndValidation.ts — format/validate display name
- [x] useProfessionalUpdate.ts — scoped updates (auto|core|app)
- [x] useProfessionalEnsure.ts — ensure/create-if-missing (FireStore direct, no restricted imports)
- [x] useProfessionalDelete.ts — delete document in current context
- [ ] useProfessionalCreate.ts — already present (no change)

Editor wired:

- `Professional/Edit.vue` now imports computed + formatting/validation and calls updates.

Next up (if needed):

- Replicate this enforced shape for Employer, Supplier, Chef (and unify to accept optional scope where appropriate).
