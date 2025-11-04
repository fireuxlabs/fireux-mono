// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import { useProfileEnsure } from './main/useProfileEnsure.ts'
import { useProfileDelete } from './main/useProfileDelete.ts'
import type {
  Profile,
  ProfileConfig,
} from '../../../../models/core/profile.model.ts'
/**
 * Unified Profile composable
 * - Returns one merged reactive profile (core + optional app overlay)
 * - Provides ensure() and delete() helpers
 */
export function useProfile<TProfile extends Profile = Profile>(
  config: ProfileConfig
) {
  const { uid } = useAuth()
  const { profile } = useProfileFetch<TProfile>(uid.value, config)

  return {
    profile,
    ...useProfileEnsure(config),
    ...useProfileDelete(profile, config),
  }
}
