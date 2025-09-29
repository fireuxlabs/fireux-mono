// packages/core/fireux-core/src/runtime/composables/firestore/scopedUpdater.ts
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'
import { useFirestoreUpdate } from './useFirestoreUpdate'

/**
 * Scoped updater — writes to the correct collection based on role/appId.
 * - For tenants: writes under apps/{appId}/{collection}/{uid}
 * - For global: only 'users' is allowed → core-users/{uid}
 * - Any other collection without tenant context will throw
 */
export function useScopedUpdater() {
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { waitForCurrentUser } = useFirestoreUtils()
  const { updateDocument } = useFirestoreUpdate()

  async function uid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  function pathFor(collection: string): string {
    if (isTenant && appId) return `apps/${appId}/${collection}`
    if (collection === 'users') return 'core-users'
    throw new Error(`Collection "${collection}" requires tenant context`)
  }

  async function update(collection: string, data: Record<string, unknown>) {
    const id = await uid()
    const path = pathFor(collection)
    await updateDocument(path, id, data)
  }

  return { update }
}
