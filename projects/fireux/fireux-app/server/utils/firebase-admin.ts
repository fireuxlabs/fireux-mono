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

  const existing = getApps()
  if (existing.length) {
    cachedApp = existing[0]
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
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
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

  return configuredDatabaseId ? getFirestore(app, configuredDatabaseId) : getFirestore(app)
}
