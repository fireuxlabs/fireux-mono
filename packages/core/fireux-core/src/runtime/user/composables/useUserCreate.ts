import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { User } from '../models/user.model'

/** Create exactly one root User document; no App relationship is created. */
export function useUserCreate() {
  const { createDocument } = useFirestoreCreate({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function createUser(input: User) {
    const id = String(input.id || '').trim()
    if (!id) throw new Error('User id is required.')
    return await createDocument('users', input, { id, stamp: false })
  }
  return { createUser }
}
