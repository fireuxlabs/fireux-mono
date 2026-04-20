import {
  applicationDefault as firebaseApplicationDefault,
  cert as firebaseCert,
  getApps as getFirebaseApps,
  initializeApp as initializeFirebaseApp,
  type App as FirebaseApp,
} from 'firebase-admin/app'
import { createError } from 'h3'
import type { App } from '../../models/core/app.model'
import type { ProjectStatus, ProjectType } from '../../models/system/project.model'
import type { EcosystemSurface } from '../../composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface'
import type { ProjectSurface } from '../../composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { normalizeSlug } from '../../utils/slug/normalizeSlug'
import { getRuntimeFirestore } from './getRuntimeFirestore'
import { getFirestore } from 'firebase-admin/firestore'

type FireuxConsoleProject = Pick<
  ProjectSurface,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'image_url'
  | 'status'
  | 'project_type'
  | 'source_url'
  | 'console_endpoint_url'
  | 'app_id'
  | 'ecosystem_id'
  | 'firebase_project_id'
>

type FireuxConsoleEcosystem = EcosystemSurface & { id: string }
type FireuxConsoleAppRef = {
  id: string
  url: string
}
type DefaultAppRecord = Partial<App> & { id: string }

type FireuxConsoleProjectControl = {
  main_app_id: string
  main_ecosystem_id: string
}

export type FireuxConsolePayload = {
  ok: true
  project: FireuxConsoleProject
  ecosystem: FireuxConsoleEcosystem | null
  apps: FireuxConsoleAppRef[]
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

function readNestedString(record: Record<string, unknown>, pathGroups: string[][]) {
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

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => normalizeString(entry)).filter(Boolean)
}

function normalizeLifecycleStatus(value: unknown): ProjectStatus {
  const normalized = normalizeString(value)
  if (
    normalized === 'draft' ||
    normalized === 'active' ||
    normalized === 'paused' ||
    normalized === 'archived'
  ) {
    return normalized
  }

  return 'active'
}

function normalizeProjectType(hasEcosystem: boolean): ProjectType {
  return hasEcosystem ? 'ecosystem_app' : 'standalone_app'
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

function normalizeApp(docId: string, data: Record<string, unknown>): DefaultAppRecord {
  const socialLinks =
    data.social_links && typeof data.social_links === 'object' && !Array.isArray(data.social_links)
      ? (data.social_links as Record<string, unknown>)
      : {}

  return {
    id: docId,
    project_id: firstString(data, ['project_id']),
    ecosystem_id: firstString(data, ['ecosystem_id']),
    slug: firstString(data, ['slug']) || docId,
    status: normalizeLifecycleStatus(data.status),
    team: firstString(data, ['team']),
    app_name: firstString(data, ['app_name', 'name', 'app_short_name']) || docId,
    app_short_name: firstString(data, ['app_short_name', 'app_name', 'name']) || docId,
    role: firstString(data, ['role']),
    ecosystem: firstString(data, ['ecosystem']),
    tagline: firstString(data, ['tagline']),
    description: firstString(data, ['description']),
    short_bio: firstString(data, ['short_bio']),
    long_bio: firstString(data, ['long_bio']),
    social_links: {
      website:
        firstString(data, ['source_url', 'site_url', 'app_url', 'url']) ||
        normalizeString(socialLinks.website),
      twitter: normalizeString(socialLinks.twitter),
      github: normalizeString(socialLinks.github),
      linkedin: normalizeString(socialLinks.linkedin),
      instagram: normalizeString(socialLinks.instagram),
      facebook: normalizeString(socialLinks.facebook),
      youtube: normalizeString(socialLinks.youtube),
      email: normalizeString(socialLinks.email),
    },
    derived: {
      user_count:
        typeof (data.derived as Record<string, unknown> | undefined)?.user_count === 'number'
          ? ((data.derived as Record<string, unknown>).user_count as number)
          : 0,
    },
    media: {
      thumbnail_url:
        readNestedString(data, [['media', 'thumbnail_url']]) ||
        firstString(data, ['thumbnail_url']),
      logo_url:
        readNestedString(data, [['media', 'logo_url']]) ||
        firstString(data, ['logo_url', 'image_url']),
      wordmark_light_url:
        readNestedString(data, [['media', 'wordmark_light_url']]) ||
        firstString(data, ['wordmark_light_url']),
      wordmark_dark_url:
        readNestedString(data, [['media', 'wordmark_dark_url']]) ||
        firstString(data, ['wordmark_dark_url']),
      cover_url:
        readNestedString(data, [['media', 'cover_url']]) ||
        firstString(data, ['cover_url']),
    },
    join_requests: toStringArray(data.join_requests),
    admin_ids: toStringArray(data.admin_ids),
    moderation_state: firstString(data, ['moderation_state']),
    ban_reasons: toStringArray(data.ban_reasons),
    created:
      data.created && typeof data.created === 'object' && !Array.isArray(data.created)
        ? (data.created as App['created'])
        : undefined,
    updated:
      data.updated && typeof data.updated === 'object' && !Array.isArray(data.updated)
        ? (data.updated as App['updated'])
        : undefined,
  }
}

async function listOperationalApps() {
  const db = getRuntimeFirestore()
  const snapshot = await db.collection('apps').get()

  return snapshot.docs
    .map((doc) => normalizeApp(doc.id, (doc.data() as Record<string, unknown>) || {}))
    .sort((a, b) => a.id.localeCompare(b.id))
}

function toAppRef(app: DefaultAppRecord): FireuxConsoleAppRef {
  return {
    id: app.id,
    url: normalizeString(app.social_links?.website),
  }
}

function normalizeEcosystemId(docId: string, data: Record<string, unknown>) {
  const slug = firstString(data, ['slug'])
  if (slug) return slug

  const storedId = firstString(data, ['id'])
  if (storedId.startsWith('fireux-')) {
    return storedId.replace(/^fireux-/, '')
  }
  if (storedId) return storedId

  const normalizedDocId = normalizeString(docId)
  if (normalizedDocId.startsWith('fireux-')) {
    return normalizedDocId.replace(/^fireux-/, '')
  }

  return normalizedDocId
}

function normalizeEcosystem(docId: string, data: Record<string, unknown>): FireuxConsoleEcosystem {
  const ecosystemId = normalizeEcosystemId(docId, data)

  return {
    id: ecosystemId,
    project_id: firstString(data, ['project_id']),
    name: firstString(data, ['name']),
    slug: firstString(data, ['slug']) || ecosystemId,
    description: firstString(data, ['description']),
    image_url: firstString(data, ['image_url']),
    source_url: firstString(data, ['source_url']),
    status: normalizeLifecycleStatus(data.status),
    team: firstString(data, ['team']),
    apps: toStringArray(data.apps),
    created:
      data.created && typeof data.created === 'object' && !Array.isArray(data.created)
        ? (data.created as FireuxConsoleEcosystem['created'])
        : undefined,
    updated:
      data.updated && typeof data.updated === 'object' && !Array.isArray(data.updated)
        ? (data.updated as FireuxConsoleEcosystem['updated'])
        : undefined,
  }
}

async function readCurrentEcosystem(
  control: FireuxConsoleProjectControl
): Promise<FireuxConsoleEcosystem | null> {
  const db = getFirestore(getAdminApp())
  const snapshot = await db.collection('ecosystem').get()
  const target = normalizeString(control.main_ecosystem_id)

  const docs = snapshot.docs.map((doc) =>
    normalizeEcosystem(doc.id, (doc.data() as Record<string, unknown>) || {})
  )

  if (!docs.length) return null

  if (target) {
    const exact =
      docs.find((entry) => entry.id === target) ||
      docs.find((entry) => entry.slug === target)

    if (exact) return exact
  }

  return docs[0] ?? null
}

function buildProject(
  firebaseProjectId: string,
  control: FireuxConsoleProjectControl,
  mainApp: DefaultAppRecord | null,
  ecosystem: FireuxConsoleEcosystem | null
): FireuxConsoleProject {
  const sourceUrl =
    normalizeString(ecosystem?.source_url) ||
    normalizeString(mainApp?.social_links?.website) ||
    ''

  const name =
    normalizeString(ecosystem?.name) ||
    normalizeString(mainApp?.app_name) ||
    normalizeString(mainApp?.app_short_name) ||
    firebaseProjectId

  const slug =
    normalizeString(ecosystem?.slug) ||
    normalizeString(mainApp?.project_id) ||
    normalizeString(control.main_ecosystem_id) ||
    normalizeString(mainApp?.ecosystem_id) ||
    normalizeSlug(name) ||
    firebaseProjectId

  return {
    id: slug,
    name,
    slug,
    description:
      normalizeString(ecosystem?.description) ||
      normalizeString(mainApp?.description) ||
      normalizeString(mainApp?.short_bio) ||
      normalizeString(mainApp?.tagline),
    image_url:
      normalizeString(ecosystem?.image_url) ||
      normalizeString(mainApp?.media?.logo_url) ||
      normalizeString(mainApp?.media?.thumbnail_url),
    status: normalizeLifecycleStatus(ecosystem?.status || mainApp?.status),
    project_type: normalizeProjectType(Boolean(ecosystem)),
    source_url: sourceUrl,
    console_endpoint_url: sourceUrl ? `${sourceUrl.replace(/\/+$/, '')}/api/fireux-console` : '',
    app_id: normalizeString(control.main_app_id) || normalizeString(mainApp?.id),
    ecosystem_id:
      normalizeString(ecosystem?.slug) ||
      normalizeString(control.main_ecosystem_id) ||
      normalizeString(mainApp?.ecosystem_id),
    firebase_project_id: firebaseProjectId,
  }
}

export async function buildFireuxConsoleResponse(
  firebaseProjectId: string
): Promise<FireuxConsolePayload> {
  const projectId = normalizeString(firebaseProjectId)

  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  const control = await readProjectControl(projectId)
  const apps = await listOperationalApps()
  const ecosystem = await readCurrentEcosystem(control)

  const mainApp =
    apps.find((entry) => entry.id === control.main_app_id) ||
    apps.find((entry) => entry.role === 'global') ||
    apps[0] ||
    null

  return {
    ok: true,
    project: buildProject(projectId, control, mainApp, ecosystem),
    ecosystem,
    apps: apps.map((app) => toAppRef(app)).filter((app) => Boolean(app.id && app.url)),
  }
}
