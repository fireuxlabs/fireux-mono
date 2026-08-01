// Concurrent edit — 2026-07-19 17:51 CEST — Directory Publication Scaffold: strictly validate machine publication records.

import type {
  DirectoryProjectionV1,
  DirectoryPublicationV1,
  DirectorySourceAuthorizationV1,
} from '../../../models/core/supporting/directory-publication'
import { directoryPublicationValidationPrimitives } from './validation-primitives'

const {
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
} = directoryPublicationValidationPrimitives

export { DirectoryPublicationValidationFailure as DirectoryPublicationValidationError } from './validation-primitives'

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
    [
      'version',
      'event_id',
      'action',
      'entity',
      'source',
      'revision',
      'payload',
    ],
    action === 'upsert'
      ? [
          'version',
          'event_id',
          'action',
          'entity',
          'source',
          'revision',
          'payload',
        ]
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

  if (action === 'retire')
    return { ...base, action: 'retire' } as DirectoryPublicationV1
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
    enabled: source.enabled as boolean,
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
