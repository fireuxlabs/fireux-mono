import type { Professional } from '../../../../models/Professional.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'

export function useProfessionalDelete() {
  const { deleteDocument } = useFirestoreManager()
  const deleting = ref(false)
  const error = ref<Error | null>(null)

  async function deleteProfessional(id: string) {
    deleting.value = true
    error.value = null
    try {
      await deleteDocument('professionals', id, { appScoped: false })
      return 'success'
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteProfessional,
    deleting,
    error,
  }
}
