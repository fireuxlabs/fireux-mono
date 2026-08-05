import type {
  AppDirectoryPublicationPayloadV1,
  DirectoryPublicationSourceV1,
  EcosystemDirectoryPublicationPayloadV1,
} from '../../../models/operations/directory-publication'
import { DirectoryPublicationEventTimeV1 } from '../../../models/operations/directory-publication'

type UnknownRecord = Record<string, unknown>

const APP_ROLES = new Set(['global', 'tenant', 'standalone'])
const ENTITY_KINDS = new Set(['app', 'ecosystem'])
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000

export class DirectoryPublicationValidationFailure extends Error {
  readonly code = 'invalid_directory_publication'
}

function fail(message: string): never {
  throw new DirectoryPublicationValidationFailure(message)
}

function record(value: unknown, label: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object.`)
  }
  return value as UnknownRecord
}

function exactKeys(
  value: UnknownRecord,
  allowed: readonly string[],
  required: readonly string[],
  label: string
) {
  const keys = Object.keys(value)
  if (keys.some((key) => !allowed.includes(key))) {
    fail(`${label} contains an unsupported field.`)
  }
  if (required.some((key) => !(key in value))) {
    fail(`${label} is missing a required field.`)
  }
}

function text(
  value: unknown,
  label: string,
  options: { max: number; min?: number } = { max: 200 }
) {
  if (typeof value !== 'string') fail(`${label} must be a string.`)
  const result = value.trim()
  if (result.length < (options.min ?? 0) || result.length > options.max) {
    fail(`${label} has an invalid length.`)
  }
  if (/\p{C}/u.test(result)) fail(`${label} contains control characters.`)
  return result
}

function pathSegment(value: unknown, label: string, max = 200) {
  const result = text(value, label, { min: 1, max })
  if (result === '.' || result === '..' || result.includes('/')) {
    fail(`${label} is not a valid document id.`)
  }
  return result
}

function publicUrl(value: unknown, label: string) {
  const result = text(value, label, { max: 2048 })
  if (!result) return ''
  if (result.startsWith('/') && !result.startsWith('//')) return result

  let parsed: URL
  try {
    parsed = new URL(result)
  } catch {
    return fail(`${label} must be an HTTPS URL or root-relative path.`)
  }
  if (parsed.protocol !== 'https:') {
    fail(`${label} must use HTTPS.`)
  }
  return result
}

function eventTime(value: unknown, label: string, nowMs: number) {
  const result = text(value, label, { min: 30, max: 30 })
  if (!DirectoryPublicationEventTimeV1.test(result)) {
    fail(`${label} must use normalized RFC3339 nanoseconds.`)
  }
  const milliseconds = Date.parse(result)
  if (!Number.isFinite(milliseconds)) fail(`${label} is not a real timestamp.`)
  if (milliseconds > nowMs + MAX_FUTURE_SKEW_MS) {
    fail(`${label} is too far in the future.`)
  }
  return result
}

function stringList(
  value: unknown,
  label: string,
  item: (value: unknown, label: string) => string
) {
  if (!Array.isArray(value) || value.length > 500) {
    fail(`${label} must be a bounded list.`)
  }
  const result = value.map((entry, index) => item(entry, `${label}[${index}]`))
  if (new Set(result).size !== result.length) {
    fail(`${label} must not contain duplicates.`)
  }
  return result
}

function parseSource(value: unknown): DirectoryPublicationSourceV1 {
  const source = record(value, 'source')
  exactKeys(
    source,
    ['firebase_project_id', 'database_id', 'project_id', 'ecosystem_id'],
    ['firebase_project_id', 'database_id', 'project_id'],
    'source'
  )
  return {
    firebase_project_id: pathSegment(
      source.firebase_project_id,
      'source.firebase_project_id',
      128
    ),
    database_id: pathSegment(source.database_id, 'source.database_id', 128),
    project_id: pathSegment(source.project_id, 'source.project_id'),
    ...('ecosystem_id' in source
      ? {
          ecosystem_id: pathSegment(source.ecosystem_id, 'source.ecosystem_id'),
        }
      : {}),
  }
}

function parseAppPayload(value: unknown): AppDirectoryPublicationPayloadV1 {
  const payload = record(value, 'payload')
  exactKeys(
    payload,
    [
      'ecosystem_id',
      'slug',
      'status',
      'app_name',
      'app_short_name',
      'role',
      'tagline',
      'description',
      'short_bio',
      'derived',
      'media',
    ],
    [
      'ecosystem_id',
      'slug',
      'status',
      'app_name',
      'app_short_name',
      'role',
      'tagline',
      'description',
      'short_bio',
      'derived',
      'media',
    ],
    'payload'
  )
  if (payload.status !== 'active') fail('App payload status must be active.')

  const derived = record(payload.derived, 'payload.derived')
  exactKeys(derived, ['user_count'], ['user_count'], 'payload.derived')
  const userCount = Number(derived.user_count)
  if (
    !Number.isSafeInteger(userCount) ||
    userCount < 0 ||
    userCount > 1_000_000_000
  ) {
    fail('payload.derived.user_count must be a bounded integer.')
  }

  const media = record(payload.media, 'payload.media')
  const mediaKeys = [
    'logo_url',
    'thumbnail_url',
    'wordmark_light_url',
    'wordmark_dark_url',
    'cover_url',
  ] as const
  exactKeys(media, mediaKeys, mediaKeys, 'payload.media')

  const role = text(payload.role, 'payload.role', { min: 1, max: 32 })
  if (!APP_ROLES.has(role)) fail('payload.role is unsupported.')

  const ecosystemId = text(payload.ecosystem_id, 'payload.ecosystem_id', {
    max: 200,
  })
  if (ecosystemId) pathSegment(ecosystemId, 'payload.ecosystem_id')

  return {
    ecosystem_id: ecosystemId,
    slug: pathSegment(payload.slug, 'payload.slug'),
    status: 'active',
    app_name: text(payload.app_name, 'payload.app_name', { min: 1, max: 120 }),
    app_short_name: text(payload.app_short_name, 'payload.app_short_name', {
      min: 1,
      max: 80,
    }),
    role: role as AppDirectoryPublicationPayloadV1['role'],
    tagline: text(payload.tagline, 'payload.tagline', { max: 240 }),
    description: text(payload.description, 'payload.description', {
      max: 4000,
    }),
    short_bio: text(payload.short_bio, 'payload.short_bio', { max: 1000 }),
    derived: { user_count: userCount },
    media: {
      logo_url: publicUrl(media.logo_url, 'payload.media.logo_url'),
      thumbnail_url: publicUrl(
        media.thumbnail_url,
        'payload.media.thumbnail_url'
      ),
      wordmark_light_url: publicUrl(
        media.wordmark_light_url,
        'payload.media.wordmark_light_url'
      ),
      wordmark_dark_url: publicUrl(
        media.wordmark_dark_url,
        'payload.media.wordmark_dark_url'
      ),
      cover_url: publicUrl(media.cover_url, 'payload.media.cover_url'),
    },
  }
}

function parseEcosystemPayload(
  value: unknown
): EcosystemDirectoryPublicationPayloadV1 {
  const payload = record(value, 'payload')
  const keys = [
    'slug',
    'status',
    'name',
    'description',
    'image_url',
    'website_url',
  ] as const
  exactKeys(payload, keys, keys, 'payload')
  if (payload.status !== 'active') {
    fail('Ecosystem payload status must be active.')
  }
  return {
    slug: pathSegment(payload.slug, 'payload.slug'),
    status: 'active',
    name: text(payload.name, 'payload.name', { min: 1, max: 120 }),
    description: text(payload.description, 'payload.description', {
      max: 4000,
    }),
    image_url: publicUrl(payload.image_url, 'payload.image_url'),
    website_url: publicUrl(payload.website_url, 'payload.website_url'),
  }
}

export const directoryPublicationValidationPrimitives = {
  ENTITY_KINDS,
  eventTime,
  exactKeys,
  fail,
  parseAppPayload,
  parseEcosystemPayload,
  parseSource,
  pathSegment,
  record,
  stringList,
  text,
}
