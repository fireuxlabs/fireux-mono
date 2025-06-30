import type { Employer } from '../../../../models/Employer.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'

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
