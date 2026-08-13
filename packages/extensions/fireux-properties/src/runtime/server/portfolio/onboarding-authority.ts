import type { H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
  resolveFireuxEntityManagementForApp,
} from 'fireux-core/runtime/utils/entity-management'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { resolveConsoleCanCreate } from 'fireux-core/runtime/utils/console-policy'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { boundedIds, fail, text, type MemberRole } from './onboarding-input'

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
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const appRole = fireux.role
  const developerId = fireux.developerId || ''
  const ecosystem = requireFirestoreDocumentId(
    fireux.ecosystem,
    'Ecosystem key'
  )
  const management = resolveFireuxEntityManagementForApp(
    appRole,
    appId,
    ecosystem
  )

  const canCreate = resolveConsoleCanCreate(
    appRole,
    fireux.consoleConfig,
    'portfolio'
  )
  return {
    appId,
    appRole,
    developerId,
    ecosystem,
    management,
    canCreate,
  }
}

export function requireMemberRole(exists: boolean, value: unknown): MemberRole {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    fail(403, 'Current App membership is required to onboard a Portfolio.')
  }
  return role
}

export function readSupport(value: Record<string, unknown> | null) {
  if (!value) return null
  return {
    operatorIds: boundedIds(value.operator_ids, 50, 'Portfolio operators'),
    teamIds: boundedIds(value.team_ids, 100, 'Portfolio team'),
    joinRequests: boundedIds(
      value.join_requests,
      100,
      'Portfolio join requests'
    ),
  }
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
  if (!support.operatorIds.includes(uid) && support.operatorIds.length >= 50) {
    fail(409, 'The Portfolio operator list is full.')
  }
  if (!support.teamIds.includes(uid) && support.teamIds.length >= 100) {
    fail(409, 'The Portfolio team list is full.')
  }
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
