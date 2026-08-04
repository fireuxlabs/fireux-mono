import { createHash } from 'node:crypto'
import type {
  AppDirectoryPublicationPayloadV1,
  DirectoryEntityKind,
  DirectoryPublicationV1,
  EcosystemDirectoryPublicationPayloadV1,
} from '../../../models/operations/directory-publication'
import {
  projectPublicApp,
  toAppDirectoryEntry,
} from '../public-projection/public-app.dto'
import { projectEcosystemDirectoryEntry } from '../public-projection/public-ecosystem.dto'
import type { DirectoryPublisherConfig } from './owner'

type PublicationIntent =
  | {
      action: 'upsert'
      payload:
        | AppDirectoryPublicationPayloadV1
        | EcosystemDirectoryPublicationPayloadV1
    }
  | { action: 'retire' }

function text(value: unknown) {
  return String(value ?? '').trim()
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function sha256(...parts: string[]) {
  const hash = createHash('sha256')
  for (const part of parts) hash.update(part).update('\0')
  return hash.digest('hex')
}

function normalizeEventTime(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    throw new Error('Directory publication CloudEvent time is invalid.')
  }
  const utc = date.toISOString()
  const providedFraction = value.match(/\.(\d{1,9})Z$/)?.[1]
  if (providedFraction) {
    return utc.replace(/\.\d{3}Z$/, `.${providedFraction.padEnd(9, '0')}Z`)
  }
  return utc.replace(/\.(\d{3})Z$/, '.$1000000Z')
}

function sameIntent(left: PublicationIntent | null, right: PublicationIntent) {
  return left !== null && JSON.stringify(left) === JSON.stringify(right)
}

function appIntent(
  entityId: string,
  raw: unknown,
  config: DirectoryPublisherConfig
): PublicationIntent {
  const source = record(raw)
  const sourceProjectId = text(source.project_id)
  const sourceEcosystemId = text(source.ecosystem_id)
  const expectedEcosystemId = config.source.ecosystem_id || ''
  const projected = projectPublicApp(source, { id: entityId })
  const entry = projected ? toAppDirectoryEntry(projected) : null

  if (
    !entry ||
    entry.status !== 'active' ||
    sourceProjectId !== config.source.project_id ||
    sourceEcosystemId !== expectedEcosystemId
  ) {
    return { action: 'retire' }
  }

  const { id: _id, detail_url: _detailUrl, ...payload } = entry
  return {
    action: 'upsert',
    payload: {
      ...payload,
      status: 'active',
    },
  }
}

function ecosystemIntent(
  entityId: string,
  raw: unknown,
  config: DirectoryPublisherConfig
): PublicationIntent {
  const source = record(raw)
  const projected = projectEcosystemDirectoryEntry(source, {
    id: entityId,
    appCount: 0,
  })

  if (
    !projected ||
    projected.status !== 'active' ||
    text(source.project_id) !== config.source.project_id ||
    entityId !== (config.source.ecosystem_id || '')
  ) {
    return { action: 'retire' }
  }

  const {
    id: _id,
    detail_url: _detailUrl,
    app_count: _appCount,
    ...payload
  } = projected
  return {
    action: 'upsert',
    payload: {
      ...payload,
      status: 'active',
    },
  }
}

function intentFor(
  kind: DirectoryEntityKind,
  entityId: string,
  raw: unknown,
  config: DirectoryPublisherConfig
) {
  return kind === 'app'
    ? appIntent(entityId, raw, config)
    : ecosystemIntent(entityId, raw, config)
}

export function buildDirectoryPublicationEvent(input: {
  kind: DirectoryEntityKind
  entityId: string
  cloudEventId: string
  cloudEventSource: string
  cloudEventTime: string
  beforeExists: boolean
  beforeData?: unknown
  afterExists: boolean
  afterData?: unknown
  config: DirectoryPublisherConfig
}): DirectoryPublicationV1 | null {
  const { config, entityId, kind } = input
  if (!text(input.cloudEventId) || !text(input.cloudEventSource)) {
    throw new Error('Directory publication CloudEvent identity is missing.')
  }
  const allowedIds =
    kind === 'app' ? config.allowedAppIds : config.allowedEcosystemIds
  if (!allowedIds.includes(entityId)) return null

  const beforeIntent = input.beforeExists
    ? intentFor(kind, entityId, input.beforeData, config)
    : null
  const afterIntent = input.afterExists
    ? intentFor(kind, entityId, input.afterData, config)
    : ({ action: 'retire' } as const)
  if (sameIntent(beforeIntent, afterIntent)) return null

  const source = config.source
  const eventId = `directory-v1-${sha256(
    input.cloudEventId,
    input.cloudEventSource,
    kind,
    entityId,
    source.firebase_project_id,
    source.database_id
  )}`
  const base = {
    version: 1 as const,
    event_id: eventId,
    entity: { kind, id: entityId },
    source,
    revision: {
      source_event_time: normalizeEventTime(input.cloudEventTime),
    },
  }

  if (afterIntent.action === 'retire') {
    return { ...base, action: 'retire' } as DirectoryPublicationV1
  }
  return {
    ...base,
    action: 'upsert',
    payload: afterIntent.payload,
  } as DirectoryPublicationV1
}

export const directoryPublicationBuilderPrimitives = { record, text }
