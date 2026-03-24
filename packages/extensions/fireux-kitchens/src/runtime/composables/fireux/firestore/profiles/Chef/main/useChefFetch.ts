import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { chefConfig } from '../config/chefConfig'
import type { ChefCore } from '../../../../../../models/profiles/Chef/Chef.model'

// Hydrated (user-attached) chef profiles for UI use.
export function useChefFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<ChefCore>(chefConfig)

  const coreChefsHydrated = globalProfilesWithUser
  const appChefsHydrated = localProfilesWithUser

  const coreChefs = computed(() => coreChefsHydrated.value ?? [])
  const appChefs = computed(() => appChefsHydrated?.value ?? [])
  const { byId: coreChef } = useCollectionById(coreChefs)
  const { byId: appChef } = useCollectionById(appChefs)

  const pending = computed(() =>
    coreChefsHydrated.value === undefined ||
    Boolean(appChefsHydrated && appChefsHydrated.value === undefined)
  )

  return {
    coreChefs,
    appChefs,
    coreChef,
    appChef,
    pending,
  }
}
