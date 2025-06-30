import type { Professional } from '../../../../models/Professional.model'
import { ref } from 'vue'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'

export function useProfessionalCreate() {
  const { createDocument } = useFirestoreManager()
  const creating = ref(false)
  const error = ref<Error | null>(null)

  async function createProfessional(professional: Professional) {
    creating.value = true
    error.value = null
    try {
      const docRef = await createDocument('professionals', professional, {
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
    createProfessional,
    creating,
    error,
  }
}
