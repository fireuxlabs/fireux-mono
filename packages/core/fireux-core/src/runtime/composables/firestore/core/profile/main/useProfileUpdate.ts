import { ref } from 'vue'
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { ProfileRefs } from './useProfileFetch.ts'

type UpdateResult = 'success'

/**
 * Stub update handler reserved for future hooks.
 */
export function useProfileUpdate<TProfile extends Profile = Profile>(
  _profileRefs: ProfileRefs<TProfile>,
  _config: ProfileConfig
) {
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const updateProfile = async (): Promise<UpdateResult> => 'success'

  return {
    updateProfile,
    updating,
    updateError,
  }
}
