import { useFirestoreDelete } from '../../composables/fireux/firestore/operations/useFirestoreDelete'

/** Delete exactly one AppUser relationship document. */
export function useAppUserDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteAppUser(appId: string, userId: string) {
    const app = String(appId || '').trim()
    const user = String(userId || '').trim()
    if (!app || !user) throw new Error('App id and User id are required.')
    await deleteDocument(`apps/${app}/users`, user)
  }
  return { deleteAppUser }
}
