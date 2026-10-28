import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { useRuntimeConfig } from '#imports'
import { promises as fs } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

let cachedApp: App | null = null
let cachedAppPromise: Promise<App> | null = null
const projectApps = new Map<string, App>()
const projectDatabasesKey = Symbol.for('fireux.platform-directory-databases')
const globalState = globalThis as typeof globalThis & {
  [projectDatabasesKey]?: Map<string, Firestore>
}
const projectDatabases =
  globalState[projectDatabasesKey] ||
  (globalState[projectDatabasesKey] = new Map<string, Firestore>())

async function loadExplicitServiceAccount(): Promise<ServiceAccount | null> {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  if (inline) {
    const raw = inline.startsWith('{')
      ? inline
      : Buffer.from(inline, 'base64').toString('utf8')
    return JSON.parse(raw) as ServiceAccount
  }

  const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE?.trim()
  if (credentialsPath) {
    const absolutePath = isAbsolute(credentialsPath)
      ? credentialsPath
      : resolve(process.cwd(), credentialsPath)
    const file = await fs.readFile(absolutePath, 'utf-8')
    return JSON.parse(file) as ServiceAccount
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()
  if (clientEmail || privateKey) {
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Split Firebase credentials require FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY together.'
      )
    }
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }
  }

  return null
}

export async function getFirebaseAdminApp(): Promise<App> {
  if (cachedApp) return cachedApp

  const existing = getApps()[0]
  if (existing) {
    cachedApp = existing
    return cachedApp
  }

  if (!cachedAppPromise) {
    const runtime = useRuntimeConfig()
    cachedAppPromise = (async () => {
      const serviceAccount = await loadExplicitServiceAccount()
      const appAfterCredentialLoad = getApps()[0]
      if (appAfterCredentialLoad) return appAfterCredentialLoad

      const projectId = String(
        runtime.public?.firebaseEcosystem?.firebase?.projectId ||
          process.env.FIREBASE_PROJECT_ID ||
          process.env.GOOGLE_CLOUD_PROJECT ||
          ''
      ).trim()
      const serviceAccountId = String(
        process.env.FIREBASE_SERVICE_ACCOUNT_ID || ''
      ).trim()

      return initializeApp({
        // ADC honors GOOGLE_APPLICATION_CREDENTIALS, local gcloud ADC, and an
        // attached service account in Google-hosted production runtimes.
        credential: serviceAccount
          ? cert(serviceAccount)
          : applicationDefault(),
        ...(projectId ? { projectId } : {}),
        ...(serviceAccountId ? { serviceAccountId } : {}),
      })
    })()
  }

  try {
    cachedApp = await cachedAppPromise
    return cachedApp
  } catch (error) {
    cachedAppPromise = null
    throw error
  }
}

export async function getFirestoreDb(databaseId?: string): Promise<Firestore> {
  const app = await getFirebaseAdminApp()
  const runtime = useRuntimeConfig()
  const configuredDatabaseId = String(
    databaseId || runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

  return configuredDatabaseId && configuredDatabaseId !== '(default)'
    ? getFirestore(app, configuredDatabaseId)
    : getFirestore(app)
}

/** Read another Firebase project's directory through the trusted control plane. */
export async function getFirestoreProjectDb(
  projectId: string,
  databaseId = '(default)'
): Promise<Firestore> {
  const targetProjectId = String(projectId || '').trim()
  if (!targetProjectId) throw new Error('A Firebase project id is required.')

  const ownerApp = await getFirebaseAdminApp()
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
