import * as admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { useRuntimeConfig } from '#imports'

const firebaseAdmin = ((admin as any).default ?? admin) as typeof admin

function readEnv(key: string) {
  const value = process.env[key]
  return value?.trim()?.length ? value : undefined
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
      // ignore invalid JSON and fall back to split vars
    }
  }

  const projectId = readEnv('FIREBASE_PROJECT_ID')
  const clientEmail = readEnv('FIREBASE_CLIENT_EMAIL')
  const rawKey = readEnv('FIREBASE_PRIVATE_KEY')
  const privateKey =
    typeof rawKey === 'string' ? rawKey.replace(/\\n/g, '\n') : undefined
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey }
  }
}

function hasDefaultAdminApp() {
  try {
    firebaseAdmin.app()
    return true
  } catch {
    return false
  }
}

export function getProductsAdmin() {
  if (!hasDefaultAdminApp()) {
    const serviceAccount = getServiceAccountFromEnv()
    const storageBucket = normalizeStorageBucket(readEnv('FIREBASE_STORAGE_BUCKET'))

    if (serviceAccount) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
          projectId: serviceAccount.projectId,
          clientEmail: serviceAccount.clientEmail,
          privateKey: serviceAccount.privateKey,
        }),
        ...(storageBucket ? { storageBucket } : {}),
      })
    } else {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.applicationDefault(),
        ...(storageBucket ? { storageBucket } : {}),
      })
    }
  }

  return firebaseAdmin
}

export function getProductsFirestore(databaseId?: string) {
  const runtime = useRuntimeConfig()
  const configuredDatabaseId = String(
    databaseId || runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  const admin = getProductsAdmin()

  return configuredDatabaseId
    ? getFirestore(admin.app(), configuredDatabaseId)
    : getFirestore(admin.app())
}
