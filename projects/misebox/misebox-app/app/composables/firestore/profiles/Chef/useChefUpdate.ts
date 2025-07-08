import { ref, readonly } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Chef } from '../../../../models/Chef.model'

export function useChefUpdate() {
  const db = useFirestore()
  const updating = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Update an existing chef profile
   */
  async function updateChef(uid: string, chefData: Partial<Chef>) {
    updating.value = true
    error.value = null

    try {
      // Create update data (exclude uid to prevent overwriting)
      const updateData = { ...chefData }
      delete updateData.uid

      const chefRef = doc(db, 'chefs', uid)
      await updateDoc(chefRef, {
        ...updateData,
        updated_at: serverTimestamp(),
      })

      return {
        success: true,
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Failed to update chef')
      // Error logged for debugging
      return {
        success: false,
        error: error.value.message,
      }
    } finally {
      updating.value = false
    }
  }

  /**
   * Update specific fields of a chef profile
   */
  async function updateChefFields(uid: string, fields: Partial<Chef>) {
    return updateChef(uid, fields)
  }

  return {
    updateChef,
    updateChefFields,
    updating: readonly(updating),
    error: readonly(error),
  }
}
