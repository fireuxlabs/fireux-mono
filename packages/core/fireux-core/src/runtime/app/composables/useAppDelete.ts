import { useFirestoreDelete } from '../../composables/fireux/firestore/operations/useFirestoreDelete'

/** Delete only the App root document. This does not cascade. */
export function useAppDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteApp(appId: string) {
    const id = String(appId || '').trim()
    if (!id) throw new Error('App id is required.')
    await deleteDocument('apps', id)
  }

  return { deleteApp }
}
