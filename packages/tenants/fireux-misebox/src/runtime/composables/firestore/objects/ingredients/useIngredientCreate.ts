import { ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Enhanced ingredient create composable with supplier support
export function useIngredientCreate() {
  const currentUser = useCurrentUser()
  const db = useFirestore()

  const creating = ref(false)
  const createError = ref<Error | null>(null)

  // Accept name and optional supplier ID
  async function createIngredient(
    name: string,
    supplierId?: string
  ): Promise<boolean> {
    if (!name) throw new Error('Ingredient name required')
    if (!currentUser.value) throw new Error('User not authenticated')

    creating.value = true
    createError.value = null

    try {
      // Use timestamp + random segment for id (simple, avoids slug logic for now)
      const id = `ing_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 7)}`

      const data: any = {
        name: name.trim(),
        creator_id: currentUser.value.uid,
        created_at: serverTimestamp(),
      }

      // Add supplier information if provided
      if (supplierId) {
        try {
          const supplierRef = doc(db, 'suppliers', supplierId)
          const supplierDoc = await getDoc(supplierRef)

          if (supplierDoc.exists()) {
            const supplierData = supplierDoc.data()
            data.supplierId = supplierId
            data.supplierInfo = {
              business_name: supplierData.business_name,
              verified: supplierData.verified || false,
            }
          }
        } catch (error) {
          console.warn('Failed to fetch supplier info:', error)
          // Continue creating ingredient without supplier info
        }
      }

      const ingredientRef = doc(db, 'ingredients', id)
      await setDoc(ingredientRef, data)

      console.log(
        '✅ Ingredient created:',
        name,
        supplierId ? `(Supplier: ${data.supplierInfo?.business_name})` : ''
      )
      return true
    } catch (e: any) {
      createError.value =
        e instanceof Error
          ? e
          : new Error(e?.message || 'Failed to create ingredient')
      console.error('❌ Failed to create ingredient:', createError.value)
      return false
    } finally {
      creating.value = false
    }
  }

  return { createIngredient, creating, createError }
}
