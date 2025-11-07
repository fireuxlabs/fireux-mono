import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  employerConfig,
  type EmployerProfile,
} from '../../../../../models/profiles/Employer.model.ts'

export function useEmployerCollection() {
  const { profiles, global, local } =
    useProfileCollection<EmployerProfile>(employerConfig)

  return { employers: profiles, global, local }
}
