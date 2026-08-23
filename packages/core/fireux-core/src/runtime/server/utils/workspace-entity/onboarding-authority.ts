import { createError } from 'h3'
import type { H3Event } from 'h3'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { requireFirestoreDocumentId } from '../ids/path'
import { resolveWorkspaceCanCreate } from '../../../utils/workspace-policy'
import { resolveFireuxEntityManagementForApp } from '../../../utils/entity-management'

export type WorkspaceEntityMemberRole = 'admin' | 'user' | 'dev'

export type WorkspaceEntitySupportAuthority = {
  operatorIds: string[]
  teamIds: string[]
  joinRequests: string[]
}

export function resolveWorkspaceEntityOnboardingPolicy(
  event: H3Event,
  family: string
) {
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const ecosystem = requireFirestoreDocumentId(
    fireux.ecosystem,
    'Ecosystem key'
  )
  return {
    appId,
    appRole: fireux.role,
    developerId: fireux.developerId || '',
    ecosystem,
    management: resolveFireuxEntityManagementForApp(
      fireux.role,
      appId,
      ecosystem
    ),
    canCreate: resolveWorkspaceCanCreate(
      fireux.role,
      fireux.workspaceConfig,
      family
    ),
  }
}

const text = (value: unknown) => String(value ?? '').trim()

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export function requireWorkspaceEntityMemberRole(input: {
  exists: boolean
  role: unknown
  entityLabel: string
}): WorkspaceEntityMemberRole {
  const role = text(input.role)
  if (
    !input.exists ||
    (role !== 'admin' && role !== 'user' && role !== 'dev')
  ) {
    fail(
      403,
      `Current App membership is required to onboard a ${input.entityLabel}.`
    )
  }
  return role
}

export function readBoundedWorkspaceEntityIds(
  value: unknown,
  max: number,
  label: string
) {
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((id) => typeof id !== 'string')
  ) {
    fail(409, `${label} has an invalid stored shape.`)
  }
  const ids = value.map((id) => id.trim())
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return ids
}

export function readWorkspaceEntitySupportAuthority(
  value: Record<string, unknown> | null,
  entityLabel: string
): WorkspaceEntitySupportAuthority | null {
  if (!value) return null
  return {
    operatorIds: readBoundedWorkspaceEntityIds(
      value.operator_ids,
      50,
      `${entityLabel} operators`
    ),
    teamIds: readBoundedWorkspaceEntityIds(
      value.team_ids,
      100,
      `${entityLabel} team`
    ),
    joinRequests: readBoundedWorkspaceEntityIds(
      value.join_requests,
      100,
      `${entityLabel} join requests`
    ),
  }
}

export function assertWorkspaceEntitySupportCapacity(
  support: WorkspaceEntitySupportAuthority,
  uid: string,
  entityLabel: string
) {
  if (!support.operatorIds.includes(uid) && support.operatorIds.length >= 50) {
    fail(409, `The ${entityLabel} operator list is full.`)
  }
  if (!support.teamIds.includes(uid) && support.teamIds.length >= 100) {
    fail(409, `The ${entityLabel} team list is full.`)
  }
}
