import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { computed } from 'vue'
import {
    chefConfig,
    type ChefCore,
} from '../../../../../../models/profiles/Chef/Chef.model'

// Hydrated (user-attached) chef profiles for UI use.
export function useChefFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<ChefCore>(chefConfig)

  const coreChefsHydrated = globalProfilesWithUser
  const appChefsHydrated = localProfilesWithUser

  const coreChefs = computed(() => coreChefsHydrated.value ?? [])
  const appChefs = computed(() => appChefsHydrated?.value ?? [])

  const pending = computed(() =>
    coreChefsHydrated.value === undefined ||
    appChefsHydrated?.value === undefined
  )

  return {
    coreChefs,
    appChefs,
    pending,
  }
}
