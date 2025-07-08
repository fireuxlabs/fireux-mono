import { ref, readonly } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { Supplier } from '../../../../models/Supplier.model'
import { useSupplierValidation } from './utils/useSupplierValidation'
import { useSupplierFormatting } from './utils/useSupplierFormatting'

export function useSupplierCreate() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  const { validateSupplier } = useSupplierValidation()
  const { formatSupplierData } = useSupplierFormatting()

  /**
   * Create a new supplier profile
   */
  async function createSupplier(supplierData: Partial<Supplier>) {
    if (!currentUser.value) {
      error.value = new Error(
        'User must be authenticated to create a supplier profile'
      )
      return { success: false, error: error.value.message }
    }

    creating.value = true
    error.value = null

    try {
      // Validate the supplier data
      const validation = validateSupplier(supplierData)
      if (!validation.isValid) {
        error.value = new Error(validation.errors.join(', '))
        return { success: false, error: error.value.message }
      }

      // Format the supplier data
      const formattedData = formatSupplierData(supplierData)

      // Create the supplier document
      const suppliersRef = collection(db, 'suppliers')
      const docRef = await addDoc(suppliersRef, {
        ...formattedData,
        uid: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      return {
        success: true,
        id: docRef.id,
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to create supplier')
      console.error('Error creating supplier:', err)
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      creating.value = false
    }
  }

  return {
    createSupplier,
    creating: readonly(creating),
    error: readonly(error),
  }
}
