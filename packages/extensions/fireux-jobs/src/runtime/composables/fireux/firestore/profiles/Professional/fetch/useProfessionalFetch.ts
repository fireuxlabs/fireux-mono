// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: expose the exact projected Professional directory source.
import { useProfileDirectoryCollection } from 'fireux-core/runtime/user/composables/profile/useProfileDirectoryCollection'
import type { ProfessionalDirectoryProfilePayload } from '../../../../../../utils/profiles/Professional/professional'

// Professional profiles for UI use. Public identity joins canonical User by profile uid.
export function useProfessionalFetch() {
  const {
    profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  } = useProfileDirectoryCollection<ProfessionalDirectoryProfilePayload>({
    collection: 'professionals',
  })

  return {
    coreProfessionals: profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: expose canonical User hydration for Professional rows.
