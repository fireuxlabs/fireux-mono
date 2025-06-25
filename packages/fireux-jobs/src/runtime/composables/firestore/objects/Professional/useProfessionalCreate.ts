import { useFirestoreManager } from 'fireux-core/composables/firestore/useFirestoreManager'
import type { Professional } from '../../../models/Professional'
import { ref } from 'vue'

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
