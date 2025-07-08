import { ref, readonly } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Supplier } from '../../../../models/Supplier.model'

export function useSupplierUpdate() {
  const db = useFirestore()
  const updating = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Update an existing supplier profile
   */
  async function updateSupplier(uid: string, supplierData: Partial<Supplier>) {
    updating.value = true
    error.value = null

    try {
      // Remove uid from update data to prevent overwriting
      const { uid: _, ...updateData } = supplierData

      const supplierRef = doc(db, 'suppliers', uid)
      await updateDoc(supplierRef, {
        ...updateData,
        updated_at: serverTimestamp(),
      })

      return {
        success: true,
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to update supplier')
      console.error('Error updating supplier:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      updating.value = false
    }
  }

  /**
   * Update specific fields of a supplier profile
   */
  async function updateSupplierFields(uid: string, fields: Partial<Supplier>) {
    return updateSupplier(uid, fields)
  }

  return {
    updateSupplier,
    updateSupplierFields,
    updating: readonly(updating),
    error: readonly(error),
  }
}
