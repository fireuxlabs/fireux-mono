import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { chefConfig } from '../config/chefConfig'
import type { Chef } from '../../../../../../models/chef.model'

// Chef profiles for UI use. Public user summaries live on the profile rows.
export function useChefFetch() {
  const { globalProfiles, localProfiles } =
    useProfileCollection<Chef>(chefConfig)

  const coreChefs = computed(() => globalProfiles.value ?? [])
  const appChefs = computed(() => localProfiles?.value ?? [])
  const { byId: coreChef } = useCollectionById(coreChefs)
  const { byId: appChef } = useCollectionById(appChefs)

  const pending = computed(() =>
    globalProfiles.value === undefined ||
    Boolean(localProfiles && localProfiles.value === undefined)
  )

  return {
    coreChefs,
    appChefs,
    coreChef,
    appChef,
    pending,
  }
}
