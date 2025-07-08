import { ref, readonly } from 'vue'
import { doc, deleteDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export function useSupplierDelete() {
  const db = useFirestore()
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Delete a supplier profile
   */
  async function deleteSupplier(uid: string) {
    deleting.value = true
    error.value = null

    try {
      const supplierRef = doc(db, 'suppliers', uid)
      await deleteDoc(supplierRef)

      return {
        success: true,
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to delete supplier')
      console.error('Error deleting supplier:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      deleting.value = false
    }
  }

  /**
   * Soft delete a supplier profile (mark as deleted)
   */
  async function softDeleteSupplier(uid: string) {
    deleting.value = true
    error.value = null

    try {
      const { useSupplierUpdate } = await import('./useSupplierUpdate')
      const { updateSupplier } = useSupplierUpdate()

      const result = await updateSupplier(uid, {
        deleted: true,
        updated_at: new Date(),
      })

      return result
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to soft delete supplier')
      console.error('Error soft deleting supplier:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteSupplier,
    softDeleteSupplier,
    deleting: readonly(deleting),
    error: readonly(error),
  }
}
