import type { H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  normalizeFireuxAppScopeState,
  resolveFireuxAppScopeStateForRole,
} from 'fireux-core/runtime/utils/app-scope-state'
import { resolveConsoleCanCreate } from 'fireux-core/runtime/utils/console-policy'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { boundedIds, fail, text, type MemberRole } from './onboarding-input'

export type Firestore = ReturnType<typeof getRuntimeFirestore>

export type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
  appScopeState: 'parent_app' | 'tenant_app'
  canCreate: boolean
}

export type Actor = RuntimePolicy & {
  uid: string
  db: Firestore
  membershipRef: ReturnType<Firestore['doc']>
}

export function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const appRole = fireux.role
  const developerId = fireux.developerId || ''
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) fail(403, 'This App cannot own a Portfolio console.')

  const canCreate = resolveConsoleCanCreate(
    appRole,
    fireux.consoleConfig,
    'portfolio'
  )
  return {
    appId,
    appRole,
    developerId,
    appScopeState,
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

export function readScope(root: Record<string, unknown>) {
  if (Object.prototype.hasOwnProperty.call(root, 'app_scope')) {
    fail(409, 'Portfolio App scope uses a non-canonical stored shape.')
  }
  const flatState = text(root.app_scope_state)
  const flatAppId = text(root.app_scope_app_id)
  const state = normalizeFireuxAppScopeState(flatState)

  if (!state) fail(409, 'Portfolio App scope is missing or invalid.')
  if (state === 'root_only' && flatAppId) {
    fail(409, 'An unattached Portfolio cannot name an App.')
  }
  if (state !== 'root_only' && !flatAppId) {
    fail(409, 'An attached Portfolio must name its App.')
  }

  return { state, appId: flatAppId }
}

export function assertScope(root: Record<string, unknown>, appId: string) {
  const scope = readScope(root)
  if (scope.state !== 'root_only' && scope.appId !== appId) {
    fail(409, 'This Portfolio is already attached to another App.')
  }
  return scope
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
