import { unref, type MaybeRef } from 'vue'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import { useFirestoreUpdate } from '../../composables/fireux/firestore/operations/useFirestoreUpdate'
import type { User } from '../models/user.model'

/** Update exactly one root User document; no relationship is changed. */
export function useUserUpdate(userId: MaybeRef<string>) {
  const { updateDocument } = useFirestoreUpdate({ databaseId: readRuntimeIdentityFirestoreDatabaseId() })
  async function updateUser(changes: Partial<Omit<User, 'id'>>) {
    const id = String(unref(userId) || '').trim()
    if (!id) throw new Error('User id is required.')
    await updateDocument<User>('users', id, changes, { stamp: false })
  }
  return { updateUser }
}
