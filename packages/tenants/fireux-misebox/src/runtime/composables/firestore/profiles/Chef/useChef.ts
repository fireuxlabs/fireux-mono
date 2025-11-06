import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  chefConfig,
  type ChefCoreProfile,
} from '../../../../models/profiles/Chef.model.ts'
import { useChefInterface } from './main/useChefInterface.ts'

export function useChef() {
  const { profile } = useProfile<ChefCoreProfile>(chefConfig)
  return { profile, ...useChefInterface(profile) }
}
