import { useFirestoreManager } from 'fireux-core/composables/firestore/useFirestoreManager'
import type { Employer } from '../../../models/employer.model'
import { ref } from 'vue'

export function useEmployerCreate() {
  const { createDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createEmployer(employer: Employer) {
    creating.value = true
    error.value = null
    try {
      const docRef = await createDocument('employers', employer, {
        appScoped: false,
      })
      return docRef
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
