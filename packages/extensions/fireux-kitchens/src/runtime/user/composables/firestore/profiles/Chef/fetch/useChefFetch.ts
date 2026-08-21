// Concurrent edit — 2026-07-20 20:14 CEST — Repo Efficiency Pass 2 of 6: expose the exact projected Chef directory source.
import { useProfileDirectoryCollection } from 'fireux-core/runtime/user/composables/profile/useProfileDirectoryCollection'
import type { ChefDirectoryProfilePayload } from '../../../../../models/chef.model.ts'

// Chef profiles for UI use. Public identity joins canonical User by profile uid.
export function useChefFetch() {
  const {
    profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  } = useProfileDirectoryCollection<ChefDirectoryProfilePayload>({
    collection: 'chefs',
  })

  return {
    coreChefs: profiles,
    profileUsers,
    usersById,
    userById,
    pending,
    error,
    outcome,
  }
}
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: expose canonical User hydration for Chef rows.
