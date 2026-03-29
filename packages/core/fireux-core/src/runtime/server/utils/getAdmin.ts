import * as admin from 'firebase-admin'
import {
  applicationDefault,
  cert,
  type App,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app'

function readEnv(k: string) {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
}

function normalizeStorageBucket(bucket?: string) {
  if (!bucket) return undefined
  const trimmed = bucket.trim()
  return trimmed.length ? trimmed : undefined
}

function getServiceAccountFromEnv():
  | { projectId: string; clientEmail: string; privateKey: string }
  | undefined {
  const json = readEnv('FIREBASE_SERVICE_ACCOUNT')
  if (json) {
    try {
      const parsed = JSON.parse(json)
      const projectId = parsed.project_id ?? parsed.projectId
      const clientEmail = parsed.client_email ?? parsed.clientEmail
      const rawKey = parsed.private_key ?? parsed.privateKey
      const privateKey =
        typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
      if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey }
      }
    } catch {
      // ignore
    }
  }
  const projectId = readEnv('FIREBASE_PROJECT_ID')
  const clientEmail = readEnv('FIREBASE_CLIENT_EMAIL')
  const rawKey = readEnv('FIREBASE_PRIVATE_KEY')
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
  if (projectId && clientEmail && privateKey)
    return { projectId, clientEmail, privateKey }
}

function hasInitializedAdminApp(): boolean {
  try {
    return getApps().length > 0
  } catch {
    return false
  }
}

function getInitializedAdminApp(): App | undefined {
  try {
    // Prefer the default app when it exists.
    return getApp()
  } catch {
    // Some runtimes may initialize a named admin app first.
    // In that case, any initialized app instance is sufficient.
    const apps = getApps()
    return apps[0]
  }
}

// Guarded singleton accessor for firebase-admin
export function getAdminApp() {
  let app = getInitializedAdminApp()

  if (!app) {
    try {
      const sa = getServiceAccountFromEnv()
      const storageBucket = normalizeStorageBucket(
        readEnv('FIREBASE_STORAGE_BUCKET')
      )
      if (sa) {
        initializeApp({
          credential: cert({
            projectId: sa.projectId,
            clientEmail: sa.clientEmail,
            privateKey: sa.privateKey,
          }),
          ...(storageBucket ? { storageBucket } : {}),
        })
      } else {
        initializeApp({
          credential: applicationDefault(),
          ...(storageBucket ? { storageBucket } : {}),
        })
      }
    } catch (error) {
      // Ignore duplicate init races, but do not hide real initialization failures.
      if (!hasInitializedAdminApp()) throw error
    }
    app = getInitializedAdminApp()
  }

  if (!app) {
    throw new Error(
      '[getAdminApp] firebase-admin initialization did not produce an app instance'
    )
  }

  return app
}

// Guarded singleton accessor for firebase-admin compat namespace
export function getAdmin() {
  getAdminApp()
  return admin
}
