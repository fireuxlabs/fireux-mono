import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { Chef } from '~/models/Chef.model'
import { useChefValidation } from './utils/useChefValidation'
import { useChefFormatting } from './utils/useChefFormatting'

export function useChefCreate() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { validateChefData } = useChefValidation()
  const { formatChefData } = useChefFormatting()

  const creating = ref(false)
  const error = ref<string | null>(null)

  const createChef = async (chefData: Partial<Chef>): Promise<Chef | null> => {
    if (!currentUser.value?.uid) {
      error.value = 'No authenticated user found'
      return null
    }

    creating.value = true
    error.value = null

    try {
      // Validate chef data
      const validation = validateChefData(chefData)
      if (!validation.isValid) {
        error.value = validation.errors.join(', ')
        return null
      }

      // Format chef data
      const formattedData = formatChefData({
        ...chefData,
        uid: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted: false,
      })

      // Create chef document
      const chefRef = await addDoc(collection(db, 'chefs'), formattedData)

      const newChef: Chef = {
        id: chefRef.id,
        ...formattedData,
        created_at: new Date(),
        updated_at: new Date(),
      } as Chef

      return newChef
    } catch (err) {
      console.error('Error creating chef:', err)
      error.value =
        err instanceof Error ? err.message : 'Failed to create chef profile'
      return null
    } finally {
      creating.value = false
    }
  }

  return {
    createChef,
    creating: readonly(creating),
    error: readonly(error),
  }
}
