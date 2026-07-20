// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: replace raw Chef/User collection reads with the bounded API.
import { usePublicProfileCollection } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import type { Chef } from '../../../../../../models/chef.model'

// Chef profiles for UI use. Public identity joins canonical User by profile uid.
export function useChefFetch() {
  const {
    profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  } = usePublicProfileCollection<Chef>({ collection: 'chefs' })

  const coreChefs = profiles
  const appChefs = computed<Chef[]>(() => [])
  const { byId: coreChef } = useCollectionById(coreChefs)
  const { byId: appChef } = useCollectionById(appChefs)

  return {
    coreChefs,
    appChefs,
    coreChef,
    appChef,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: expose canonical User hydration for Chef rows.
