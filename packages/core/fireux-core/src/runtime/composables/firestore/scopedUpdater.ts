// packages/core/fireux-core/src/runtime/composables/firestore/scopedUpdater.ts
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'
import { useFirestoreUpdate } from './useFirestoreUpdate'

/**
 * Shared helper to update a profile document in the correct scope.
 * - users: global writes go to core-users/{uid}; tenant writes go to apps/{appId}/users/{uid}
 * - other collections (e.g., chefs): tenant-only under apps/{appId}/{collection}/{uid}
 * Non-tenant writes to tenant-only collections are blocked with a clear error.
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

  return { update }
}
