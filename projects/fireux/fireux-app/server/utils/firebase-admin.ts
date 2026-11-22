import { getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'

const projectApps = new Map<string, App>()
const projectDatabasesKey = Symbol.for('fireux.platform-directory-databases')
const globalState = globalThis as typeof globalThis & {
  [projectDatabasesKey]?: Map<string, Firestore>
}
const projectDatabases =
  globalState[projectDatabasesKey] ||
  (globalState[projectDatabasesKey] = new Map<string, Firestore>())

/** Read another Firebase project's directory through the trusted control plane. */
export async function getFirestoreProjectDb(
  projectId: string,
  databaseId = '(default)'
): Promise<Firestore> {
  const targetProjectId = String(projectId || '').trim()
  if (!targetProjectId) throw new Error('A Firebase project id is required.')

  const ownerApp = getAdminApp()
  if (ownerApp.options.projectId === targetProjectId) {
    return databaseId === '(default)'
      ? getFirestore(ownerApp)
      : getFirestore(ownerApp, databaseId)
  }

  const databaseKey = `${targetProjectId}/${databaseId}`
  const cachedDatabase = projectDatabases.get(databaseKey)
  if (cachedDatabase) return cachedDatabase

  let targetApp = projectApps.get(targetProjectId)
  if (!targetApp) {
    const appName = `platform-directory-${targetProjectId}`
    targetApp =
      getApps().find((app) => app.name === appName) ||
      initializeApp(
        {
          credential: ownerApp.options.credential,
          projectId: targetProjectId,
        },
        appName
      )
    if (targetApp.options.projectId !== targetProjectId) {
      throw new Error(
        'Directory Admin app does not match its Firebase project.'
      )
    }
    projectApps.set(targetProjectId, targetApp)
  }

  const database =
    databaseId === '(default)'
      ? getFirestore(targetApp)
      : getFirestore(targetApp, databaseId)
  // The cross-project control plane uses Firestore's supported REST transport.
  // This avoids gRPC project-boundary authorization drift while preserving the
  // same Admin credential and IAM checks.
  database.settings({ preferRest: true })
  projectDatabases.set(databaseKey, database)
  return database
}
