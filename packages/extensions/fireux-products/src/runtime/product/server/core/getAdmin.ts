import { observeRuntimeFirestore } from 'fireux-core/runtime/server/utils/firestore/live-read'
import * as admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { useRuntimeConfig } from '#imports'

const firebaseAdmin = ((admin as any).default ?? admin) as typeof admin

type ExplicitServiceAccount = {
  projectId: string
  clientEmail: string
  privateKey: string
}

function readEnv(key: string) {
  const value = process.env[key]
  return value?.trim()?.length ? value : undefined
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
    parsed = JSON.parse(value)
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
    const storageBucket = normalizeStorageBucket(
      readEnv('FIREBASE_STORAGE_BUCKET')
    )
    const projectId = getRuntimeFirebaseProjectId()
    const serviceAccountId = readEnv('FIREBASE_SERVICE_ACCOUNT_ID')?.trim()

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
        ...(projectId ? { projectId } : {}),
        ...(serviceAccountId ? { serviceAccountId } : {}),
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

  return observeRuntimeFirestore(
    configuredDatabaseId
      ? getFirestore(admin.app(), configuredDatabaseId)
      : getFirestore(admin.app())
  )
}
