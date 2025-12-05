import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import { useUserCollection } from '../../user/main/useUserCollection.ts'
import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type { Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useProfileCollection<
  TProfile extends Partial<Profile> = Profile
>(config: ProfileConfig) {
  const db = useFirestore()
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
      coreUserRefs.set(id, firestoreFetchDoc<User>('users', id))
    }
    return coreUserRefs.get(id)
  }

  const userMap = computed(() => {
    const map = new Map<string, Profile['user']>()
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
    const profileUser = profile.user
    const id = profileUser?.id ?? profile.id
    if (!id) return profileUser

    const enriched = userMap.value.get(id)
    if (enriched) {
      return { ...(profileUser ?? {}), ...enriched }
    }

    const coreUser = ensureCoreUserRef(id)?.value
    if (coreUser) {
      return { ...(profileUser ?? {}), ...coreUser }
    }

    return profileUser
  }

  const attachUser = (entries: TProfile[] | null | undefined): TProfile[] => {
    if (!entries?.length) return []
    return entries.map((profile) => {
      const resolvedUser = resolveUserForProfile(profile)
      if (!resolvedUser) return profile
      return {
        ...profile,
        user: resolvedUser,
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
