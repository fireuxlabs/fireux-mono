import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  chefConfig,
  type ChefCoreProfile,
} from '../../../../models/profiles/Chef.model.ts'

export function useChef() {
  const { profile } = useProfile<ChefCoreProfile>(chefConfig)
  return { profile }
}
