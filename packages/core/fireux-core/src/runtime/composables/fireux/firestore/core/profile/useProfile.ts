// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './fetch/useProfileFetch.ts'
import type {
  Profile,
  ProfileConfig,
} from '../../../../models/core/profile.model.ts'

/**
 * Unified Profile composable (core-only)
 * - Returns grouped profile refs (core/app)
 * - No computed, no ensure/update/delete (handled by domain facades)
 */
export function useProfile<TProfile extends Profile = Profile>(
  config: ProfileConfig
) {
  const { uid } = useAuth()
  const { profile, pending } = useProfileFetch<TProfile>(uid, config)

  return { profile, pending }
}
