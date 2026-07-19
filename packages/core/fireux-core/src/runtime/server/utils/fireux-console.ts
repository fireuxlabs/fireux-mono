import { createError } from 'h3'
import { AppStorage, type App } from '../../models/core/app.model'
import { EcosystemStorage } from '../../models/system/ecosystem.model'
import { ProjectStorage, type ProjectStatus } from '../../models/system/project.model'
import type {
  FireuxConsoleAppRef,
  FireuxConsoleEcosystem,
  FireuxConsolePayload,
  FireuxConsoleProject,
} from '../../types/fireux-console'
import { getRuntimeFirestore } from './getRuntimeFirestore'

type DefaultAppRecord = Partial<App> & { id: string }

type FireuxConsoleProjectControl = {
  main_app_id: string
  main_ecosystem_id: string
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

function requireLifecycleStatus(value: unknown, label: string): ProjectStatus {
  const normalized = normalizeString(value)
  if (
    normalized === 'draft' ||
    normalized === 'active' ||
    normalized === 'paused' ||
    normalized === 'archived'
  ) {
    return normalized
  }

  throw createError({
    statusCode: 502,
    statusMessage: `FireUX console endpoint is missing ${label}.`,
  })
}

function requireString(value: unknown, label: string): string {
  const normalized = normalizeString(value)
  if (normalized) return normalized

  throw createError({
    statusCode: 502,
    statusMessage: `FireUX console endpoint is missing ${label}.`,
  })
}

async function readProjectControl(projectId: string): Promise<FireuxConsoleProjectControl> {
  const db = getRuntimeFirestore()
  const snapshot = await db.collection(ProjectStorage.collection).doc(projectId).get()

  if (!snapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: `FireUX console control doc not found for "${projectId}".`,
    })
  }

  const data = snapshot.data() as Record<string, unknown>

  return {
    main_app_id: requireString(data.main_app_id, 'main_app_id'),
    main_ecosystem_id: requireString(data.main_ecosystem_id, 'main_ecosystem_id'),
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
    slug: firstString(data, ['slug']),
    status: normalizeLifecycleStatus(data.status),
    team: firstString(data, ['team']),
    app_name: firstString(data, ['app_name', 'name']),
    app_short_name: firstString(data, ['app_short_name']),
    role: firstString(data, ['role']),
    ecosystem: firstString(data, ['ecosystem']),
    tagline: firstString(data, ['tagline']),
    description: firstString(data, ['description']),
    short_bio: firstString(data, ['short_bio']),
    long_bio: firstString(data, ['long_bio']),
    social_links: {
      website:
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
  const snapshot = await db.collection(AppStorage.collection).get()

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

function normalizeEcosystem(docId: string, data: Record<string, unknown>): FireuxConsoleEcosystem {
  void docId
  const ecosystemId = requireString(data.id, 'ecosystem id')
  const slug = requireString(data.slug, 'ecosystem slug')

  return {
    id: ecosystemId,
    project_id: requireString(data.project_id, 'ecosystem project_id'),
    name: requireString(data.name, 'ecosystem name'),
    slug,
    description: firstString(data, ['description']),
    image_url: firstString(data, ['image_url']),
    source_url: firstString(data, ['source_url']),
    status: requireLifecycleStatus(data.status, 'ecosystem status'),
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
  const db = getRuntimeFirestore()
  const snapshot = await db.collection(EcosystemStorage.collection).get()
  const target = normalizeString(control.main_ecosystem_id)

  const docs = snapshot.docs.map((doc) =>
    normalizeEcosystem(doc.id, (doc.data() as Record<string, unknown>) || {})
  )

  if (target) {
    const exact =
      docs.find((entry) => entry.id === target) ||
      docs.find((entry) => entry.slug === target)

    if (exact) return exact
  }

  throw createError({
    statusCode: 404,
    statusMessage: `FireUX console ecosystem "${target}" not found.`,
  })
}

function buildProject(
  firebaseProjectId: string,
  control: FireuxConsoleProjectControl,
  mainApp: DefaultAppRecord | null,
  ecosystem: FireuxConsoleEcosystem | null
): FireuxConsoleProject {
  const sourceUrl =
    requireString(ecosystem?.source_url, 'project source_url')

  const name =
    requireString(ecosystem?.name, 'project name')

  const slug =
    requireString(ecosystem?.slug, 'project slug')

  return {
    id: firebaseProjectId,
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
    status: requireLifecycleStatus(ecosystem?.status, 'project status'),
    project_type: 'ecosystem_app',
    source_url: sourceUrl,
    console_endpoint_url: sourceUrl ? `${sourceUrl.replace(/\/+$/, '')}/api/fireux-console` : '',
    app_id: requireString(control.main_app_id, 'project app_id'),
    ecosystem_id:
      requireString(ecosystem?.id, 'project ecosystem_id'),
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
    apps.find((entry) => entry.id === control.main_app_id) || null

  if (!mainApp) {
    throw createError({
      statusCode: 404,
      statusMessage: `FireUX console app "${control.main_app_id}" not found.`,
    })
  }

  return {
    ok: true,
    project: buildProject(projectId, control, mainApp, ecosystem),
    ecosystem,
    apps: apps.map((app) => toAppRef(app)).filter((app) => Boolean(app.id && app.url)),
  }
}
