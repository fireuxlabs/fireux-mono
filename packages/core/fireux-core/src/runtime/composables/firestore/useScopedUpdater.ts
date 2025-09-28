import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'
import { useFirestoreUpdate } from './useFirestoreUpdate'

/**
 * Minimal helper to route updates to core or tenant scopes.
 * - "users" maps to: core-users (global) OR apps/{appId}/users (tenant)
 * - Other tenant-only collections (e.g. "chefs") always map to apps/{appId}/{collection}
 */
export function useScopedUpdater() {
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { waitForCurrentUser } = useFirestoreUtils()
  const { updateDocument } = useFirestoreUpdate()
  const isDev = typeof process !== 'undefined' && (process as any).dev === true
  const dlog = (...args: any[]) => {
    if (isDev) console.log('[avatar-trace][ScopedUpdater]', ...args)
  }

  async function getUid(): Promise<string> {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  async function updateUsers(data: Record<string, unknown>) {
    const uid = await getUid()
    if (isTenant && appId) {
      dlog('updateUsers:tenant', { appId, uid, keys: Object.keys(data) })
      return updateDocument(`apps/${appId}/users`, uid, data)
    }
    // Global: never tag core doc with app metadata
    dlog('updateUsers:core', { uid, keys: Object.keys(data) })
    return updateDocument('core-users', uid, data, { appScoped: false })
  }

  async function updateTenantCollection(
    collection: string,
    data: Record<string, unknown>
  ) {
    if (!isTenant || !appId) {
      throw new Error(`Collection "${collection}" is tenant-only`)
    }
    const uid = await getUid()
    dlog('updateTenantCollection', {
      collection,
      appId,
      uid,
      keys: Object.keys(data),
    })
    return updateDocument(`apps/${appId}/${collection}`, uid, data)
  }

  return { updateUsers, updateTenantCollection }
}
