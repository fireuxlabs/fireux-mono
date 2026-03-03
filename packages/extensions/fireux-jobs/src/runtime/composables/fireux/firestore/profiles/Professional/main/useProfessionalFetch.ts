import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import { professionalConfig } from '../config/professionalConfig'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'

// Hydrated (user-attached) professional profiles for UI use.
export function useProfessionalFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<ProfessionalCore>(professionalConfig)

  const coreProfessionalsHydrated = globalProfilesWithUser
  const appProfessionalsHydrated = localProfilesWithUser

  const coreProfessionals = computed(() => coreProfessionalsHydrated.value ?? [])
  const appProfessionals = computed(() => appProfessionalsHydrated?.value ?? [])

  const pending = computed(() =>
    coreProfessionalsHydrated.value === undefined ||
    appProfessionalsHydrated?.value === undefined
  )

  return {
    coreProfessionals,
    appProfessionals,
    pending,
  }
}
