import { useProfileCollection } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileCollection.ts'
import {
  employerConfig,
  type EmployerProfile,
} from '../../../../../models/profiles/Employer.model.ts'

export function useEmployerCollection() {
  const {
    globalProfiles,
    localProfiles,
    globalProfilesWithUser,
    localProfilesWithUser,
  } = useProfileCollection<EmployerProfile>(employerConfig)

  return {
    globalEmployers: globalProfilesWithUser,
    localEmployers: localProfilesWithUser,
    rawGlobalEmployers: globalProfiles,
    rawLocalEmployers: localProfiles,
  }
}
