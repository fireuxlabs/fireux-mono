import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import {
  chefConfig,
  type ChefCoreProfile,
} from '../../../../models/profiles/Chef.model.ts'
import { useChefComputed } from './main/useChefComputed.ts'
import { useChefInterface } from './main/useChefInterface.ts'
import { useChefCreate } from './main/useChefCreate.ts'
import { useChefUpdate } from './main/useChefUpdate.ts'
import { useChefDelete } from './main/useChefDelete.ts'
import { useChefCollection } from './main/useChefCollection.ts'

type ChefComputed = ReturnType<typeof useChefComputed>
type ChefInterface = ReturnType<typeof useChefInterface>
type ChefCreate = ReturnType<typeof useChefCreate>
type ChefUpdate = ReturnType<typeof useChefUpdate>
type ChefDelete = ReturnType<typeof useChefDelete>
type ChefCollection = ReturnType<typeof useChefCollection>

export type UseChefReturn = {
  profile: ProfileRefs<ChefCoreProfile>
  collection: ChefCollection
} & ChefComputed &
  ChefInterface &
  ChefCreate &
  ChefUpdate &
  ChefDelete

export function useChef(): UseChefReturn {
  const { profile } = useProfile<ChefCoreProfile>(chefConfig)
  return {
    profile,
    ...useChefComputed(profile),
    ...useChefInterface(profile),
    ...useChefCreate(),
    ...useChefUpdate(profile),
    ...useChefDelete(profile),
    collection: useChefCollection(),
  }
}
