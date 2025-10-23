import { ref, type Ref } from 'vue'
import type { ProfileConfig } from '../../../models/profiles/profile.model.ts'

type ProfileDeleteResult = 'success'

/**
 * Placeholder delete handler for profile documents.
 * Future implementations can extend to scoped deletions.
 */
export function useProfileDelete(
  _profile: Ref<unknown>,
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  const deleteProfile = async (
    opts: { id?: string } = {}
  ): Promise<ProfileDeleteResult> => {
    const { id } = opts
    if (!id) throw new Error('Profile id is required')

    deleting.value = true
    deleteError.value = null

    deleting.value = false
    return 'success'
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
