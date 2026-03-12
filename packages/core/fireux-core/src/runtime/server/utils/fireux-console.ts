import { createError } from 'h3'
import {
  applicationDefault as firebaseApplicationDefault,
  cert as firebaseCert,
  getApps as getFirebaseApps,
  initializeApp as initializeFirebaseApp,
  type App as FirebaseApp,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

type FirestoreDatabasesResponse = {
  databases?: Array<{
    name?: string
  }>
}

type FireuxConsoleApp = {
  id: string
  name: string
  slug: string
  ecosystem_id: string
}

type FireuxConsoleDatabase = {
  name: string
  apps: FireuxConsoleApp[]
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

async function getAdminAccessToken() {
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

  return token
}

async function listFirestoreDatabaseNames(projectId: string) {
  const token = await getAdminAccessToken()
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

async function listDatabaseApps(databaseId: string) {
  const db = getFirestore(getAdminApp(), databaseId)
  const snapshot = await db.collection('apps').get()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        name: String(data.name || '').trim(),
        slug: String(data.slug || '').trim(),
        ecosystem_id: String(data.ecosystem_id || '').trim(),
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export async function buildFireuxConsoleResponse(firebaseProjectId: string) {
  const projectId = String(firebaseProjectId || '').trim()
  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  const databaseNames = await listFirestoreDatabaseNames(projectId)
  const databases: FireuxConsoleDatabase[] = []

  for (const name of databaseNames) {
    databases.push({
      name,
      apps: await listDatabaseApps(name),
    })
  }

  return {
    ok: true,
    project: {
      id: projectId,
    },
    databases,
  }
}
