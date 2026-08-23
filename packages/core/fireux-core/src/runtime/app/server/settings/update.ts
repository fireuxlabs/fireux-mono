import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, readBody, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'

const TEXT_FIELDS = {
  name: 60,
  short_name: 40,
  tagline: 160,
  description: 500,
  short_bio: 280,
  long_bio: 4000,
} as const
const MEDIA_FIELDS = new Set([
  'media.thumbnail_url',
  'media.logo_url',
  'media.wordmark_light_url',
  'media.wordmark_dark_url',
  'media.cover_url',
])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function cleanUrl(value: unknown): string {
  const text = String(value ?? '').trim()
  if (!text) return ''
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return fail(400, 'App media must use a valid HTTPS URL.')
  }
  if (url.protocol !== 'https:') fail(400, 'App media must use HTTPS.')
  return url.toString()
}

const SOCIAL_LINK_KEYS = [
  'website',
  'twitter',
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'youtube',
] as const

function cleanSocialLinks(value: unknown): DocumentData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'App social_links must be an object.')
  }
  const input = value as Record<string, unknown>
  const links: DocumentData = {}
  for (const key of SOCIAL_LINK_KEYS) links[key] = cleanUrl(input[key])
  links.email = String(input.email ?? '').trim().slice(0, 320)
  return links
}

function normalizePatch(body: unknown): DocumentData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'App settings payload must be an object.')
  }
  const input = body as Record<string, unknown>
  const patch: DocumentData = {}
  for (const [field, value] of Object.entries(input)) {
    if (field in TEXT_FIELDS) {
      const limit = TEXT_FIELDS[field as keyof typeof TEXT_FIELDS]
      const text = String(value ?? '')
        .trim()
        .slice(0, limit)
      if ((field === 'name' || field === 'short_name') && !text) {
        fail(400, `${field} is required.`)
      }
      patch[field] = text
      continue
    }
    if (MEDIA_FIELDS.has(field)) {
      patch[field] = cleanUrl(value)
      continue
    }
    if (field === 'social_links') {
      patch[field] = cleanSocialLinks(value)
      continue
    }
    fail(400, `App setting is not editable: ${field}`)
  }
  if (!Object.keys(patch).length) fail(400, 'No App settings were supplied.')
  return patch
}

export async function updateAppSettings(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const patch = normalizePatch(await readBody(event))
  const apps = FIRESTORE_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(config.appId)

  await runGuardedServerTransaction(apps.database, async (mutations) => {
    const [app, membership] = await Promise.all([
      mutations.read(apps, config.appId),
      mutations.read<Record<string, unknown>>(memberships, uid),
    ])
    if (!app.exists) fail(409, 'The runtime App record does not exist.')
    const membershipRole = membership.data?.role
    const isAdmin = membershipRole === 'admin' || membershipRole === 'dev'
    const isDeveloper =
      Boolean(config.developerId) && uid === config.developerId
    if (!isAdmin && !isDeveloper) fail(403, 'App admin access is required.')

    mutations.update(apps, config.appId, {
      ...patch,
      updated: { at: FieldValue.serverTimestamp(), by: uid },
    })
  })

  return { ok: true, appId: config.appId }
}
