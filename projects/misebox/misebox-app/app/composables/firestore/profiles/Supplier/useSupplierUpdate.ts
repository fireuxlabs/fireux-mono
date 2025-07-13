import { ref } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { Supplier } from '../../../../models/Supplier.model'

export function useSupplierUpdate() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  /**
   * Update an existing supplier profile
   */
  async function updateSupplier(
    updateData: Partial<Supplier>,
    id?: string
  ): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Create clean update data, excluding immutable fields
      const profileData = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      // Remove immutable fields if they exist
      if ('uid' in profileData) delete profileData.uid
      if ('created_at' in profileData) delete profileData.created_at

      const supplierRef = doc(db, 'suppliers', targetId)
      await updateDoc(supplierRef, profileData)

      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to update supplier profile')
      throw updateError.value
    } finally {
      updating.value = false
    }
  }

  /**
   * Update specific fields of a supplier profile (legacy helper - use updateSupplier instead)
   */
  async function updateSupplierFields(
    fields: Partial<Supplier>,
    uid?: string
  ): Promise<string> {
    return updateSupplier(fields, uid)
  }

  return {
    updateSupplier,
    updateSupplierFields,
    updating,
    updateError,
  }
}
