import type { AppUserRole } from '../../../models/core/user.model'
import type { ProjectUserJoinPublicationV1 } from '../../../models/operations/project-user-join.model'

const ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,1499}$/
const EVENT_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,1499}$/

export class ProjectUserJoinValidationError extends Error {
  readonly code = 'invalid_project_user_join'
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProjectUserJoinValidationError('Expected an object.')
  }
  return value as Record<string, unknown>
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[]
) {
  const actual = Object.keys(value).sort()
  const keys = [...expected].sort()
  if (
    actual.length !== keys.length ||
    actual.some((key, index) => key !== keys[index])
  ) {
    throw new ProjectUserJoinValidationError('Unexpected fields.')
  }
}

function id(value: unknown, label: string, pattern = ID): string {
  const normalized = String(value ?? '').trim()
  if (!pattern.test(normalized)) {
    throw new ProjectUserJoinValidationError(`${label} is invalid.`)
  }
  return normalized
}

export function parseProjectUserJoinPublicationV1(
  value: unknown
): ProjectUserJoinPublicationV1 {
  const input = record(value)
  exactKeys(input, [
    'version',
    'event_id',
    'source',
    'user_id',
    'membership_role',
    'occurred_at',
  ])
  if (input.version !== 1) {
    throw new ProjectUserJoinValidationError('Version is invalid.')
  }

  const source = record(input.source)
  exactKeys(source, [
    'firebase_project_id',
    'database_id',
    'project_id',
    'ecosystem_id',
    'app_id',
  ])
  const membershipRole = String(input.membership_role || '')
  if (membershipRole !== 'admin' && membershipRole !== 'user') {
    throw new ProjectUserJoinValidationError('Membership role is invalid.')
  }
  const occurredAt = String(input.occurred_at || '').trim()
  const occurredAtMs = Date.parse(occurredAt)
  if (
    !occurredAt ||
    !Number.isFinite(occurredAtMs) ||
    Math.abs(Date.now() - occurredAtMs) > 366 * 24 * 60 * 60 * 1000
  ) {
    throw new ProjectUserJoinValidationError('Occurrence time is invalid.')
  }

  return {
    version: 1,
    event_id: id(input.event_id, 'Event id', EVENT_ID),
    source: {
      firebase_project_id: id(
        source.firebase_project_id,
        'Firebase project id'
      ),
      database_id: id(source.database_id, 'Database id'),
      project_id: id(source.project_id, 'Project id'),
      ecosystem_id: source.ecosystem_id
        ? id(source.ecosystem_id, 'Ecosystem id')
        : '',
      app_id: id(source.app_id, 'App id'),
    },
    user_id: id(input.user_id, 'User id'),
    membership_role: membershipRole as AppUserRole,
    occurred_at: new Date(occurredAtMs).toISOString(),
  }
}
