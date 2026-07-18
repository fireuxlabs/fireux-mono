import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { professionalConfig } from '../config/professionalConfig'
import type { Professional } from '../../../../../../models/profiles/Professional/Professional.model'

// Professional profiles for UI use. Public user summaries live on the profile rows.
export function useProfessionalFetch() {
  const { globalProfiles, localProfiles, pending, error, outcome } =
    useProfileCollection<Professional>(professionalConfig)

  const coreProfessionals = computed(() => globalProfiles.value ?? [])
  const appProfessionals = computed(() => localProfiles?.value ?? [])
  const { byId: coreProfessional } = useCollectionById(coreProfessionals)
  const { byId: appProfessional } = useCollectionById(appProfessionals)

  return {
    coreProfessionals,
    appProfessionals,
    coreProfessional,
    appProfessional,
    pending,
    error,
    outcome,
  }
}
