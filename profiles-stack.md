# Profiles Stack

-## Core profile composables (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/`)

### `useProfile.ts`

````ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import type {
  Profile,
  ```ts
  import { computed } from 'vue'
  import type { Ref } from 'vue'
  import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
  import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

  export function useProfessionalComputed(
    profile: ProfileRefs<ProfessionalProfile>,
    pending?: Ref<boolean>
  ) {
    const coreProfile = computed<ProfessionalProfile | null>(
      () =>
        (profile.coreProfile.value as ProfessionalProfile | null | undefined) ??
        null
    )

    const appProfile = computed<ProfessionalProfile | null>(
      () =>
        (profile.appProfile.value as ProfessionalProfile | null | undefined) ??
        null
    )

    const activeProfile = computed<ProfessionalProfile | null>(() => {
      const core = coreProfile.value
      const overlay = appProfile.value
      if (!core && !overlay) return null
      const merged = {} as ProfessionalProfile
      if (core) Object.assign(merged, core)
      if (overlay) Object.assign(merged, overlay)
      return merged
    })

    const hasCoreProfile = computed(() => Boolean(coreProfile.value))
    const hasAppProfile = computed(() => Boolean(appProfile.value))

    const runtimeProfile = computed<ProfessionalProfile | null>(
      () => coreProfile.value
    )

    const isPending = computed(() => Boolean(pending?.value))
    const isLoading = computed(
      () =>
        isPending.value ||
        profile.coreProfile.value === undefined ||
        profile.appProfile.value === undefined
    )

    return {
      profile: activeProfile,
      activeProfile,
      runtimeProfile,
      hasCoreProfile,
      hasAppProfile,
      isPending,
      isLoading,
    }
  }
````

const uid = computed(() => (isRef(id) ? id.value : id))

const coreDoc = computed(() =>
uid.value ? (doc(db, config.collectionName, uid.value) as any) : null
)

const appDoc = computed(() =>
uid.value && isTenant && appId
? (doc(db, 'apps', appId, config.collectionName, uid.value) as any)
: null
)

const { data: coreProfile } = useDocument<TProfile | undefined>(
coreDoc as any
)

const { data: appProfile } = useDocument<Partial<TProfile> | undefined>(
appDoc as any
)

const profile: ProfileRefs<TProfile> = { coreProfile, appProfile }
return { profile }
}

````

### `core/useProfileEnsure.ts`

```ts
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'
import { useUserUpdateForUid } from '../../user/mutations/useUserUpdate.ts'

export function useProfileEnsure(config: ProfileConfig) {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const { isTenant, appId } = useFireUXConfig()

  const ensure = async () => {
    const { uid } = await requireUid()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, config.collectionName, uid)
    if (!(await getDoc(coreRef)).exists()) {
      await setDocument(config.collectionName, uid, { id: uid })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${config.collectionName}`
      const appRef = doc(db, 'apps', appId, config.collectionName, uid)
      if (!(await getDoc(appRef)).exists()) {
        await setDocument(appCollection, uid, { id: uid })
        createdApp = true
      }
    }

    if (config.id) {
      const { core } = useUserUpdateForUid(uid)
      await core.tags.add(config.id)
    }

    return { createdCore, createdApp }
  }

  return { ensure }
}
````

### `mutations/useProfileUpdate.ts`

```ts
import { ref } from 'vue'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from '../main/useProfileFetch.ts'

type UpdateScope = 'auto' | 'core' | 'app'

export function useProfileUpdate<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>,
  config: ProfileConfig
) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId, role } = useFireUXConfig()

  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const isTenant = role === 'tenant' && !!appId

  const ensureId = (explicit?: string | null) => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed
    const coreId = profileRefs.coreProfile.value?.id
    if (coreId) return coreId
    const appIdCandidate = (
      profileRefs.appProfile.value as { id?: string } | null | undefined
    )?.id
    if (appIdCandidate) return appIdCandidate
    throw new Error(
      `[useProfileUpdate] Missing profile id for ${config.collectionName}`
    )
  }

  const updateCoreProfile = async (
    partial: Partial<TProfile>,
    explicitId?: string
  ) => {
    const id = ensureId(explicitId)
    await updateDocument<TProfile>(config.collectionName, id, partial)
  }

  const updateAppProfile = async (
    partial: Partial<TProfile>,
    explicitId?: string
  ) => {
    if (!appId) {
      throw new Error(
        '[useProfileUpdate] Missing appId for tenant profile update'
      )
    }
    const id = ensureId(explicitId)
    const collection = `apps/${appId}/${config.collectionName}`
    await updateDocument(collection, id, partial)
  }

  const updateProfile = async (
    partial: Partial<TProfile>,
    options: { scope?: UpdateScope; id?: string } = {}
  ) => {
    const { scope = 'auto', id } = options
    updating.value = true
    updateError.value = null

    try {
      if (scope === 'core') {
        await updateCoreProfile(partial, id)
      } else if (scope === 'app') {
        await updateAppProfile(partial, id)
      } else if (isTenant) {
        await updateAppProfile(partial, id)
      } else {
        await updateCoreProfile(partial, id)
      }
      return 'success'
    } finally {
      updating.value = false
    }
  }

  return { updateProfile, updateCoreProfile, updateAppProfile, updating }
}
```

### `state/useProfileComputed.ts`

```ts
import { computed } from 'vue'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from '../main/useProfileFetch.ts'

export function useProfileComputed<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>
) {
  const profile = computed<TProfile | null>(() => {
    const core = profileRefs.coreProfile.value
    const overlay = profileRefs.appProfile.value
    if (!core && !overlay) return null
    const base = core ? { ...core } : ({} as Partial<TProfile>)
    if (overlay) Object.assign(base, overlay)
    return base as TProfile
  })
  return { profile }
}
```

### `collection/useProfileCollection.ts`

```ts
import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import { useUserCollection } from '../../user/main/useUserCollection.ts'

export function useProfileCollection<
  TProfile extends Partial<Profile> = Profile
>(config: ProfileConfig) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()

  const idFieldOptions = { idField: 'id' } as Record<string, unknown>

  const globalProfiles = useCollection<TProfile>(
    collection(db, config.collectionName) as any,
    idFieldOptions as any
  )

  const localProfiles =
    isTenant && appId
      ? useCollection<Partial<TProfile>>(
          collection(db, 'apps', appId, config.collectionName) as any,
          idFieldOptions as any
        )
      : null

  const { users } = useUserCollection()
  const userMap = computed(() => {
    const map = new Map<string, Profile['user']>()
    for (const user of users.value ?? []) {
      if (user?.id) map.set(user.id, user)
    }
    return map
  })

  const attachUser = (entries: TProfile[] | null | undefined): TProfile[] => {
    if (!entries?.length) return []
    return entries.map((profile) => {
      const owner = userMap.value.get(profile?.id ?? '')
      if (!owner) return profile
      return {
        ...profile,
        user: profile?.user ? { ...profile.user, ...owner } : owner,
      }
    })
  }

  const globalProfilesWithUser = computed<TProfile[]>(() =>
    attachUser((globalProfiles.value ?? []) as TProfile[])
  )

  const localProfilesWithUser = localProfiles
    ? computed<TProfile[]>(() =>
        attachUser((localProfiles.value ?? []) as TProfile[])
      )
    : null

  return {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  }
}
```

### `delete/useProfileDelete.ts`

```ts
import { ref, type Ref } from 'vue'
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

type ProfileDeleteResult = 'success'

export function useProfileDelete(
  _profile: Ref<unknown>,
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  const deleteProfile = async (): Promise<ProfileDeleteResult> => 'success'

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
```

- Domain layers should expose their own computed/update helpers (see professional/chef/supplier stacks).

## Jobs extension – Professional profile composables (`packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/`)

### `useProfessional.ts`

```ts
import { useProfile } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../models/profiles/Professional.model.ts'
import { useProfessionalComputed } from './main/useProfessionalComputed.ts'

export function useProfessional() {
  const { profile: refs, pending } =
    useProfile<ProfessionalProfile>(professionalConfig)
  const { coreProfile, appProfile } = refs

  return {
    profile: refs,
    coreProfile,
    appProfile,
    pending,
    ...useProfessionalComputed(refs, pending),
  }
}
```

### `main/useProfessionalInterface.ts`

```ts
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
import type {
  ProfessionalProfile,
  ProfessionalCard,
} from '../../../../../models/profiles/Professional.model.ts'

type CtaAction = {
  id: string
  label: string
  to?: string | null
  color?: string
  variant?: string
}

type CtaDescriptor = {
  title: string
  description?: string
  actions: CtaAction[]
}

export function useProfessionalInterface(
  profile: ProfileRefs<ProfessionalProfile>
) {
  const core = () => profile.coreProfile.value ?? null
  const overlay = () => profile.appProfile.value ?? null

  const toPath = (id?: string | null) => (id ? `/professionals/${id}` : '')

  const resolve = (target?: ProfessionalProfile | null) => {
    if (target) return target
    const base = core()
    const app = overlay()
    if (!base && !app) return null
    if (base && app) return { ...base, ...app }
    return base ?? app ?? null
  }

  const badgesFrom = (source?: ProfessionalProfile | null) => {
    if (!source) return [] as string[]
    const { health_certifications, badges, specialties } = source
    if (Array.isArray(health_certifications) && health_certifications.length)
      return health_certifications
    if (Array.isArray(badges) && badges.length) return badges
    if (Array.isArray(specialties) && specialties.length) return specialties
    return [] as string[]
  }

  const specialtiesFrom = (source?: ProfessionalProfile | null) => {
    const list = source?.specialties
    return Array.isArray(list) ? [...list] : []
  }

  const derive = (target?: ProfessionalProfile | null) => {
    const profileValue = resolve(target)
    return {
      id: profileValue?.id ?? '',
      title:
        profileValue?.title ?? profileValue?.display_name ?? 'Professional',
      subtitle: profileValue?.subtitle ?? 'professional',
      avatar: profileValue?.avatar_url ?? profileValue?.avatar ?? '',
      badges: badgesFrom(profileValue),
      specialties: specialtiesFrom(profileValue),
      bioShort: profileValue?.bio_short ?? '',
      bioLong: profileValue?.bio_long ?? '',
    }
  }

  const pillProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Pill => {
    const derived = derive(target)
    return {
      avatar: derived.avatar,
      title: derived.title,
      subtitle: derived.subtitle,
      badges: derived.badges,
      to: derived.id ? toPath(derived.id) : null,
    }
  }

  const cellProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Cell => {
    const derived = derive(target)
    return {
      ...pillProps(target),
      id: derived.id,
      to: derived.id ? toPath(derived.id) : undefined,
      bio_short: derived.bioShort,
      specialties: derived.specialties,
    }
  }

  const profileProps = (
    target?: ProfessionalProfile | null
  ): ProfessionalCard.Profile => {
    const derived = derive(target)
    return {
      ...cellProps(target),
      bio_long: derived.bioLong,
    }
  }

  const ctaFor = (target?: ProfessionalProfile | null): CtaDescriptor => {
    const profileValue = resolve(target)
    if (profileValue) {
      return {
        title: 'Professional profile ready',
        description: 'Keep your experience current so agents can reach out.',
        actions: [
          {
            id: 'edit-professional',
            label: 'Open dashboard',
            to: '/dashboard/professional/profile',
            color: 'primary',
          },
        ],
      }
    }

    return {
      title: 'Create your Professional profile to appear in listings.',
      description: 'Share your experience so agents can learn about you.',
      actions: [
        {
          id: 'create-professional',
          label: 'Create Professional Profile',
          to: '/dashboard/professional/profile',
          color: 'primary',
        },
      ],
    }
  }

  return { pillProps, cellProps, profileProps, ctaFor }
}
```

### `main/useProfessionalComputed.ts`

```ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalComputed(
  profile: ProfileRefs<ProfessionalProfile>,
  pending?: Ref<boolean>
) {
  const coreProfile = computed<ProfessionalProfile | null>(
    () =>
      (profile.coreProfile.value as ProfessionalProfile | null | undefined) ??
      null
  )

  const appProfile = computed<Partial<ProfessionalProfile> | null>(
    () =>
      (profile.appProfile.value as
        | Partial<ProfessionalProfile>
        | null
        | undefined) ?? null
  )

  const activeProfile = computed<ProfessionalProfile | null>(() => {
    const core = coreProfile.value
    const overlay = appProfile.value
    if (!core && !overlay) return null
    const merged = {} as ProfessionalProfile
    if (core) Object.assign(merged, core)
    if (overlay) Object.assign(merged, overlay)
    return merged
  })

  const hasCoreProfile = computed(() => Boolean(coreProfile.value))
  const hasAppProfile = computed(() => Boolean(appProfile.value))

  const runtimeProfile = computed<ProfessionalProfile | null>(
    () => coreProfile.value
  )

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () =>
      isPending.value ||
      profile.coreProfile.value === undefined ||
      profile.appProfile.value === undefined
  )

  return {
    profile: activeProfile,
    activeProfile,
    runtimeProfile,
    hasCoreProfile,
    hasAppProfile,
    isPending,
    isLoading,
  }
}
```

### `main/useProfessionalCollection.ts`

```ts
import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/collection/useProfileCollection.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalCollection() {
  const { profiles, global, local } =
    useProfileCollection<ProfessionalProfile>(professionalConfig)

  return { professionals: profiles, global, local }
}
```

### `main/useProfessionalCreate.ts`

```ts
import { ref, type Ref } from 'vue'
import { useProfileEnsure } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/core/useProfileEnsure.ts'
import { professionalConfig } from '../../../../../models/profiles/Professional.model.ts'

type CreateProfessionalHandler = ((
  patch?: Record<string, unknown>
) => Promise<unknown>) & {
  readonly state: Ref<boolean>
}

export function useProfessionalCreate() {
  const { ensure } = useProfileEnsure(professionalConfig)
  const creating = ref(false)

  const createProfessional = (async (patch: Record<string, unknown> = {}) => {
    if (creating.value) return undefined
    creating.value = true
    try {
      return await ensure({ domain: 'professional', ...patch })
    } finally {
      creating.value = false
    }
  }) as CreateProfessionalHandler

  Object.defineProperty(createProfessional, 'state', {
    get: () => creating,
    enumerable: true,
  })

  return { createProfessional }
}
```

### `main/useProfessionalDelete.ts`

```ts
import { useFirestore } from 'vuefire'
import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useProfessionalDelete(
  _profile: ProfileRefs<ProfessionalProfile>
) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('Not authenticated')
    return u.uid
  }

  const deleteAtPath = async (collection: string, id: string) => {
    await deleteDoc(doc(db, collection, id))
  }

  const deleteProfessional = async (options?: {
    scope?: DeleteScope
    id?: string
  }) => {
    const scope = options?.scope ?? 'auto'
    const id = await resolveUid(options?.id)

    if (
      scope === 'core' ||
      scope === 'both' ||
      (!isTenant && scope === 'auto')
    ) {
      await deleteAtPath('professionals', id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (isTenant && scope === 'auto')

    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for tenant-scoped delete')
      await deleteAtPath(`apps/${appId}/professionals`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = isTenant ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteProfessional }
}
```

### `main/useProfessionalUpdate.ts`

```ts
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { usePlaceSave } from 'fireux-places/runtime/composables/usePlaceSave.ts'
import { useFirestore } from 'vuefire'
import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/usePlacesGoogle.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
  ProfessionalProfile,
} from '../../../../../models/profiles/Professional.model.ts'

const COLLECTION = 'professionals'

export function useProfessionalUpdate(
  _profile?: ProfileRefs<ProfessionalProfile>
) {
  const { updateDocument } = useFirestoreUpdate()
  const { ensurePlaceExists } = usePlaceSave()
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  type UpdateOptions = { id?: string | null }

  const resolveUid = async (explicit?: string | null): Promise<string> => {
    if (explicit?.trim()) return explicit.trim()
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const updateCoreProfessional = async (
    payload: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await updateDocument(COLLECTION, uid, payload)
  }

  const updateAppProfessional = async (
    payload: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        'Missing tenant context for app-scoped professional update'
      )
    }
    const uid = await resolveUid(options.id)
    await updateDocument(`apps/${appId}/${COLLECTION}`, uid, payload)
  }

  async function setRelevantExperience(
    items: RelevantExperienceItem[] = []
  ): Promise<void> {
    const uid = await resolveUid()

    const professionalRef = doc(db, COLLECTION, uid)
    const snapshot = await getDoc(professionalRef)
    const previousItems = Array.isArray(snapshot.data()?.relevant_experience)
      ? (snapshot.data()?.relevant_experience as RelevantExperienceItem[])
      : []

    const previousPlaceIds = new Set(
      previousItems
        .map((item) => canonicalPlaceId(item?.place_id ?? undefined))
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )

    const sanitized: RelevantExperienceItem[] = []
    const roster = new Map<string, boolean>()

    for (const item of items) {
      const placeId = canonicalPlaceId(item?.place_id ?? undefined)
      if (!placeId) continue

      const normalized: RelevantExperienceItem = {
        ...item,
        place_id: placeId,
        ongoing: item?.ongoing === true,
      }

      sanitized.push(normalized)

      if (roster.get(placeId) === true) continue
      roster.set(placeId, normalized.ongoing === true)
    }

    const newPlaceIds = new Set(roster.keys())

    const removalTargets = [...previousPlaceIds].filter(
      (placeId) => !newPlaceIds.has(placeId)
    )

    const placeTasks: Promise<void>[] = []

    for (const [placeId, isCurrent] of roster) {
      await ensurePlaceExists({
        place_id: placeId,
        name: '(unknown)',
        formatted_address: '',
        lat: 0,
        lng: 0,
        source: 'firestore',
        search_term: placeId,
        created_at: new Date(),
      } as any)

      placeTasks.push(
        updateDocument('places', placeId, {
          professionals_current: isCurrent ? arrayUnion(uid) : arrayRemove(uid),
          professionals_alumni: isCurrent ? arrayRemove(uid) : arrayUnion(uid),
        })
      )
    }

    for (const placeId of removalTargets) {
      placeTasks.push(
        updateDocument('places', placeId, {
          professionals_current: arrayRemove(uid),
          professionals_alumni: arrayRemove(uid),
        })
      )
    }

    await Promise.all(placeTasks)

    await updateCoreProfessional(
      {
        relevant_experience: sanitized,
      },
      { id: uid }
    )
  }

  async function setOtherExperience(
    items: OtherExperienceItem[] = []
  ): Promise<void> {
    const uid = await resolveUid()

    const normalized = items.map((item) => ({
      ...item,
      place_id: item.place_id
        ? canonicalPlaceId(item.place_id) ?? null
        : undefined,
    }))

    await updateCoreProfessional(
      {
        other_experience: normalized,
      },
      { id: uid }
    )
  }

  return {
    updateCoreProfessional,
    updateAppProfessional,
    setRelevantExperience,
    setOtherExperience,
  }
}
```

### `main/useProfessionalCollection.ts`

```ts
import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/collection/useProfileCollection.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../../models/profiles/Professional.model.ts'

export function useProfessionalCollection() {
  const { profiles, global, local } =
    useProfileCollection<ProfessionalProfile>(professionalConfig)

  return { professionals: profiles, global, local }
}
```

### `main/useProfessionalDelete.ts`

```ts
import { useFirestore } from 'vuefire'
import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/main/useProfileFetch.ts'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional.model.ts'

type DeleteScope = 'auto' | 'core' | 'app' | 'both'

export function useProfessionalDelete(
  _profile: ProfileRefs<ProfessionalProfile>
) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  const resolveUid = async (explicitId?: string) => {
    if (explicitId) return explicitId
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('Not authenticated')
    return u.uid
  }

  const deleteAtPath = async (collection: string, id: string) => {
    await deleteDoc(doc(db, collection, id))
  }

  const deleteProfessional = async (options?: {
    scope?: DeleteScope
    id?: string
  }) => {
    const scope = options?.scope ?? 'auto'
    const id = await resolveUid(options?.id)

    if (
      scope === 'core' ||
      scope === 'both' ||
      (!isTenant && scope === 'auto')
    ) {
      await deleteAtPath('professionals', id)
    }

    const deleteAppScope =
      scope === 'app' || scope === 'both' || (isTenant && scope === 'auto')

    if (deleteAppScope) {
      if (!appId) throw new Error('Missing appId for tenant-scoped delete')
      await deleteAtPath(`apps/${appId}/professionals`, id)
    }

    let effectiveScope: DeleteScope = scope
    if (scope === 'auto') {
      effectiveScope = isTenant ? 'app' : 'core'
    }

    return { id, scope: effectiveScope }
  }

  return { deleteProfessional }
}
```

### `main/useProfessionalUpdate.ts`

```ts
// code listed above (see section)
```

### `main/useProfessionalCollection.ts`

```ts
// code listed above (see section)
```

### `main/useProfessionalCreate.ts`

```ts
// code listed above (see section)
```

### `main/useProfessionalDelete.ts`

```ts
// code listed above (see section)
```

## Notes & next steps

- Core profile stack now surfaces only generic primitives (fetch, ensure, delete, collection, auth wiring).
- Domain layers (professional/chef/supplier/etc.) own their computed + update logic.
- Professional stack still exposes `useProfessionalComputed` for legacy consumers; migrate remaining callers to the lean `useProfessional()` signature.

## Jobs extension – Agent profile composables (`packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/`)

### Top-level entry

- `useAgent.ts` – lightweight wrapper around `useProfile` that exposes raw `ProfileRefs` for agent documents using `agentConfig`.

### Main helpers (`.../Agent/main/`)

- `useAgentInterface.ts` – maps agent data into pill, cell, and profile card props for UI components.
- `useAgentComputed.ts` – merges core and app agent documents and exposes `activeProfile` plus existence flags.
- `useAgentCollection.ts` – delegates to `useProfileCollection` and returns `{ agents, global, local }` streams.
- `useAgentCreate.ts` – calls the shared ensure stub to create a tenant overlay and exposes a `createAgent.state` ref.
- `useAgentUpdate.ts` – updates core or tenant agent documents and includes helpers for nested fields.
- `useAgentDelete.ts` – removes agent docs across scopes after resolving the active uid.

### Utility helpers

- `utils.ts` – agent-specific formatting helpers used by cards and edit flows.

### Key runtime consumers

- `packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue` – pulls `useAgent()`, `useAgentInterface()`, collection helpers, and create handler to render the roster and CTA.
- `packages/extensions/fireux-jobs/src/runtime/pages/agents/[id].vue` – loads agent config for detail routes.
- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent-profile.vue` – merges profile refs locally for the dashboard editor and shows an `error` fallback when missing.
- `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Agent/**/*` – cards, CTA, create, and edit components that consume `pillProps`, `cellProps`, `profileProps`, and update helpers.

## Misebox tenant – Chef profile composables (`packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/`)

### Top-level entry

- `useChef.ts` – composes the chef facade by combining `useProfile`, computed/collection/interface helpers, plus create/update/delete handlers into a single return object.

### Main helpers (`.../Chef/main/`)

- `useChefComputed.ts` – merges core and tenant chef documents and exposes `activeProfile`, status flags, and derived refs.
- `useChefInterface.ts` – returns pill, cell, and profile prop builders for chef UI components.
- `useChefCollection.ts` – streams global and local chef lists and merges them, mirroring the shared collection helper.
- `useChefCreate.ts` – wraps the ensure stub with a busy flag for CTA buttons.
- `useChefUpdate.ts` – applies mutations to chef documents in the correct scope.
- `useChefDelete.ts` – removes chef documents across scopes.

### Utility helpers

- `utils.ts` – formatting helpers for chef names, experience, and bios.

### Key runtime consumers

- `packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue` – uses the aggregated `useChef()` return to render directories, pills, and create actions.
- `packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/[id].vue` – config-backed detail route.
- `packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue` – presents merged chef profile data with an `error` fallback when absent.
- `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/**/*` – cards, CTA, create, and edit modules wired to the chef interface helpers.

## Misebox tenant – Supplier profile composables (`packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/`)

### Top-level entry

- `useSupplier.ts` – minimal wrapper around `useProfile` that exposes raw supplier `ProfileRefs` via `supplierConfig`.

### Main helpers (`.../Supplier/main/`)

- `useSupplierInterface.ts` – maps supplier profiles into pill, cell, and profile props.
- `useSupplierComputed.ts` – merges core and tenant supplier documents and exposes `activeProfile` with status flags.
- `useSupplierCollection.ts` – streams supplier lists for global and tenant scopes and merges them.
- `useSupplierCreate.ts` – ensure wrapper with loading ref for CTA buttons.
- `useSupplierUpdate.ts` – updates supplier documents across scopes.
- `useSupplierDelete.ts` – deletes supplier documents after resolving scope and uid.
- `useSupplierList.ts` – convenience helper for listing suppliers in lightweight contexts.
- `useSupplierQuickCreate.ts` – streamlined creator for modal-driven supplier onboarding flows.

### Utility helpers

- `utils.ts` – supplier-centric formatting helpers (names, contact info, catalogs).

### Key runtime consumers

- `packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue` – stitches together supplier interface helpers, collection streams, and create handler.
- `packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/[id].vue` – config-backed supplier detail view.
- `packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue` – merges supplier refs for the dashboard editor with an `error` fallback state.
- `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/**/*` – cards, CTA, quick-create, and edit components consuming supplier interface helpers.
