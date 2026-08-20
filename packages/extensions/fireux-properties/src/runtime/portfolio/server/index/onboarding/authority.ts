import type { H3Event } from 'h3'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import {
  assertWorkspaceEntitySupportCapacity,
  readWorkspaceEntitySupportAuthority,
  requireWorkspaceEntityMemberRole,
  resolveWorkspaceEntityOnboardingPolicy,
} from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { fail, type MemberRole } from './input'

export type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
  ecosystem: string
  management: Exclude<FireuxEntityManagement, { mode: 'root' }>
  canCreate: boolean
}

export type Actor = RuntimePolicy & {
  uid: string
}

export function runtimePolicy(event: H3Event): RuntimePolicy {
  return resolveWorkspaceEntityOnboardingPolicy(event, 'portfolio')
}

export function requireMemberRole(exists: boolean, value: unknown): MemberRole {
  return requireWorkspaceEntityMemberRole({
    exists,
    role: value,
    entityLabel: 'Portfolio',
  })
}

export function readSupport(value: Record<string, unknown> | null) {
  if (!value) return null
  return readWorkspaceEntitySupportAuthority(value, 'Portfolio')
}

export function readManagement(root: Record<string, unknown>) {
  if (
    Object.hasOwn(root, 'app_scope') ||
    Object.hasOwn(root, 'app_scope_state') ||
    Object.hasOwn(root, 'app_scope_app_id')
  ) {
    fail(409, 'Portfolio contains retired management fields.')
  }
  const management = readFireuxEntityManagement(root.management)
  if (!management) fail(409, 'Portfolio management is missing or invalid.')
  return management
}

export function assertManagement(
  root: Record<string, unknown>,
  appId: string,
  ecosystem: string
) {
  const management = readManagement(root)
  if (
    management.mode !== 'root' &&
    resolveFireuxEntityManagementAppId(management, ecosystem) !== appId
  ) {
    fail(409, 'This Portfolio is already attached to another App.')
  }
  return management
}

export function assertSupportCapacity(
  support: NonNullable<ReturnType<typeof readSupport>>,
  uid: string
) {
  assertWorkspaceEntitySupportCapacity(support, uid, 'Portfolio')
}

export function assertOnboardingAuthority(input: {
  rootExists: boolean
  support: ReturnType<typeof readSupport>
  uid: string
  role: MemberRole
  canCreate: boolean
}) {
  if (!input.rootExists) {
    if (!input.canCreate) {
      fail(403, 'Portfolio creation is disabled for this App.')
    }
    if (input.role !== 'admin') {
      fail(403, 'An App admin must create the Portfolio.')
    }
    return
  }

  if (input.role === 'admin') return
  if (input.support?.operatorIds.includes(input.uid)) return
  fail(403, 'An App admin or existing Portfolio operator must grant access.')
}
