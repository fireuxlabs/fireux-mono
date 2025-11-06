// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/main/useProfileComputed.ts
import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from './useProfileFetch.ts'

export function useProfileComputed<TProfile extends Profile = Profile>(
  profileRefs: ProfileRefs<TProfile>
) {
  const { coreProfile: profile } = profileRefs
  return { profile }
}
