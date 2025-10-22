// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserDelete.ts
import { ref, type Ref } from 'vue'
import type { User } from './useUser.ts'

export function useUserDelete(userRef?: Ref<User | null | undefined>) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteUser(id?: string) {
    const resolvedId = id ?? userRef?.value?.id
    if (!resolvedId) throw new Error('User id is required')

    deleting.value = true
    deleteError.value = null

    try {
      // Placeholder; real delete not wired yet.
      console.warn('[fireux-core] deleteUser stub – no deletion performed', {
        id: resolvedId,
      })
      return 'not-implemented' as const
    } catch (error: any) {
      deleteError.value =
        error instanceof Error ? error : new Error('Unknown error')
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return { deleteUser, deleting, deleteError }
}
