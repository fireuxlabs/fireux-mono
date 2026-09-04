import { unref, type MaybeRef } from 'vue'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreUpdate } from '../../composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Ecosystem } from '../models/ecosystem.model'

/** Update exactly one root Ecosystem document. */
export function useEcosystemUpdate(id: MaybeRef<string>) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function updateEcosystem(changes: Partial<Omit<Ecosystem, 'id'>>) {
    const ecosystemId = String(unref(id) || '').trim()
    if (!ecosystemId) throw new Error('Ecosystem id is required.')
    await updateDocument<Ecosystem>('ecosystems', ecosystemId, changes, { stamp: false })
  }
  return { updateEcosystem }
}
