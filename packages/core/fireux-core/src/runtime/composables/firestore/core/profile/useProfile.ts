// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
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
  const { profile } = useProfileFetch<TProfile>(uid.value, config)

  return { profile }
}
