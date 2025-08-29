import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { FieldValue } from 'firebase/firestore'

export function useCoreUserUpdate() {
  const db = useFirestore()

  // Add an appId to userOf array for a core user
  async function addUserApp(uid: string, appId: string) {
    if (!uid || !appId) {
      return Promise.reject(
        new Error('❌ UID and appId are required to add app to userOf.')
      )
    }
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { userOf: arrayUnion(appId) })
    console.log(
      `✅ [addUserApp] App '${appId}' added to userOf for UID: ${uid}`
    )
  }

  // Remove an appId from userOf array for a core user
  async function removeUserApp(uid: string, appId: string) {
    if (!uid || !appId) {
      return Promise.reject(
        new Error('❌ UID and appId are required to remove app from userOf.')
      )
    }
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, { userOf: arrayRemove(appId) })
    console.log(
      `✅ [removeUserApp] App '${appId}' removed from userOf for UID: ${uid}`
    )
  }

  async function updateCoreUser(
    uid: string,
    updates: { [key: string]: FieldValue | Partial<unknown> | undefined | null }
  ) {
    if (!uid || !updates) {
      return Promise.reject(
        new Error('❌ UID and updates are required to update Core User.')
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

  return { updateCoreUser, addUserApp, removeUserApp }
}
