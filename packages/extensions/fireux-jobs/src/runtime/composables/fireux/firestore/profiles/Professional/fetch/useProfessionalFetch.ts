// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: replace raw Professional/User collection reads with the bounded API.
import { usePublicProfileCollection } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import type { Professional } from '../../../../../../models/profiles/Professional/Professional.model'

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
  } = usePublicProfileCollection<Professional>({ collection: 'professionals' })

  const coreProfessionals = profiles
  const appProfessionals = computed<Professional[]>(() => [])
  const { byId: coreProfessional } = useCollectionById(coreProfessionals)
  const { byId: appProfessional } = useCollectionById(appProfessionals)

  return {
    coreProfessionals,
    appProfessionals,
    coreProfessional,
    appProfessional,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: expose canonical User hydration for Professional rows.
