import { useFirestoreManager } from 'fireux-core/composables/firestore/useFirestoreManager'
import type { Employer } from '../../../models/employer.model'
import { ref } from 'vue'

export function useEmployerUpdate() {
  const { updateDocument } = useFirestoreManager()
  const updating = ref(false)
  const error = ref<Error | null>(null)

  async function updateEmployer(id: string, employer: Partial<Employer>) {
    updating.value = true
    error.value = null
    try {
      await updateDocument('employers', id, employer, { appScoped: false })
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      updating.value = false
    }
  }

  return {
    updateEmployer,
    updating,
    error,
  }
}
