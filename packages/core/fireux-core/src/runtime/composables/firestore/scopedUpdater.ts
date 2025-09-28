// packages/core/fireux-core/src/runtime/composables/firestore/scopedUpdater.ts
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'
import { useFirestoreUpdate } from './useFirestoreUpdate'

/**
 * Scoped updater — writes to the correct collection based on role/appId.
 * - 'users': global → core-users/{uid}; tenant → apps/{appId}/users/{uid}
 * - tenant-only collections (e.g., 'chefs'): apps/{appId}/{collection}/{uid}
 *   (throws if called outside tenant context)
 */
export function useScopedUpdater(collectionKey: 'users' | 'chefs') {
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { waitForCurrentUser } = useFirestoreUtils()
  const { updateDocument } = useFirestoreUpdate()

  async function uid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  // Choose collection path based on tenancy
  function pathFor(collection = collectionKey): {
    path: string
    appScoped: boolean
  } {
    if (isTenant && appId)
      return { path: `apps/${appId}/${collection}`, appScoped: true }
    // Global writes only allowed for the signed-in "user" profile
    if (collection === 'users') return { path: 'core-users', appScoped: false }
    throw new Error(`Collection "${collection}" requires tenant context`)
  }

  async function update(
    data: Record<string, unknown>,
    collection = collectionKey
  ) {
    const id = await uid()
    const { path, appScoped } = pathFor(collection)
    // Avoid tagging core-users with appId when global
    await updateDocument(path, id, { ...data }, { appScoped })
  }

  // Optional alias to address an explicit collection key
  async function updateIn(
    collection: 'users' | 'chefs',
    data: Record<string, unknown>
  ) {
    return update(data, collection)
  }

  return { update, updateIn }
}
