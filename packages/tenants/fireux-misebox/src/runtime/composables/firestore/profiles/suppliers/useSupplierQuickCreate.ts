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

  const createQuickSupplier = async (businessName: string): Promise<Supplier | null> => {
    if (!user.value) {
      createError.value = new Error('User must be authenticated')
      return null
    }

    creating.value = true
    createError.value = null
    createdSupplier.value = null

    try {
      // Generate a simple ID based on business name
      const supplierId = businessName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now().toString(36)

      // Create minimal supplier profile for quick creation
      const supplierData: Supplier = {
        // Profile required fields
        uid: user.value.uid,
        avatarUrl: user.value.photoURL || '/default-supplier-avatar.png',
        
        // Core Identity
        id: supplierId,
        business_name: businessName,
        business_type: 'other', // Use 'other' for chef-created suppliers
        email: user.value.email || '',
        specialties: [], // Will be populated when ingredients are added
        
        // Timestamps
        created_at: new Date(),
        updated_at: new Date(),
        
        // Ingredient tracking
        total_ingredients: 0,
        active_ingredients: [],
        
        // Status
        verified: false
      }

      const supplierRef = doc(db, 'suppliers', supplierId)
      await setDoc(supplierRef, supplierData)
      
      createdSupplier.value = { ...supplierData, id: supplierId }
      
      console.log('✅ Quick supplier created:', supplierData.business_name)
      return createdSupplier.value

    } catch (error) {
      console.error('❌ Error creating quick supplier:', error)
      createError.value = error instanceof Error ? error : new Error('Failed to create supplier')
      return null
    } finally {
      creating.value = false
    }
  }

  return {
    createQuickSupplier,
    creating: readonly(creating),
    createError: readonly(createError),
    createdSupplier: readonly(createdSupplier)
  }
}
