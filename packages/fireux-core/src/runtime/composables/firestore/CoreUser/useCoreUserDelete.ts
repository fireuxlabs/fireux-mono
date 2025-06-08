import { doc, deleteDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export function useCoreUserDelete() {
  const db = useFirestore()

  async function deleteCoreUser(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('[deleteCoreUser] User ID is required.')
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      console.log(
        `✅ [deleteCoreUser] Core user with ID ${userId} deleted successfully.`
      )
    } catch (error) {
      console.error(
        `[deleteCoreUser] Error deleting core user with ID ${userId}:`,
        error
      )
      throw error
    }
  }

  return {
    deleteCoreUser,
  }
}
