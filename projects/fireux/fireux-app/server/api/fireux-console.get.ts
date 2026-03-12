import {
  createError,
  defineEventHandler,
  setResponseHeaders,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import {
  applicationDefault as firebaseApplicationDefault,
  cert as firebaseCert,
  getApps as getFirebaseApps,
  initializeApp as initializeFirebaseApp,
  type App as FirebaseApp,
} from 'firebase-admin/app'

type FirestoreDatabasesResponse = {
  databases?: Array<{
    name?: string
  }>
}

function readEnv(name: string) {
  return String(process.env[name] || '').trim()
}

function getServiceAccountFromEnv() {
  const raw = readEnv('FIREBASE_SERVICE_ACCOUNT')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const projectId = String(parsed.project_id || parsed.projectId || '').trim()
    const clientEmail = String(parsed.client_email || parsed.clientEmail || '').trim()
    const privateKey = String(parsed.private_key || parsed.privateKey || '')
      .replace(/\\n/g, '\n')
      .trim()

    if (!projectId || !clientEmail || !privateKey) return null

    return {
      projectId,
      clientEmail,
      privateKey,
    }
  } catch {
    return null
  }
}

function getAdminApp(): FirebaseApp {
  const existing = getFirebaseApps()
  if (existing.length) return existing[0]

  const serviceAccount = getServiceAccountFromEnv()
  if (serviceAccount) {
    return initializeFirebaseApp({
      credential: firebaseCert(serviceAccount),
    })
  }

  return initializeFirebaseApp({
    credential: firebaseApplicationDefault(),
  })
}

async function listFirestoreDatabases(projectId: string) {
  const app = getAdminApp()
  const credential = app.options.credential as
    | { getAccessToken?: () => Promise<{ access_token: string }> }
    | undefined

  const accessToken = await credential?.getAccessToken?.()
  const token = String(accessToken?.access_token || '').trim()

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to fetch Firebase admin access token',
    })
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Firestore database list failed (${response.status})`,
    })
  }

  const data = (await response.json()) as FirestoreDatabasesResponse

  return (data.databases ?? [])
    .map((entry) => String(entry.name || '').split('/').pop() || '')
    .filter(Boolean)
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const firebaseProjectId = String(
    runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId || ''
  ).trim()

  if (!firebaseProjectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  const databases = await listFirestoreDatabases(firebaseProjectId)

  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    project: {
      id: firebaseProjectId,
    },
    databases,
  }
})
