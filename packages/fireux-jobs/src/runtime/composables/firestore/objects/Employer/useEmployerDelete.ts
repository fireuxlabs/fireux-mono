import type { Employer } from '../../../../../models/Employer.model'
import { ref } from 'vue'

export function useEmployerDelete() {
  const { deleteDocument } = useFirestoreManager()
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  async function deleteEmployer(id: string) {
    deleting.value = true
    error.value = null
    try {
      await deleteDocument('employers', id, { appScoped: false })
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteEmployer,
    deleting,
    error,
  }
}
