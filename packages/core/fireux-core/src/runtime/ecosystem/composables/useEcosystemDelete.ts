import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreDelete } from '../../composables/fireux/firestore/operations/useFirestoreDelete'

/** Delete only the root Ecosystem document; Apps are not cascaded. */
export function useEcosystemDelete() {
  const { deleteDocument } = useFirestoreDelete({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function deleteEcosystem(id: string) {
    const ecosystemId = String(id || '').trim()
    if (!ecosystemId) throw new Error('Ecosystem id is required.')
    await deleteDocument('ecosystems', ecosystemId)
  }
  return { deleteEcosystem }
}
