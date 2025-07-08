import { ref, readonly } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export function useChefDelete() {
  const db = useFirestore()
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Delete a chef profile
   */
  async function deleteChef(uid: string) {
    deleting.value = true
    error.value = null

    try {
      const chefRef = doc(db, 'chefs', uid)
      await deleteDoc(chefRef)

      return {
        success: true,
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to delete chef')
      console.error('Error deleting chef:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      deleting.value = false
    }
  }

  /**
   * Soft delete a chef profile (mark as deleted)
   */
  async function softDeleteChef(uid: string) {
    deleting.value = true
    error.value = null

    try {
      const { useChefUpdate } = await import('./useChefUpdate')
      const { updateChef } = useChefUpdate()

      const result = await updateChef(uid, {
        deleted: true,
        updated_at: new Date(),
      })

      return result
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to soft delete chef')
      console.error('Error soft deleting chef:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteChef,
    softDeleteChef,
    deleting: readonly(deleting),
    error: readonly(error),
  }
}
