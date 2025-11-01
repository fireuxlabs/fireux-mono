import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profiles/useProfile.ts'
import {
  chefConfig,
  type ChefCoreProfile,
  type ChefAppProfile,
} from '../../../../models/profiles/Chef.model'

export function useChef() {
  const { profile } = useProfile<ChefCoreProfile, ChefAppProfile>(chefConfig)
  return { profile }
}
