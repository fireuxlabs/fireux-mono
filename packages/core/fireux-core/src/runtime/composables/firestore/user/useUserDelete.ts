import { ref, type Ref } from 'vue'
import type { User } from '../../../models/core/user.model'

/**
 * Placeholder delete composable while destructive flows are unfinished.
 * We only validate the id and expose loading/error state for future wiring.
 */
export function useUserDelete(userRef?: Ref<User | null | undefined>) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteUser(id?: string) {
    const resolvedId = id ?? userRef?.value?.id
    if (!resolvedId) throw new Error('User id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // eslint-disable-next-line no-console
      console.warn('[fireux-core] deleteUser stub – no deletion performed', {
        id: resolvedId,
      })
      return 'not-implemented' as const
    } catch (error) {
      deleteError.value =
        error instanceof Error ? error : new Error('Unknown error')
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return { deleteUser, deleting, deleteError }
}
