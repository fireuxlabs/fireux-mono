import { useAppUserDeletionImpact } from './useAppUserDeletionImpact'
import { useAppUserDelete } from './useAppUserDelete'

/** Safe AppUser deletion bundle: deterministic impact plus guarded execution. */
export function useAppUserDeletion(appId: () => string, userId: () => string) {
  const impactReader = useAppUserDeletionImpact()
  const executor = useAppUserDelete()
  return {
    impact: () => impactReader.deletionImpact(userId()),
    execute: () => executor.deleteAppUser(appId(), userId()),
  }
}
