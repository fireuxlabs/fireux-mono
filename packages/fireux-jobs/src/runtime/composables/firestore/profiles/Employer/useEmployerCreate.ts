import type { Employer } from '../../../../models/Employer.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useCurrentUser } from 'vuefire'
import { useAppUser } from '../../../../../../../fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export function useEmployerCreate() {
  const { setDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createEmployer(additionalData?: Partial<Employer>) {
    creating.value = true
    error.value = null

    try {
      // Get current user from vuefire
      const currentUser = useCurrentUser()
      const { appUser } = useAppUser()

      if (!currentUser.value?.uid) {
        throw new Error('User is not authenticated')
      }

      // Create employer object with user data and additional form data
      const employerData: Partial<Employer> = {
        uid: currentUser.value.uid,
        contactEmail: appUser.value?.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData, // Merge any additional form data
      }

      // Use the authenticated user's ID as the document ID
      await setDocument('employers', currentUser.value.uid, employerData, {
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
