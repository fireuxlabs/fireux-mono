import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  chefConfig,
  type ChefCoreProfile,
} from '../../../../models/profiles/Chef.model.ts'
import { useChefComputed } from './main/useChefComputed.ts'
import { useChefInterface } from './main/useChefInterface.ts'
import { useChefCreate } from './main/useChefCreate.ts'
import { useChefUpdate } from './main/useChefUpdate.ts'
import { useChefDelete } from './main/useChefDelete.ts'

export function useChef() {
  const { profile } = useProfile<ChefCoreProfile>(chefConfig)
  return {
    profile,
    ...useChefComputed(profile),
    ...useChefInterface(profile),
    ...useChefCreate(),
    ...useChefUpdate(profile),
    ...useChefDelete(profile),
  }
}
