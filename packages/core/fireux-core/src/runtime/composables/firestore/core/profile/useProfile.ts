// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profile/useProfile.ts
import { useAuth } from '../../../firebase/useAuth.ts'
import { useProfileFetch } from './main/useProfileFetch.ts'
import { useProfileEnsure } from './main/useProfileEnsure.ts'
import { useProfileDelete } from './main/useProfileDelete.ts'
import { useProfileComputed } from './main/useProfileComputed.ts'
import type {
  Profile,
  ProfileConfig,
} from '../../../../models/core/profile.model.ts'
/**
 * Unified Profile composable
 * - Returns grouped profile refs (core/app)
 * - Provides merged profile computed, ensure(), and delete() helpers
 */
export function useProfile<TProfile extends Profile = Profile>(
  config: ProfileConfig
) {
  const { uid } = useAuth()
  const { profile: profileRefs } = useProfileFetch<TProfile>(uid.value, config)
  const { profile } = useProfileComputed<TProfile>(profileRefs)

  return {
    profileRefs,
    profile,
    ...useProfileEnsure(config),
    ...useProfileDelete(profile, config),
  }
}
