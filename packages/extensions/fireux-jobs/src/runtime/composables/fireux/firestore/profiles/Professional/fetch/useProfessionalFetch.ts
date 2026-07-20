// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: expose the exact projected Professional directory source.
import { usePublicProfileCollection } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileCollection'
import type { PublicProfessionalDirectoryProfilePayload } from '../../../../../../models/profiles/Professional/Professional.model'

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
  } = usePublicProfileCollection<PublicProfessionalDirectoryProfilePayload>({
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
