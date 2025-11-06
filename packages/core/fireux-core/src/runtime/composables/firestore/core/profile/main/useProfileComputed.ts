// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileComputed.ts
import { computed } from 'vue'
import { useUser } from '../../user/useUser.ts'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from './useProfileFetch.ts'

export function useProfileComputed<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>
) {
  const { user } = useUser()

  const profile = computed<TProfile | null>(() => {
    const core = profileRefs.coreProfile.value
    if (!core) return null

    const overlay = profileRefs.appProfile.value ?? {}

    const currentCore = user.coreUser?.value
    const attachedUser = currentCore
      ? {
          id: currentCore.id,
          display_name: currentCore.display_name,
          avatar: currentCore.avatar,
          handle: (currentCore as any)?.handle,
        }
      : {}

    return {
      ...core,
      ...overlay,
      user: attachedUser,
    } as TProfile
  })

  return { profile }
}
