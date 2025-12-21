import { computed } from 'vue'
import type { Profile } from '../../../../../../../models/core/profile.model'
import type { ProfileRefs } from '../../fetch/useProfileFetch'

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
