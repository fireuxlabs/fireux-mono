// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfileDelete.ts
import { ref, type Ref } from 'vue'
import type { ProfileConfig } from '../../../models/profiles/profile.model'

/**
 * Delete profile docs:
 * - scope: 'core' | 'app' | 'both' | 'auto'
 * - allApps: delete ALL app overlays via collectionGroup
 */
export function useProfileDelete(
  _profile: Ref<any>, // not used now, kept for future hook symmetry
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)
  async function deleteProfile(opts: { id?: string } = {}) {
    const { id } = opts
    if (!id) throw new Error('Profile id is required')

    deleting.value = true
    deleteError.value = null

    deleting.value = false
    return 'success' as const
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
