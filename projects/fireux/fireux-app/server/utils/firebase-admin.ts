import {
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

async function loadServiceAccount(): Promise<ServiceAccount> {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT
  if (inline) {
    return JSON.parse(inline)
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsPath) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS must point to a Firebase service-account JSON'
    )
  }

  const absolutePath = isAbsolute(credentialsPath)
    ? credentialsPath
    : resolve(process.cwd(), credentialsPath)
  const file = await fs.readFile(absolutePath, 'utf-8')
  return JSON.parse(file) as ServiceAccount
}

export async function getFirebaseAdminApp(): Promise<App> {
  if (cachedApp) return cachedApp

  const existing = getApps()
  if (existing.length) {
    cachedApp = existing[0]
    return cachedApp
  }

  const serviceAccount = await loadServiceAccount()
  cachedApp = initializeApp({ credential: cert(serviceAccount) })
  return cachedApp
}

export async function getFirestoreDb(databaseId?: string): Promise<Firestore> {
  const app = await getFirebaseAdminApp()
  const runtime = useRuntimeConfig()
  const configuredDatabaseId = String(
    databaseId || runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

  return configuredDatabaseId ? getFirestore(app, configuredDatabaseId) : getFirestore(app)
}
