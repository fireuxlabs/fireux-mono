import { ref, type Ref } from 'vue'
import type { ProfileConfig } from '../../../../../../models/core/profile.model'

type ProfileDeleteResult = 'success'

/**
 * Stub delete handler reserved for future hooks.
 */
export function useProfileDelete(
  _profile: Ref<unknown>,
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  const deleteProfile = async (): Promise<ProfileDeleteResult> => 'success'

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
