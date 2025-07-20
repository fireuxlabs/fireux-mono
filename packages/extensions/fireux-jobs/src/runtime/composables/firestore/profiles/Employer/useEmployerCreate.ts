import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { Employer } from '../../../../models/profiles/Employer.model'
import { useEmployerValidation } from './utils/useEmployerValidation'

export function useEmployerCreate() {
  const currentUser = useCurrentUser()
  const { validateEmployerData } = useEmployerValidation()

  const creating = ref(false)
  const error = ref<Error | null>(null)

  const createEmployer = async (
    employerData: Partial<Employer>
  ): Promise<string> => {
    if (!currentUser.value?.uid) {
      throw new Error('No authenticated user found')
    }

    creating.value = true
    error.value = null

    try {
      // Validate employer data
      const validation = validateEmployerData(employerData)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Format employer data with standardized fields
      const formattedData = {
        ...employerData,
        uid: currentUser.value.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        verified: false, // New employers start unverified
      }

      // TODO: Use setDocument from useFirestoreManager once properly configured
      // For now, keeping structure consistent with other create composables
      console.log(
        'Employer create standardized - needs setDocument implementation',
        formattedData
      )

      return 'success'
    } catch (err: any) {
      error.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to create employer profile')
      throw error.value
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
