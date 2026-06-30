import { useNuxtApp } from '#imports'
import { collection } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useCollection,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Ref } from 'vue'
import { computed, watchEffect } from 'vue'
import type {
    ProfileBase,
    ProfileConfig,
} from '../../../../../../models/core/profile.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { UserStorage, type User } from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import { useAppUserCollection } from '../../user/fetch/useAppUserCollection'

type UserSummary = {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
}

type UseProfileCollectionOptions = {
  /**
   * Default false. Collection rows should carry their public user snapshot.
   * Enable only for a deliberate detail/admin surface that needs live User truth.
   */
  hydrateUser?: boolean
}

export function useProfileCollection<
  TProfile extends ProfileBase = ProfileBase
>(config: ProfileConfig, options: UseProfileCollectionOptions = {}) {
  const hydrateUser = options.hydrateUser === true
  const appDb = useFirestore()
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const identityDb = useFirestore(identityDatabaseId)
  const nuxtApp = useNuxtApp()
  const { appId } = useFireUXConfig()
  const { firestoreFetchDoc } = useFirestoreRead({
    databaseId: identityDatabaseId,
  })

  const idFieldOptions = { idField: 'id' } as Record<string, unknown>

  const globalProfiles = useCollection<TProfile>(
    collection(identityDb, config.collectionName) as any,
    idFieldOptions as any
  )

  const localProfiles =
    appId
      ? useCollection<Partial<TProfile>>(
          collection(appDb, AppStorage.collection, appId, config.collectionName) as any,
          idFieldOptions as any
        )
      : null

  const users = hydrateUser ? useAppUserCollection().users : computed<UserSummary[]>(() => [])
  const coreUserRefs = new Map<string, Ref<User | undefined>>()

  const ensureCoreUserRef = (id?: string | null) => {
    if (!id) return undefined
    if (!coreUserRefs.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<User>(UserStorage.rootCollection, id)
      ) as Ref<User | undefined>
      coreUserRefs.set(id, ref)
    }
    return coreUserRefs.get(id)
  }

  const collectProfileUserIds = () => {
    const ids = new Set<string>()
    const appendFrom = (entries?: Array<Partial<TProfile>>) => {
      for (const profile of entries ?? []) {
        if (!profile) continue
        const id = profile.id?.toString().trim()
        if (id) ids.add(id)
      }
    }
    appendFrom(globalProfiles.value as Array<Partial<TProfile>> | undefined)
    if (localProfiles) {
      appendFrom(localProfiles.value as Array<Partial<TProfile>> | undefined)
    }
    return ids
  }

  watchEffect(() => {
    if (!hydrateUser) return

    const ids = collectProfileUserIds()
    ids.forEach((id) => {
      ensureCoreUserRef(id)
    })
  })

  const userMap = computed(() => {
    const map = new Map<string, UserSummary>()
    for (const entry of users.value ?? []) {
      if (!entry?.id) continue
      map.set(entry.id, {
        id: entry.id,
        display_name: entry.display_name,
        avatar: entry.avatar,
        handle: entry.handle,
        email: entry.email,
      })
    }
    return map
  })

  const resolveUserForProfile = (profile?: TProfile) => {
    if (!profile) return undefined
    const id = profile.id
    if (!id) return undefined

    const enriched = userMap.value.get(id)
    if (enriched) {
      return { ...enriched }
    }

    const coreUser = coreUserRefs.get(id)?.value
    if (coreUser) {
      return { ...coreUser }
    }

    return undefined
  }

  const attachUser = (
    entries: TProfile[] | null | undefined
  ): Array<TProfile & { user?: User | UserSummary }> => {
    if (!entries?.length) return []
    if (!hydrateUser) return entries
    return entries.map((profile) => {
      const resolvedUser = resolveUserForProfile(profile)
      if (!resolvedUser) return profile
      return {
        ...profile,
        user: resolvedUser as any,
      } as TProfile & { user?: User | UserSummary }
    })
  }

  // Compatibility name: by default this returns stored profile rows whose
  // `user` summary is expected to be self-contained on the profile document.
  const globalProfilesWithUser = computed<
    Array<TProfile & { user?: User | UserSummary }>
  >(() =>
    attachUser((globalProfiles.value ?? []) as TProfile[])
  )

  const localProfilesWithUser = localProfiles
    ? computed<Array<TProfile & { user?: User | UserSummary }>>(() =>
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
