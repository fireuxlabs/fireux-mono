import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { Ecosystem } from '../models/ecosystem.model'

/** Create exactly one root Ecosystem document. */
export function useEcosystemCreate() {
  const { createDocument } = useFirestoreCreate({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function createEcosystem(input: Ecosystem) {
    const id = String(input.id || '').trim()
    if (!id) throw new Error('Ecosystem id is required.')
    return await createDocument('ecosystems', input, { id, stamp: false })
  }
  return { createEcosystem }
}
