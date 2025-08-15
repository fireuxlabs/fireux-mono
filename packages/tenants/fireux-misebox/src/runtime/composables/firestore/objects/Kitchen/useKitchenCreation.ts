import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { Kitchen, NewKitchenInput } from '../../../../models/objects/Kitchen.model'
import { normalizeKitchen } from '../../../../models/objects/Kitchen.model'

export function useKitchenCreation() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  const create = async (input: NewKitchenInput): Promise<Kitchen> => {
    if (!currentUser.value) {
      throw new Error('User must be authenticated to create a kitchen')
    }

    isCreating.value = true
    error.value = null

    try {
      // Create new document reference
      const colRef = collection(db, 'kitchens')
      const docRef = doc(colRef)
      
      // Kitchen data with required fields
      const kitchenData = {
        name: input.name,
        owner_id: currentUser.value.uid,
        app_id: process.env.APP_ID || 'niederhorn',
        ingredients: [], // Start with empty ingredients array
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: currentUser.value.uid,
      }

      // Save to Firestore
      await setDoc(docRef, kitchenData)

      // Return normalized kitchen object
      const kitchen = normalizeKitchen(docRef.id, {
        ...kitchenData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      return kitchen

    } catch (err: any) {
      error.value = err.message || 'Failed to create kitchen'
      throw err
    } finally {
      isCreating.value = false
    }
  }

  return {
    create,
    isCreating,
    error,
  }
}
