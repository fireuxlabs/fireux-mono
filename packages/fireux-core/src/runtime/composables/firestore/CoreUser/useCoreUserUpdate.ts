import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { FieldValue } from 'firebase/firestore'

export function useCoreUserUpdate() {
  const db = useFirestore()

  async function updateCoreUser(
    uid: string,
    updates: { [key: string]: FieldValue | Partial<unknown> | undefined | null }
  ) {
    if (!uid || !updates) {
      return Promise.reject(
        '❌ UID and updates are required to update Core User.'
      )
    }

    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, updates)
      console.log(`✅ [updateCoreUser] Core user with UID: ${uid} updated.`)
    } catch (error) {
      console.error(
        `❌ [updateCoreUser] Error updating Core user with UID: ${uid}`,
        error
      )
      throw error
    }
  }

  return { updateCoreUser }
}
