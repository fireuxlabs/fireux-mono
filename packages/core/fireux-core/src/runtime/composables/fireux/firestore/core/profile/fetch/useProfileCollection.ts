import { computed, watchEffect } from 'vue'
import { collection } from 'firebase/firestore'
import { useNuxtApp } from '#imports'
import { useFirestore, useCollection } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import type {
  CoreProfileBase,
  ProfileConfig,
} from '../../../../../../models/core/profile.model'
import { useUserCollection } from '../../user/fetch/useUserCollection'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import type { Ref } from 'vue'
import type { User } from '../../../../../../models/core/user.model'

type UserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export function useProfileCollection<
  TProfile extends CoreProfileBase = CoreProfileBase
>(config: ProfileConfig) {
  const db = useFirestore()
  const nuxtApp = useNuxtApp()
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchDoc } = useFirestoreRead()

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
  const coreUserRefs = new Map<string, Ref<User | undefined>>()

  const ensureCoreUserRef = (id?: string | null) => {
    if (!id) return undefined
    if (!coreUserRefs.has(id)) {
      const ref = nuxtApp.runWithContext(() =>
        firestoreFetchDoc<User>('users', id)
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
    return entries.map((profile) => {
      const resolvedUser = resolveUserForProfile(profile)
      if (!resolvedUser) return profile
      return {
        ...profile,
        user: resolvedUser as any,
      } as TProfile & { user?: User | UserSummary }
    })
  }

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

