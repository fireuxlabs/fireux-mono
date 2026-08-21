import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { ProjectStatus } from 'fireux-core/runtime/project/models/project.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { fireuxAppUsersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { createError, type H3Event } from 'h3'

const PROJECT_STATUSES = new Set<ProjectStatus>([
  'draft',
  'active',
  'paused',
  'archived',
])

export const projectText = (value: unknown) => String(value ?? '').trim()

export function failProjectCommand(
  statusCode: number,
  statusMessage: string
): never {
  throw createError({ statusCode, statusMessage })
}

export function projectCommandRecord(value: unknown, label: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    failProjectCommand(400, `${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

export function boundedProjectText(value: unknown, label: string, max: number) {
  const result = projectText(value)
  if (!result || result.length > max) {
    failProjectCommand(
      400,
      `${label} must contain between 1 and ${max} characters.`
    )
  }
  return result
}

export function optionalProjectText(
  value: unknown,
  label: string,
  max: number
) {
  const result = projectText(value)
  if (result.length > max) {
    failProjectCommand(400, `${label} must contain at most ${max} characters.`)
  }
  return result
}

export function projectStatus(value: unknown, fallback?: ProjectStatus) {
  const result = projectText(value) as ProjectStatus
  if (!result && fallback) return fallback
  if (!PROJECT_STATUSES.has(result))
    failProjectCommand(400, 'Project status is invalid.')
  return result
}

export async function resolveProjectCommandActor(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'Runtime App id'
  )
  return { uid, appId, memberships: fireuxAppUsersTarget(appId) }
}

export function requireProjectAdmin(
  exists: boolean,
  data?: Record<string, unknown>
) {
  if (!exists || projectText(data?.role) !== 'admin') {
    failProjectCommand(
      403,
      'A FireUX App admin is required to manage Projects.'
    )
  }
}
