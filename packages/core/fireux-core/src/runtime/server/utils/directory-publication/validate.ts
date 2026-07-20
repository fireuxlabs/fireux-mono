// Concurrent edit — 2026-07-19 17:51 CEST — Directory Publication Scaffold: strictly validate machine publication records.

import type {
  AppDirectoryPublicationPayloadV1,
  DirectoryProjectionV1,
  DirectoryPublicationSourceV1,
  DirectoryPublicationV1,
  DirectorySourceAuthorizationV1,
  EcosystemDirectoryPublicationPayloadV1,
} from '../../../models/core/supporting/directory-publication'
import { DirectoryPublicationEventTimeV1 } from '../../../models/core/supporting/directory-publication'

type UnknownRecord = Record<string, unknown>

const APP_ROLES = new Set([
  'global',
  'tenant',
  'standalone',
  'ecosystem',
  'system',
])
const ENTITY_KINDS = new Set(['app', 'ecosystem'])
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000

export class DirectoryPublicationValidationError extends Error {
  readonly code = 'invalid_directory_publication'
}

function fail(message: string): never {
  throw new DirectoryPublicationValidationError(message)
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
          ecosystem_id: pathSegment(
            source.ecosystem_id,
            'source.ecosystem_id'
          ),
        }
      : {}),
  }
}

function parseAppPayload(
  value: unknown
): AppDirectoryPublicationPayloadV1 {
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
  if (!Number.isSafeInteger(userCount) || userCount < 0 || userCount > 1_000_000_000) {
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
    description: text(payload.description, 'payload.description', { max: 4000 }),
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
    description: text(payload.description, 'payload.description', { max: 4000 }),
    image_url: publicUrl(payload.image_url, 'payload.image_url'),
    website_url: publicUrl(payload.website_url, 'payload.website_url'),
  }
}

export function parseDirectoryPublicationV1(
  value: unknown,
  options: { nowMs?: number } = {}
): DirectoryPublicationV1 {
  const nowMs = options.nowMs ?? Date.now()
  const event = record(value, 'publication')
  const action = event.action
  if (action !== 'upsert' && action !== 'retire') {
    fail('publication.action is unsupported.')
  }
  exactKeys(
    event,
    ['version', 'event_id', 'action', 'entity', 'source', 'revision', 'payload'],
    action === 'upsert'
      ? ['version', 'event_id', 'action', 'entity', 'source', 'revision', 'payload']
      : ['version', 'event_id', 'action', 'entity', 'source', 'revision'],
    'publication'
  )
  if (event.version !== 1) fail('publication.version must be 1.')
  if (action === 'retire' && 'payload' in event) {
    fail('Retirement must not contain a payload.')
  }

  const entity = record(event.entity, 'publication.entity')
  exactKeys(entity, ['kind', 'id'], ['kind', 'id'], 'publication.entity')
  if (typeof entity.kind !== 'string' || !ENTITY_KINDS.has(entity.kind)) {
    fail('publication.entity.kind is unsupported.')
  }
  const kind = entity.kind as 'app' | 'ecosystem'

  const revision = record(event.revision, 'publication.revision')
  exactKeys(
    revision,
    ['source_event_time'],
    ['source_event_time'],
    'publication.revision'
  )
  const base = {
    version: 1 as const,
    event_id: text(event.event_id, 'publication.event_id', {
      min: 1,
      max: 512,
    }),
    entity: {
      kind,
      id: pathSegment(entity.id, 'publication.entity.id'),
    },
    source: parseSource(event.source),
    revision: {
      source_event_time: eventTime(
        revision.source_event_time,
        'publication.revision.source_event_time',
        nowMs
      ),
    },
  }

  if (action === 'retire') return { ...base, action: 'retire' } as DirectoryPublicationV1
  return {
    ...base,
    action: 'upsert',
    payload:
      kind === 'app'
        ? parseAppPayload(event.payload)
        : parseEcosystemPayload(event.payload),
  } as DirectoryPublicationV1
}

export function parseDirectorySourceAuthorizationV1(
  value: unknown
): DirectorySourceAuthorizationV1 {
  const source = record(value, 'source authorization')
  exactKeys(
    source,
    [
      'version',
      'authorization_id',
      'oidc_subject',
      'service_account_email',
      'firebase_project_id',
      'database_id',
      'project_id',
      'ecosystem_id',
      'allowed_entity_kinds',
      'allowed_app_ids',
      'allowed_ecosystem_ids',
      'enabled',
      'updated_at',
    ],
    [
      'version',
      'authorization_id',
      'oidc_subject',
      'service_account_email',
      'firebase_project_id',
      'database_id',
      'project_id',
      'allowed_entity_kinds',
      'allowed_app_ids',
      'allowed_ecosystem_ids',
      'enabled',
      'updated_at',
    ],
    'source authorization'
  )
  if (source.version !== 1) fail('Source authorization version must be 1.')
  if (typeof source.enabled !== 'boolean') {
    fail('Source authorization enabled must be boolean.')
  }
  const allowedKinds = stringList(
    source.allowed_entity_kinds,
    'source authorization.allowed_entity_kinds',
    (entry, label) => {
      const kind = text(entry, label, { min: 1, max: 16 })
      if (!ENTITY_KINDS.has(kind)) fail(`${label} is unsupported.`)
      return kind
    }
  ) as Array<'app' | 'ecosystem'>

  return {
    version: 1,
    authorization_id: pathSegment(
      source.authorization_id,
      'source authorization.authorization_id'
    ),
    oidc_subject: pathSegment(
      source.oidc_subject,
      'source authorization.oidc_subject'
    ),
    service_account_email: text(
      source.service_account_email,
      'source authorization.service_account_email',
      { min: 3, max: 320 }
    ).toLowerCase(),
    firebase_project_id: pathSegment(
      source.firebase_project_id,
      'source authorization.firebase_project_id',
      128
    ),
    database_id: pathSegment(
      source.database_id,
      'source authorization.database_id',
      128
    ),
    project_id: pathSegment(
      source.project_id,
      'source authorization.project_id'
    ),
    ...('ecosystem_id' in source
      ? {
          ecosystem_id: pathSegment(
            source.ecosystem_id,
            'source authorization.ecosystem_id'
          ),
        }
      : {}),
    allowed_entity_kinds: allowedKinds,
    allowed_app_ids: stringList(
      source.allowed_app_ids,
      'source authorization.allowed_app_ids',
      pathSegment
    ),
    allowed_ecosystem_ids: stringList(
      source.allowed_ecosystem_ids,
      'source authorization.allowed_ecosystem_ids',
      pathSegment
    ),
    enabled: source.enabled,
    updated_at: text(source.updated_at, 'source authorization.updated_at', {
      min: 20,
      max: 40,
    }),
  }
}

export function parseDirectoryProjectionV1(
  value: unknown,
  options: { nowMs?: number } = {}
): DirectoryProjectionV1 {
  const nowMs = options.nowMs ?? Date.now()
  const projection = record(value, 'projection')
  const state = projection.state
  if (state !== 'active' && state !== 'retired') {
    fail('projection.state is unsupported.')
  }
  const baseKeys = [
    'version',
    'entity_kind',
    'entity_id',
    'source',
    'revision',
    'last_event_id',
    'applied_at',
    'state',
  ]
  exactKeys(
    projection,
    state === 'active'
      ? [...baseKeys, 'payload', 'published_at']
      : [...baseKeys, 'retired_at', 'retired_by_event_id'],
    state === 'active'
      ? [...baseKeys, 'payload', 'published_at']
      : [...baseKeys, 'retired_at', 'retired_by_event_id'],
    'projection'
  )
  if (projection.version !== 1) fail('projection.version must be 1.')
  if (
    typeof projection.entity_kind !== 'string' ||
    !ENTITY_KINDS.has(projection.entity_kind)
  ) {
    fail('projection.entity_kind is unsupported.')
  }
  const kind = projection.entity_kind as 'app' | 'ecosystem'
  const revision = record(projection.revision, 'projection.revision')
  exactKeys(
    revision,
    ['source_event_time'],
    ['source_event_time'],
    'projection.revision'
  )
  const base = {
    version: 1 as const,
    entity_kind: kind,
    entity_id: pathSegment(projection.entity_id, 'projection.entity_id'),
    source: parseSource(projection.source),
    revision: {
      source_event_time: eventTime(
        revision.source_event_time,
        'projection.revision.source_event_time',
        nowMs
      ),
    },
    last_event_id: text(projection.last_event_id, 'projection.last_event_id', {
      min: 1,
      max: 512,
    }),
    applied_at: text(projection.applied_at, 'projection.applied_at', {
      min: 20,
      max: 40,
    }),
  }
  if (state === 'retired') {
    return {
      ...base,
      state,
      retired_at: text(projection.retired_at, 'projection.retired_at', {
        min: 20,
        max: 40,
      }),
      retired_by_event_id: text(
        projection.retired_by_event_id,
        'projection.retired_by_event_id',
        { min: 1, max: 512 }
      ),
    } as DirectoryProjectionV1
  }
  return {
    ...base,
    state,
    payload:
      kind === 'app'
        ? parseAppPayload(projection.payload)
        : parseEcosystemPayload(projection.payload),
    published_at: text(projection.published_at, 'projection.published_at', {
      min: 20,
      max: 40,
    }),
  } as DirectoryProjectionV1
}
