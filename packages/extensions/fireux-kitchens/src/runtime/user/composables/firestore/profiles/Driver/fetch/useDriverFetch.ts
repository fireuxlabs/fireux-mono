// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: hydrate canonical User identity for Driver rows.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: replace raw Driver/User collection reads with the bounded API.
import { useProfileDirectoryCollection } from 'fireux-core/runtime/user/composables/profile/useProfileDirectoryCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  type DriverDirectoryProfile,
  type DriverProfilePayload,
} from '../../../../../models/driver.model.ts'

// Public Driver directory source. App-scoped operational rows never enter this read.
export function useDriverFetch() {
  const {
    profiles: drivers,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  } = useProfileDirectoryCollection<DriverProfilePayload>({
    collection: 'drivers',
  })
  const { byId: driver } = useCollectionById<DriverDirectoryProfile>(drivers)

  return {
    drivers,
    coreDrivers: drivers,
    coreDriver: driver,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
