import { getFirestore } from 'firebase-admin/firestore'
import { useRuntimeConfig } from '#imports'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'

import { ConnectionError } from 'fireux-core/runtime/user/server/connections/protocol'
import type { ConnectionStore } from './service'

export function privateConnectionDatabase() {
  const config = useRuntimeConfig()
  const raw = config.accountConnections as Record<string, unknown>
  const app = getAdminApp()
  // Never fall back to an ordinary development-open database.
  if (
    raw.databaseId !== 'identity-connections' ||
    (app.options.projectId ||
      (app.options.credential as { projectId?: string })?.projectId) !==
      'fireux-2005'
  )
    throw new ConnectionError(503, 'Account connections are not available yet.')
  return getFirestore(app, 'identity-connections')
}
export function connectionStore(): ConnectionStore {
  const db = privateConnectionDatabase()
  return {
    transaction: (work) =>
      db.runTransaction(async (native) =>
        work({
          get: async (path) => {
            const snapshot = await native.get(db.doc(path))
            return snapshot.exists ? snapshot.data()! : null
          },
          set: (path, value) => {
            native.set(db.doc(path), {
              ...value,
              ...(value.expires ? { expiresAt: new Date(value.expires) } : {}),
            })
          },
          delete: (path) => {
            native.delete(db.doc(path))
          },
        })
      ),
  }
}
