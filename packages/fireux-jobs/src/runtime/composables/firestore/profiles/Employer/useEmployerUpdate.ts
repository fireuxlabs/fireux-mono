import type { Employer } from '../../../../models/profiles/Employer.model'
import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'

export function useEmployerUpdate() {
  const { updateDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  async function updateEmployer(
    updateData: Partial<Employer>,
    id?: string
  ): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Add updated timestamp and exclude immutable fields
      const profileData = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      // Remove immutable fields if they exist
      if ('uid' in profileData) delete profileData.uid
      if ('created_at' in profileData) delete profileData.created_at

      await updateDocument('employers', targetId, profileData, {
        appScoped: false,
      })
      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to update employer profile')
      throw updateError.value
    } finally {
      updating.value = false
    }
  }

  return {
    updateEmployer,
    updating,
    updateError,
  }
}
