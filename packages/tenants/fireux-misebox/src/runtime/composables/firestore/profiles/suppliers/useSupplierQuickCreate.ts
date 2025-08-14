import { ref, readonly } from 'vue'
import { useCurrentUser } from 'vuefire'
import { doc, setDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Supplier } from '../../../../models/profiles/Supplier.model'

export const useSupplierQuickCreate = () => {
  const db = useFirestore()
  const user = useCurrentUser()

  const creating = ref(false)
  const createError = ref<Error | null>(null)
  const createdSupplier = ref<Supplier | null>(null)

  const createQuickSupplier = async (
    businessName: string
  ): Promise<Supplier | null> => {
    if (!user.value) {
      createError.value = new Error('User must be authenticated')
      return null
    }

    creating.value = true
    createError.value = null
    createdSupplier.value = null

    try {
      // Generate auto-generated ID for independent supplier entity
      const supplierId =
        businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/(^-)|(-$)/g, '') +
        '-' +
        Date.now().toString(36)

      // Create minimal supplier profile for quick creation
      const supplierData: Supplier = {
        // Profile required fields (but not using user.uid as document ID)
        uid: supplierId, // Use auto-generated ID, not user.uid
        avatarUrl: '/default-supplier-avatar.png', // Generic supplier avatar

        // Core Identity
        id: supplierId,
        business_name: businessName,

        // Unclaimed supplier system
        claimed: false,
        created_by: user.value.uid, // Track who created it

        // Basic info (minimal for quick creation)
        business_type: 'other',
        specialties: [],

        // Timestamps
        created_at: new Date(),
        updated_at: new Date(),

        // Tracking
        total_ingredients: 0,
        verified: false,
      }

      const supplierRef = doc(db, 'suppliers', supplierId)
      await setDoc(supplierRef, supplierData)

      createdSupplier.value = { ...supplierData, id: supplierId }

      console.log('✅ Quick supplier created:', supplierData.business_name)
      return createdSupplier.value
    } catch (error) {
      console.error('❌ Error creating quick supplier:', error)
      createError.value =
        error instanceof Error ? error : new Error('Failed to create supplier')
      return null
    } finally {
      creating.value = false
    }
  }

  return {
    createQuickSupplier,
    creating: readonly(creating),
    createError: readonly(createError),
    createdSupplier: readonly(createdSupplier),
  }
}
