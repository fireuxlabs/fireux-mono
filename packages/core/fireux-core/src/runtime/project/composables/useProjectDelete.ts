import { unref, type MaybeRef } from 'vue'
import { useFirestoreDelete } from '../../composables/fireux/firestore/operations/useFirestoreDelete'

export function useProjectDelete(id: MaybeRef<string | null | undefined>) {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteProject() {
    await deleteDocument('projects', String(unref(id) || '').trim())
  }

  return { deleteProject }
}
