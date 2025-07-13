import { ref } from 'vue'
import { serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import type { Chef } from '../../../../models/Chef.model'

export function useChefUpdate() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  /**
   * Update an existing chef profile
   */
  async function updateChef(
    updateData: Partial<Chef>,
    id?: string
  ): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Exclude immutable fields and add timestamp
      const { uid, created_at, ...safeUpdateData } = updateData
      const profileData = {
        ...safeUpdateData,
        updated_at: serverTimestamp(),
      }

      const chefRef = doc(db, 'chefs', targetId)
      await updateDoc(chefRef, profileData)

      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(err?.message || 'Failed to update chef profile')
      throw updateError.value
    } finally {
      updating.value = false
    }
  }

  /**
   * Update specific fields of a chef profile (legacy helper - use updateChef instead)
   */
  async function updateChefFields(
    fields: Partial<Chef>,
    uid?: string
  ): Promise<string> {
    return updateChef(fields, uid)
  }

  return {
    updateChef,
    updateChefFields,
    updating,
    updateError,
  }
}
