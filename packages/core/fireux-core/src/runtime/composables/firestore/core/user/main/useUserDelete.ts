import { ref, type Ref } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type UserSource = Ref<User | null | undefined> | UserRefs | undefined

export function useUserDelete(userRef?: UserSource) {
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  async function deleteUser(id?: string) {
    const resolvedId = (() => {
      if (id) return id
      if (!userRef) return undefined
      const maybeGrouped = userRef as any
      if (maybeGrouped && 'coreUser' in maybeGrouped) {
        return maybeGrouped.coreUser?.value?.id
      }
      return (userRef as Ref<User | null | undefined>).value?.id
    })()

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
