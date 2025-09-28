import * as admin from 'firebase-admin'

function readEnv(k: string) {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
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

// Guarded singleton accessor for firebase-admin
export function getAdmin() {
  if (!admin.apps.length) {
    try {
      const sa = getServiceAccountFromEnv()
      const storageBucket = readEnv('FIREBASE_STORAGE_BUCKET')
      if (sa) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: sa.projectId,
            clientEmail: sa.clientEmail,
            privateKey: sa.privateKey,
          }),
          ...(storageBucket ? { storageBucket } : {}),
        })
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          ...(storageBucket ? { storageBucket } : {}),
        })
      }
    } catch {
      // In case of race during dev HMR, ignore
    }
  }
  return admin
}
