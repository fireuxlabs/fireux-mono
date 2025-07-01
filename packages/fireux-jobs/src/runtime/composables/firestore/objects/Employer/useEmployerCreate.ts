import type { Employer } from '../../../../models/Employer.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useCurrentUser } from 'vuefire'

export function useEmployerCreate() {
  const { setDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createEmployer(employer: Employer) {
    creating.value = true
    error.value = null

    try {
      // Get current user from vuefire
      const currentUser = useCurrentUser()

      if (!currentUser.value?.uid) {
        throw new Error('User is not authenticated')
      }

      // Validate that the employer uid matches the current user
      if (employer.uid !== currentUser.value.uid) {
        console.warn('User ID mismatch detected:', {
          currentUserUid: currentUser.value.uid,
          employerUid: employer.uid,
        })
        throw new Error('User ID mismatch - potential security issue')
      }

      // Use the authenticated user's ID as the document ID
      await setDocument('employers', currentUser.value.uid, employer, {
        appScoped: false,
      })
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      creating.value = false
    }
  }

  return {
    createEmployer,
    creating,
    error,
  }
}
