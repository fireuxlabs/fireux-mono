// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: hydrate canonical User identity for Driver rows.
// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: replace raw Driver/User collection reads with the bounded API.
import { usePublicProfileCollection } from 'fireux-core/runtime/composables/fireux/public/profile/usePublicProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import {
  DriverStorage,
  type PublicDriverDirectoryProfile,
  type PublicDriverProfilePayload,
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
  } = usePublicProfileCollection<PublicDriverProfilePayload>({
    collection: DriverStorage.rootCollection,
  })
  const { byId: driver } =
    useCollectionById<PublicDriverDirectoryProfile>(drivers)

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
