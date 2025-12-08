import { computed } from 'vue'
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from '../../fetch/useProfileFetch.ts'

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
