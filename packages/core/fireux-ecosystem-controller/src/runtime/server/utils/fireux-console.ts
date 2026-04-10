import {
  applicationDefault as firebaseApplicationDefault,
  cert as firebaseCert,
  getApps as getFirebaseApps,
  initializeApp as initializeFirebaseApp,
  type App as FirebaseApp,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

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
  website: string
  image_url: string
  logo_url: string
  thumbnail_url: string
}

type FireuxConsoleDatabase = {
  name: string
  apps: FireuxConsoleApp[]
}

type FireuxConsoleEcosystem = {
  id: string
  project_id: string
  name: string
  slug: string
  description: string
  image_url: string
  source_url: string
  team: string
  status: string
  apps: string[]
}

type FireuxConsoleProjectControl = {
  main_app_id: string
  main_ecosystem_id: string
}

type FireuxConsoleProjectMeta = {
  name: string
  slug: string
  description: string
  image_url: string
  project_type: 'standalone-app' | 'ecosystem-app'
  source_url: string
  console_endpoint_url: string
  app_id: string
  ecosystem_id: string
  firebase_project_id: string
}

function readEnv(name: string) {
  return String(process.env[name] || '').trim()
}

function normalizeString(value: unknown) {
  return String(value || '').trim()
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = normalizeString(record[key])
    if (value) return value
  }
  return ''
}

function readNestedString(
  record: Record<string, unknown>,
  pathGroups: string[][]
) {
  for (const path of pathGroups) {
    let current: unknown = record

    for (const segment of path) {
      if (!current || typeof current !== 'object' || Array.isArray(current)) {
        current = ''
        break
      }

      current = (current as Record<string, unknown>)[segment]
    }

    const value = normalizeString(current)
    if (value) return value
  }

  return ''
}

function getServiceAccountFromEnv() {
  const raw = readEnv('FIREBASE_SERVICE_ACCOUNT')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const projectId = normalizeString(parsed.project_id || parsed.projectId)
    const clientEmail = normalizeString(parsed.client_email || parsed.clientEmail)
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
  const token = normalizeString(accessToken?.access_token)

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
    .map((entry) => normalizeString(entry.name).split('/').pop() || '')
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
        name: firstString(data, ['app_name', 'name', 'app_short_name']),
        slug: firstString(data, ['slug']),
        ecosystem_id: firstString(data, ['ecosystem_id', 'ecosystem']),
        website:
          firstString(data, ['source_url', 'site_url', 'app_url', 'url']) ||
          readNestedString(data, [['social_links', 'website']]),
        image_url:
          firstString(data, ['image_url', 'logo_url', 'icon_url']) ||
          readNestedString(data, [
            ['media', 'logo_url'],
            ['media', 'thumbnail_url'],
            ['media', 'cover_url'],
            ['media', 'wordmark_light_url'],
            ['media', 'wordmark_dark_url'],
          ]),
        logo_url:
          firstString(data, ['logo_url']) ||
          readNestedString(data, [['media', 'logo_url']]),
        thumbnail_url:
          firstString(data, ['thumbnail_url']) ||
          readNestedString(data, [['media', 'thumbnail_url']]),
      } satisfies FireuxConsoleApp
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

async function listEcosystems() {
  const db = getFirestore(getAdminApp())
  const snapshot = await db.collection('ecosystems').get()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Record<string, unknown>

      return {
        id: doc.id,
        project_id: firstString(data, ['project_id']),
        name: firstString(data, ['name']),
        slug: firstString(data, ['slug']),
        description: firstString(data, ['description']),
        image_url: firstString(data, ['image_url']),
        source_url: firstString(data, ['source_url']),
        team: firstString(data, ['team']),
        status: firstString(data, ['status']),
        apps: Array.isArray(data.apps)
          ? data.apps.map((entry) => normalizeString(entry)).filter(Boolean)
          : [],
      } satisfies FireuxConsoleEcosystem
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

async function readProjectControl(projectId: string): Promise<FireuxConsoleProjectControl> {
  const db = getFirestore(getAdminApp())
  const snapshot = await db.collection('project').doc(projectId).get()

  if (!snapshot.exists) {
    return {
      main_app_id: '',
      main_ecosystem_id: '',
    }
  }

  const data = snapshot.data() as Record<string, unknown>

  return {
    main_app_id: firstString(data, ['main_app_id']),
    main_ecosystem_id: firstString(data, ['main_ecosystem_id']),
  }
}

async function readAppDoc(databaseId: string, appId: string) {
  const db = getFirestore(getAdminApp(), databaseId)
  const snapshot = await db.collection('apps').doc(appId).get()

  if (!snapshot.exists) return null

  return snapshot.data() as Record<string, unknown>
}

function buildProjectMeta(
  projectId: string,
  control: FireuxConsoleProjectControl,
  appData: Record<string, unknown> | null
): FireuxConsoleProjectMeta {
  const data = appData ?? {}

  const sourceUrl =
    firstString(data, ['source_url', 'site_url', 'app_url', 'url']) ||
    readNestedString(data, [['social_links', 'website']])

  const imageUrl =
    firstString(data, ['image_url', 'logo_url', 'icon_url']) ||
    readNestedString(data, [
      ['media', 'logo_url'],
      ['media', 'thumbnail_url'],
      ['media', 'cover_url'],
      ['media', 'wordmark_light_url'],
      ['media', 'wordmark_dark_url'],
    ])

  const appId = control.main_app_id || firstString(data, ['id', 'app_id'])
  const ecosystemId =
    control.main_ecosystem_id || firstString(data, ['ecosystem_id', 'ecosystem'])

  const projectType: 'standalone-app' | 'ecosystem-app' =
    ecosystemId ? 'ecosystem-app' : 'standalone-app'

  const name =
    firstString(data, ['app_name', 'name', 'app_short_name']) ||
    appId ||
    projectId

  const slug =
    firstString(data, ['slug']) ||
    normalizeSlug(name) ||
    projectId

  return {
    name,
    slug,
    description: firstString(data, ['description', 'summary', 'tagline']),
    image_url: imageUrl,
    project_type: projectType,
    source_url: sourceUrl,
    console_endpoint_url: sourceUrl ? `${sourceUrl.replace(/\/+$/, '')}/api/fireux-console` : '',
    app_id: appId,
    ecosystem_id: ecosystemId,
    firebase_project_id: projectId,
  }
}

function resolveCurrentEcosystem(
  projectId: string,
  control: FireuxConsoleProjectControl,
  projectMeta: FireuxConsoleProjectMeta,
  ecosystems: FireuxConsoleEcosystem[],
  databases: FireuxConsoleDatabase[]
) {
  const ecosystemKey = normalizeString(control.main_ecosystem_id || projectMeta.ecosystem_id)
  const matched =
    ecosystems.find((entry) => entry.id === ecosystemKey) ||
    ecosystems.find((entry) => entry.slug === ecosystemKey)

  if (matched) {
    return {
      ...matched,
      project_id: matched.project_id || projectId,
      image_url: matched.image_url || projectMeta.image_url,
      source_url: matched.source_url || projectMeta.source_url,
    }
  }

  if (!ecosystemKey && !projectMeta.name) return null

  return {
    id: ecosystemKey || projectMeta.ecosystem_id || projectMeta.slug,
    project_id: projectId,
    name: projectMeta.name,
    slug: ecosystemKey || projectMeta.ecosystem_id || projectMeta.slug,
    description: projectMeta.description,
    image_url: projectMeta.image_url,
    source_url: projectMeta.source_url,
    team: '',
    status: 'active',
    apps:
      databases.find((db) => db.name === ecosystemKey)?.apps.map((app) => app.id) ?? [],
  } satisfies FireuxConsoleEcosystem
}

export async function buildFireuxEcosystemConsoleResponse(firebaseProjectId: string) {
  const projectId = normalizeString(firebaseProjectId)

  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  const control = await readProjectControl(projectId)
  const databaseNames = await listFirestoreDatabaseNames(projectId)
  const databases: FireuxConsoleDatabase[] = []

  for (const name of databaseNames) {
    databases.push({
      name,
      apps: await listDatabaseApps(name),
    })
  }

  let appData: Record<string, unknown> | null = null

  if (control.main_app_id) {
    if (control.main_ecosystem_id) {
      appData = await readAppDoc(control.main_ecosystem_id, control.main_app_id)
    }

    if (!appData) {
      appData = await readAppDoc('(default)', control.main_app_id)
    }
  }

  const project_meta = buildProjectMeta(projectId, control, appData)
  const rawEcosystems = await listEcosystems()
  const ecosystems = rawEcosystems.map((entry) => {
    const isCurrent =
      entry.id === control.main_ecosystem_id || entry.slug === control.main_ecosystem_id

    if (!isCurrent) return entry

    return {
      ...entry,
      project_id: entry.project_id || projectId,
      image_url: entry.image_url || project_meta.image_url,
      source_url: entry.source_url || project_meta.source_url,
    }
  })

  const ecosystem = resolveCurrentEcosystem(
    projectId,
    control,
    project_meta,
    ecosystems,
    databases
  )

  const ecosystem_apps =
    databases.find((db) => db.name === control.main_ecosystem_id)?.apps ?? []

  return {
    ok: true,
    project: {
      id: projectId,
      main_app_id: control.main_app_id,
      main_ecosystem_id: control.main_ecosystem_id,
    },
    project_meta,
    ecosystem,
    ecosystems,
    ecosystem_apps,
    databases,
  }
}
