// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfileDelete.ts
import { ref, type Ref } from 'vue'
import type { ProfileConfig } from './useProfile'

/**
 * Placeholder delete composable. Wire actual Firestore deletes when ready.
 */
export function useProfileDelete(
  _profile: Ref<unknown>,
  _config: ProfileConfig
) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  const deleteProfile = async (opts: { id?: string } = {}) => {
    const { id } = opts
    if (!id) throw new Error('Profile id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // Placeholder: once deletion flow is finalised, remove this guard and
      // call Firestore delete helpers for both core + tenant overlays.
      return 'not-implemented' as const
    } catch (error: unknown) {
      deleteError.value =
        error instanceof Error
          ? error
          : new Error(
              (error as { message?: string })?.message || 'Unknown error'
            )
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
