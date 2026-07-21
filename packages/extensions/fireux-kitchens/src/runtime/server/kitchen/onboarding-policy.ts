// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: centralize fail-closed scope, access, locale, and capacity policy.
// Concurrent edit — 2026-07-21 22:05 CEST — Kitchen onboarding repair: distinguish absent support arrays from malformed stored authority.
import { createError } from 'h3'
import {
  normalizeFireuxAppScopeState,
  type FireuxAppScopeState,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from 'fireux-places/runtime/utils/place-spine.ts'
import type { KitchenOnboardingPreview } from '../../models/kitchen-onboarding.model'

export type KitchenOnboardingMemberRole = 'admin' | 'user'

export const onboardingText = (value: unknown) => String(value ?? '').trim()
export const onboardingRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function boundedIds(value: unknown, max: number, label: string) {
  if (!Array.isArray(value) || value.length > max) {
    fail(409, `${label} has an invalid stored shape.`)
  }
  const ids = value.map(onboardingText)
  if (ids.some(id => !id) || new Set(ids).size !== ids.length) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return ids
}

export function requireOnboardingMemberRole(
  exists: boolean,
  value: unknown
): KitchenOnboardingMemberRole {
  const role = onboardingText(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    fail(403, 'Current App membership is required to onboard a Kitchen.')
  }
  return role
}

export function readKitchenOnboardingScope(value: Record<string, unknown>) {
  const nested = onboardingRecord(value.app_scope)
  const nestedState = onboardingText(nested.state)
  const nestedAppId = onboardingText(nested.app_id)
  const flatState = onboardingText(value.app_scope_state)
  const flatAppId = onboardingText(value.app_scope_app_id)
  const rawState = nestedState || flatState
  const appId = nestedState ? nestedAppId : flatAppId
  const state = normalizeFireuxAppScopeState(rawState)

  if (!state) fail(409, 'Kitchen App scope is missing or invalid.')
  if (nestedState && flatState) {
    if (
      normalizeFireuxAppScopeState(flatState) !== state ||
      (flatAppId && flatAppId !== nestedAppId)
    ) {
      fail(409, 'Kitchen App scope contains conflicting stored values.')
    }
  }
  if (state === 'root_only' && appId) {
    fail(409, 'An unattached Kitchen cannot name an App.')
  }
  if (state !== 'root_only' && !appId) {
    fail(409, 'An attached Kitchen must name its App.')
  }

  return { state: state as FireuxAppScopeState, appId }
}

export function assertKitchenOnboardingScope(
  kitchen: Record<string, unknown>,
  appId: string
) {
  const scope = readKitchenOnboardingScope(kitchen)
  if (scope.state !== 'root_only' && scope.appId !== appId) {
    fail(409, 'This Kitchen is already attached to another App.')
  }
  return scope
}

export function assertKitchenOnboardingPlaceDefaults(
  place: Record<string, unknown>
) {
  if (
    !normalizePlaceCurrencyCode(place.default_currency_code) ||
    !normalizePlaceTimezone(place.timezone)
  ) {
    fail(409, 'Finish the Place currency and timezone before adding a Kitchen.')
  }
}

export function readKitchenOnboardingSupport(
  value: Record<string, unknown> | null
) {
  const candidate = readKitchenOnboardingSupportForTrustedRepair(value)
  if (candidate.missingFields.length > 0) {
    fail(409, 'Kitchen App support is missing required authority arrays.')
  }
  return candidate.support
}

type KitchenOnboardingSupportField =
  | 'operator_ids'
  | 'team_ids'
  | 'join_requests'

export function readKitchenOnboardingSupportForTrustedRepair(
  value: Record<string, unknown> | null
) {
  if (!value) {
    return {
      support: null,
      missingFields: [] as KitchenOnboardingSupportField[],
    }
  }

  const missingFields: KitchenOnboardingSupportField[] = []
  const ids = (
    key: KitchenOnboardingSupportField,
    max: number,
    label: string
  ) => {
    if (value[key] === undefined) {
      missingFields.push(key)
      return []
    }
    return boundedIds(value[key], max, label)
  }

  return {
    support: {
      operatorIds: ids('operator_ids', 50, 'Kitchen operators'),
      teamIds: ids('team_ids', 100, 'Kitchen team'),
      joinRequests: ids('join_requests', 100, 'Kitchen join requests'),
    },
    missingFields,
  }
}

export function assertKitchenOnboardingMembershipCapacity(
  membership: Record<string, unknown>,
  kitchenId: string
) {
  const targets = onboardingRecord(membership.console_targets)
  if (targets.kitchen_ids === undefined) return
  const ids = boundedIds(
    targets.kitchen_ids,
    50,
    'UserApp Kitchen console targets'
  )
  if (!ids.includes(kitchenId) && ids.length >= 50) {
    fail(409, 'The UserApp Kitchen console target list is full.')
  }
}

export function assertKitchenOnboardingSupportCapacity(
  support: NonNullable<ReturnType<typeof readKitchenOnboardingSupport>>,
  uid: string
) {
  if (!support.operatorIds.includes(uid) && support.operatorIds.length >= 50) {
    fail(409, 'The Kitchen operator list is full.')
  }
  if (!support.teamIds.includes(uid) && support.teamIds.length >= 100) {
    fail(409, 'The Kitchen team list is full.')
  }
}

export function kitchenOnboardingAccessDecision(input: {
  kitchen: Record<string, unknown> | null
  support: ReturnType<typeof readKitchenOnboardingSupport>
  uid: string
  role: KitchenOnboardingMemberRole
  canCreate: boolean
}): Pick<KitchenOnboardingPreview, 'action' | 'can_complete' | 'message'> {
  if (!input.kitchen) {
    if (input.canCreate && input.role === 'admin') {
      return { action: 'create', can_complete: true }
    }
    return {
      action: 'request_access',
      can_complete: false,
      message: input.canCreate
        ? 'An App admin must create the Kitchen.'
        : 'Kitchen creation is disabled for this App.',
    }
  }

  const operators = new Set([
    ...(input.support?.operatorIds || []),
    ...(input.support?.teamIds || []),
  ])
  if (input.support && operators.has(input.uid)) {
    return { action: 'open', can_complete: true }
  }
  if (input.role === 'admin') {
    return { action: 'connect', can_complete: true }
  }
  return {
    action: 'request_access',
    can_complete: false,
    message: 'An App admin or existing Kitchen operator must grant access.',
  }
}
