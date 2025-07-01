import type { Professional } from '../../../../models/Professional.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useCurrentUser } from 'vuefire'
import { useAppUser } from '../../../../../../../fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export function useProfessionalCreate() {
  const { setDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createProfessional() {
    creating.value = true
    error.value = null

    try {
      // Get current user from vuefire
      const currentUser = useCurrentUser()
      const { appUser } = useAppUser()

      if (!currentUser.value?.uid) {
        throw new Error('User is not authenticated')
      }

      // Create professional object with user data
      const professionalData: Professional = {
        uid: currentUser.value.uid, 
        avatarUrl: appUser.value?.avatar,
        displayName: appUser.value?.display_name,
        email: appUser.value?.email || '',
      }

      // Use the authenticated user's ID as the document ID
      await setDocument(
        'professionals',
        currentUser.value.uid,
        professionalData,
        {
          appScoped: false,
        }
      )
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      creating.value = false
    }
  }

  return {
    createProfessional,
    creating,
    error,
  }
}
