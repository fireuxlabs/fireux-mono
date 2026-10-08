import * as admin from 'firebase-admin'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import {
  applicationDefault,
  cert,
  type App,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app'
import { useRuntimeConfig } from '#imports'

type ExplicitServiceAccount = {
  projectId: string
  clientEmail: string
  privateKey: string
}

function readEnv(k: string) {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
}

function normalizeStorageBucket(bucket?: string) {
  if (!bucket) return undefined
  const trimmed = bucket.trim()
  return trimmed.length ? trimmed : undefined
}

function parseServiceAccount(
  value: unknown
): ExplicitServiceAccount | undefined {
  if (!value || typeof value !== 'object') return undefined

  const parsed = value as Record<string, unknown>
  const projectId = parsed.project_id ?? parsed.projectId
  const clientEmail = parsed.client_email ?? parsed.clientEmail
  const rawKey = parsed.private_key ?? parsed.privateKey
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined

  if (
    typeof projectId === 'string' &&
    projectId.trim() &&
    typeof clientEmail === 'string' &&
    clientEmail.trim() &&
    privateKey
  ) {
    return {
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey,
    }
  }
}

function parseServiceAccountJson(
  value: string,
  source: 'FIREBASE_SERVICE_ACCOUNT' | 'FIREBASE_SERVICE_ACCOUNT_FILE'
) {
  let parsed: unknown
  try {
    const inline =
      source === 'FIREBASE_SERVICE_ACCOUNT' && !value.trim().startsWith('{')
        ? Buffer.from(value.trim(), 'base64').toString('utf8')
        : value
    parsed = JSON.parse(inline)
  } catch {
    throw new Error(`${source} is set but does not contain valid JSON.`)
  }

  const serviceAccount = parseServiceAccount(parsed)
  if (!serviceAccount) {
    throw new Error(
      `${source} is missing project_id, client_email, or private_key.`
    )
  }
  return serviceAccount
}

function getServiceAccountFromEnv(): ExplicitServiceAccount | undefined {
  const json = readEnv('FIREBASE_SERVICE_ACCOUNT')
  if (json) {
    return parseServiceAccountJson(json, 'FIREBASE_SERVICE_ACCOUNT')
  }

  const serviceAccountFile = readEnv('FIREBASE_SERVICE_ACCOUNT_FILE')
  if (serviceAccountFile) {
    const filePath = isAbsolute(serviceAccountFile.trim())
      ? serviceAccountFile.trim()
      : resolve(process.cwd(), serviceAccountFile.trim())
    let source: string
    try {
      source = readFileSync(filePath, 'utf8')
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_FILE could not be read.')
    }
    return parseServiceAccountJson(source, 'FIREBASE_SERVICE_ACCOUNT_FILE')
  }

  const projectId = readEnv('FIREBASE_PROJECT_ID')
  const clientEmail = readEnv('FIREBASE_CLIENT_EMAIL')
  const rawKey = readEnv('FIREBASE_PRIVATE_KEY')
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
  if (clientEmail || privateKey) {
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Split Firebase credentials require FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY together.'
      )
    }
    return { projectId, clientEmail, privateKey }
  }
}

function getRuntimeFirebaseProjectId() {
  try {
    const runtime = useRuntimeConfig()
    const projectId = String(
      runtime.public?.firebaseEcosystem?.firebase?.projectId ||
        readEnv('FIREBASE_PROJECT_ID') ||
        readEnv('GOOGLE_CLOUD_PROJECT') ||
        ''
    ).trim()
    return projectId || undefined
  } catch {
    return (
      readEnv('FIREBASE_PROJECT_ID')?.trim() ||
      readEnv('GOOGLE_CLOUD_PROJECT')?.trim()
    )
  }
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
      const projectId = getRuntimeFirebaseProjectId()
      const serviceAccountId = readEnv('FIREBASE_SERVICE_ACCOUNT_ID')?.trim()
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
          ...(projectId ? { projectId } : {}),
          ...(serviceAccountId ? { serviceAccountId } : {}),
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
