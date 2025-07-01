import type { Professional } from '../../../../models/Professional.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useCurrentUser } from 'vuefire'
import { useAppUser } from '../../../../../../../fireux-core/src/runtime/composables/firestore/AppUser/useAppUser'

export function useProfessionalCreate() {
  const { setDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createProfessional(additionalData?: Partial<Professional>) {
    creating.value = true
    error.value = null

    try {
      // Get current user from vuefire
      const currentUser = useCurrentUser()
      const { appUser } = useAppUser()

      if (!currentUser.value?.uid) {
        throw new Error('User is not authenticated')
      }

      // Create professional object with user data and additional form data
      const professionalData: Partial<Professional> = {
        uid: currentUser.value.uid,
        avatarUrl: appUser.value?.avatar,
        full_name:
          additionalData?.full_name ||
          appUser.value?.full_name ||
          appUser.value?.display_name,
        displayName: appUser.value?.full_name || appUser.value?.display_name, // Legacy field
        email: appUser.value?.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData, // Merge any additional form data (this will override the above if provided)
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
