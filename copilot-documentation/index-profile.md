# Profile Index Split: Page, Root, and Composable

This document captures the current implementation of the profile listing split between the tenant page (`chefs/index.vue`), the reusable core component (`Profile/Root.vue`), and the data composable (`useProfile.ts`). It includes file contents (as of this commit) and notes on responsibilities, API, and usage.

---

## Responsibilities at a glance

- Page (tenants: `pages/<domain>/index.vue`)
  - Orchestrates CTAs and selects scope.
  - Delegates listing and navigation to `OrganismsProfileRoot`.
- Root (`Profile/Root.vue`)
  - Computes `current` and `list` from `useProfile(config)`.
  - Displays current card/pill and the list via slots.
  - Provides a `navigate(profile)` helper to slots.
- Composable (`useProfile.ts`)
  - Data-only: exposes refs for current docs and collections.
  - Provides ensure helpers and `fetchById`.

---

## Files and contents

### 1) tenants/misebox: `pages/chefs/index.vue`

```vue
<!-- packages/tenants/.../pages/chefs/index.vue -->
<template>
  <div class="page space-y-4">
    <!-- CTAs (unchanged) -->
    <OrganismsUserCoreCTA v-if="!coreUser" />
    <OrganismsUserAppCTA v-if="appTenancy === 'tennant' && !appUser" />
    <OrganismsProfilesChefCTA
      v-if="coreUser && (appTenancy !== 'tennant' || appUser)"
    />

    <!-- Scope toggle (tenant can switch between Local and Global) -->
    <div class="flex gap-2">
      <UButton
        :variant="pageScope === 'app' ? 'solid' : 'ghost'"
        @click="setScope('app')"
      >
        Local Chefs
      </UButton>
      <UButton
        :variant="pageScope === 'ecosystem' ? 'solid' : 'ghost'"
        @click="setScope('ecosystem')"
      >
        Global Chefs
      </UButton>
    </div>

    <!-- Profiles list -->
    <OrganismsProfileRoot :config="chefConfig" :scope="pageScope">
      <template #profile-pill="{ profile, navigate }">
        <div @click="navigate(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsPill :chef="profile" />
        </div>
      </template>

      <template #profile-card="{ profile, navigate }">
        <div @click="navigate(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsProfile :chef="profile" />
        </div>
      </template>

      <template #profile-item="{ profile, navigate }">
        <div @click="navigate(profile)" class="cursor-pointer">
          <OrganismsProfilesChefCardsCell :chef="profile" />
        </div>
      </template>
    </OrganismsProfileRoot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useCoreUser } from 'fireux-core/runtime/composables/firestore/CoreUser/useCoreUser'
import { useAppUser } from 'fireux-core/runtime/composables/firestore/AppUser/useAppUser'

const { appTenancy } = useApp()
const { coreUser } = useCoreUser()
const { appUser } = useAppUser()

const pageScope = ref<'app' | 'ecosystem'>('app')
function setScope(next: 'app' | 'ecosystem') {
  pageScope.value = next
}
</script>
```

Notes

- Index page is now copy-paste friendly for other profile domains; swap in the domain `config` and reuse the same slots.
- Routing is centralized in Root via the slot `navigate` helper.

---

### 2) core: `components/organisms/Profile/Root.vue`

```vue
<template>
  <div class="profile-page">
    <!-- Current user blocks -->
    <template v-if="showCurrent && current">
      <slot name="profile-pill" :profile="current" :navigate="navigate" />
      <slot name="profile-card" :profile="current" :navigate="navigate" />
    </template>

    <!-- List -->
    <template v-if="list?.length">
      <template v-for="p in list" :key="p.id || p.uid">
        <slot name="profile-item" :profile="p" :navigate="navigate" />
      </template>
    </template>
    <p v-else class="opacity-70">No profiles yet.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfile } from '../../../composables/firestore/profiles/useProfile'
import { useRouter } from 'vue-router'

const props = defineProps<{
  config: any
  scope?: 'ecosystem' | 'app' | 'auto'
  showCurrent?: boolean
}>()

const resolvedScope = computed(() => props.scope ?? 'ecosystem')
const showCurrent = computed(() => props.showCurrent ?? true)

const { ecosystemProfile, appProfile, ecosystemCollection, appCollection } =
  useProfile(props.config)

const current = computed(
  () => appProfile?.value || ecosystemProfile?.value || null
)

const list = computed(() => {
  const s = resolvedScope.value
  if (s === 'ecosystem') return ecosystemCollection?.value || []
  if (s === 'app') return appCollection?.value || []
  // auto
  const appList = appCollection?.value || []
  return appList.length ? appList : ecosystemCollection?.value || []
})

const router = useRouter()
function navigate(profile: any) {
  const id = profile?.id || profile?.uid
  if (id) router.push(`/${props.config.collectionName}/${id}`)
}
</script>
```

Notes

- API: `config`, `scope = 'ecosystem' | 'app' | 'auto'`, `showCurrent = boolean`.
- Slots receive `{ profile, navigate }` and can render pills/cards/items however needed.
- Navigation assumes `config.collectionName` equals the route segment; add an optional `basePath` prop later if necessary.
- Includes a basic empty-state paragraph; can be replaced with a named slot in the future.

---

### 3) core: `composables/firestore/profiles/useProfile.ts`

```ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'
import { useFireUXConfig } from '../../FireUXConfig'

// ...types omitted for brevity...

export function useProfile(
  config: ProfileConfig,
  opts: UseProfileOptions = {}
) {
  const load = { ...DEFAULT_LOAD, ...(opts.load || {}) }
  const prefer = opts.prefer || 'app'

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const uid = computed(() => currentUser.value?.uid || null)

  const ecosystemProfile = load.ecosystemDoc
    ? useDocument(
        computed(() =>
          uid.value ? doc(db, config.collectionName, uid.value) : null
        )
      ).data
    : undefined

  const appProfile = load.appDoc
    ? useDocument(
        computed(() =>
          uid.value && appId
            ? doc(db, 'apps', appId, config.collectionName, uid.value)
            : null
        )
      ).data
    : undefined

  let ecosystemCollection = load.ecosystemCollection
    ? firestoreFetchCollection(config.collectionName)
    : undefined

  let appCollection =
    load.appCollection && appId
      ? firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)
      : undefined

  function ensureEcosystemCollection() {
    ecosystemCollection ??= firestoreFetchCollection(config.collectionName)
    return ecosystemCollection
  }

  function ensureAppCollection() {
    if (appId) {
      appCollection ??= firestoreFetchCollection(
        `apps/${appId}/${config.collectionName}`
      )
    }
    return appCollection
  }

  const fetchById = (id: string) => firestoreFetchDoc(config.collectionName, id)

  const current = computed(() => {
    const appVal = appProfile?.value || null
    const ecoVal = ecosystemProfile?.value || null
    return prefer === 'app' ? appVal || ecoVal : ecoVal || appVal
  })

  const create = useProfileCreate(config)
  const remove = useProfileDelete(config)
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    ecosystemProfile,
    appProfile,
    current,
    ecosystemCollection,
    appCollection,
    ensureEcosystemCollection,
    ensureAppCollection,
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
```

Notes

- Fully aligned with the desired API. App and ecosystem collections are available along with ensure helpers.
- `current` is computed based on `prefer` (default 'app'). Pages/Root don’t need to pass `prefer` unless they want to override this default.

---

## Validation

- Typecheck: both core and tenant packages pass (`pnpm tsc -p packages/core/fireux-core/tsconfig.json --noEmit` and `pnpm tsc -p packages/tenants/fireux-misebox/tsconfig.json --noEmit`).
- Runtime: navigation uses Vue Router push; if tenants need different paths, we can add `basePath` as an optional prop to Root.

---

## Quick usage recipe (copyable)

```vue
<template>
  <OrganismsProfileRoot :config="someProfileConfig" scope="auto">
    <template #profile-item="{ profile, navigate }">
      <YourCard :data="profile" @click="navigate(profile)" />
    </template>
  </OrganismsProfileRoot>
</template>
```

---

If you want, I can extend Root with optional `loading` and `empty` slots next and replicate this pattern for other domains (Suppliers, Professionals, Employers).
