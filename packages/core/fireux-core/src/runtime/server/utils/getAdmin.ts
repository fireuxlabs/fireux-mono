import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app'
import { useRuntimeConfig } from '#imports'

const ADMIN_APP_NAME = 'vuefire-admin'

type ExplicitServiceAccount = {
  projectId: string
  clientEmail: string
  privateKey: string
}

function readEnv(k: string) {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
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

/** Share the Ecosystem-bound Admin app between Nitro and VueFire SSR. */
export function getAdminApp() {
  const runtime = useRuntimeConfig()
  const projectId =
    runtime.public.firebaseEcosystem?.firebase?.projectId?.trim()
  if (!projectId) {
    throw new Error(
      '[fireux-core/firebase] An Ecosystem Firebase project is required for Admin access.'
    )
  }

  const options = runtime.vuefire?.admin?.options
  const vuefireProjects = [
    options?.projectId?.trim(),
    runtime.public.vuefire?.config?.projectId?.trim(),
  ]
  if (vuefireProjects.some((value) => value && value !== projectId)) {
    throw new Error(
      '[fireux-core/firebase] VueFire project configuration conflicts with the Ecosystem Firebase project.'
    )
  }

  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME)
  if (existing) {
    if (existing.options.projectId !== projectId) {
      throw new Error(
        '[fireux-core/firebase] Existing vuefire-admin app targets a different project than the Ecosystem Firebase binding.'
      )
    }
    return existing
  }

  // Keep lookup, credential selection and native initialization synchronous.
  const serviceAccount = getServiceAccountFromEnv()
  const serviceAccountId =
    options?.serviceAccountId?.trim() ||
    readEnv('FIREBASE_SERVICE_ACCOUNT_ID')?.trim()
  const storageBucket =
    options?.storageBucket?.trim() || readEnv('FIREBASE_STORAGE_BUCKET')?.trim()
  return initializeApp(
    {
      ...options,
      projectId,
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      ...(serviceAccountId ? { serviceAccountId } : {}),
      ...(storageBucket ? { storageBucket } : {}),
    },
    ADMIN_APP_NAME
  )
}
