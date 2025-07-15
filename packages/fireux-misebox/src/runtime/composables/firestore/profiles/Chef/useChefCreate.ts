import { ref } from 'vue'
import { serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import type { Chef } from '../../../../models/profiles/Chef.model'
import { useChefValidation } from './utils/useChefValidation'

export function useChefCreate() {
  const currentUser = useCurrentUser()
  const db = useFirestore()
  const { validateChefData } = useChefValidation()

  const creating = ref(false)
  const error = ref<Error | null>(null)

  const createChef = async (chefData: Partial<Chef>): Promise<string> => {
    if (!currentUser.value?.uid) {
      throw new Error('No authenticated user found')
    }

    creating.value = true
    error.value = null

    try {
      // Validate chef data
      const validation = validateChefData(chefData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Format chef data with standardized fields
      const formattedData = {
        ...chefData,
        uid: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted: false,
      }

      // Create chef document with UID as document ID
      const docRef = doc(db, 'chefs', currentUser.value.uid)
      await setDoc(docRef, formattedData)

      console.log('Chef profile created successfully', formattedData)

      return 'success'
    } catch (err: any) {
      error.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to create chef profile')
      throw error.value
    } finally {
      creating.value = false
    }
  }

  return {
    createChef,
    creating,
    error,
  }
}
