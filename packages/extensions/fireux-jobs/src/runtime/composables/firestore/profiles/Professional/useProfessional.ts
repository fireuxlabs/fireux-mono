import { useProfile } from 'fireux-core/runtime/composables/firestore/core/profile/useProfile.ts'
import {
  professionalConfig,
  type ProfessionalProfile,
} from '../../../../models/profiles/Professional.model.ts'
import { useProfessionalComputed } from './main/useProfessionalComputed.ts'
import { useProfessionalInterface } from './main/useProfessionalInterface.ts'
import { useProfessionalCreate } from './useProfessionalCreate.ts'
import { useProfessionalUpdate } from './main/useProfessionalUpdate.ts'
import { useProfessionalDelete } from './main/useProfessionalDelete.ts'

export function useProfessional() {
  const { profile } = useProfile<ProfessionalProfile>(professionalConfig)
  return {
    profile,
    ...useProfessionalComputed(profile),
    ...useProfessionalInterface(profile),
    ...useProfessionalCreate(),
    ...useProfessionalUpdate(profile),
    ...useProfessionalDelete(profile),
  }
}
