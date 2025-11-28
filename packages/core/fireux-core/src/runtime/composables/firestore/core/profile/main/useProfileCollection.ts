import { computed } from 'vue'
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import { useUserCollection } from '../../../core/user/main/useUserCollection.ts'

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
