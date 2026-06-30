import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { professionalConfig } from '../config/professionalConfig'
import type { Professional } from '../../../../../../models/profiles/Professional/Professional.model'

// Professional profiles for UI use. Public user summaries live on the profile rows.
export function useProfessionalFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<Professional>(professionalConfig)

  const coreProfessionalsHydrated = globalProfilesWithUser
  const appProfessionalsHydrated = localProfilesWithUser

  const coreProfessionals = computed(() => coreProfessionalsHydrated.value ?? [])
  const appProfessionals = computed(() => appProfessionalsHydrated?.value ?? [])
  const { byId: coreProfessional } = useCollectionById(coreProfessionals)
  const { byId: appProfessional } = useCollectionById(appProfessionals)

  const pending = computed(() =>
    coreProfessionalsHydrated.value === undefined ||
    Boolean(appProfessionalsHydrated && appProfessionalsHydrated.value === undefined)
  )

  return {
    coreProfessionals,
    appProfessionals,
    coreProfessional,
    appProfessional,
    pending,
  }
}
