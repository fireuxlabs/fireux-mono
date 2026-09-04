import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreDelete } from '../../composables/fireux/firestore/operations/useFirestoreDelete'

/** Delete only the root User document; this does not cascade to Auth or AppUser. */
export function useUserDelete() {
  const { deleteDocument } = useFirestoreDelete({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function deleteUser(userId: string) {
    const id = String(userId || '').trim()
    if (!id) throw new Error('User id is required.')
    await deleteDocument('users', id)
  }
  return { deleteUser }
}
