// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: centralize fail-closed scope, access, locale, and capacity policy.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: reject compatibility scope vocabulary and malformed support authority.
import { createError } from 'h3'
import type { FireuxAppScopeState } from 'fireux-core/runtime/models/utils/scope.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from 'fireux-places/runtime/utils/place-spine'
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
  const keys = Object.keys(nested).sort()
  const state: FireuxAppScopeState | '' =
    nestedState === 'root_only' ||
    nestedState === 'parent_app' ||
    nestedState === 'tenant_app'
      ? nestedState
      : ''

  if (
    Object.hasOwn(value, 'app_scope_state') ||
    Object.hasOwn(value, 'app_scope_app_id') ||
    keys.length !== 2 ||
    keys[0] !== 'app_id' ||
    keys[1] !== 'state' ||
    !state
  ) {
    fail(409, 'Kitchen App scope is missing or invalid.')
  }
  if (state === 'root_only' && nestedAppId) {
    fail(409, 'An unattached Kitchen cannot name an App.')
  }
  if (state !== 'root_only' && !nestedAppId) {
    fail(409, 'An attached Kitchen must name its App.')
  }

  return { state: state as FireuxAppScopeState, appId: nestedAppId }
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
  if (!isKitchenOnboardingPlaceReady(place)) {
    fail(409, 'Finish the Place currency and timezone before adding a Kitchen.')
  }
}

export function isKitchenOnboardingPlaceReady(
  place: Record<string, unknown>
) {
  return Boolean(
    normalizePlaceCurrencyCode(place.default_currency_code) &&
    normalizePlaceTimezone(place.timezone)
  )
}

export function isKitchenOnboardingPlaceOwnedByApp(
  place: Record<string, unknown>,
  appId: string
) {
  return onboardingText(onboardingRecord(place.created).app_id) === appId
}

export function kitchenOnboardingSlugCandidates(
  placeName: string,
  kitchenId: string
) {
  const base = normalizeSlug(placeName, { maxLength: 60 })
  const suffix = normalizeSlug(kitchenId, { maxLength: 40 })
  const candidates = [
    base,
    `${base}-${suffix.slice(0, 8)}`,
    `${base}-${suffix}`,
  ]
  const unique = new Set<string>()

  for (const candidate of candidates) {
    const result = validatePublicSlug(candidate, {
      label: 'Kitchen slug',
      namespace: 'Kitchens',
      reservedScope: 'entity',
      minLength: 2,
      maxLength: 120,
    })
    if (result.isValid && result.slug) unique.add(result.slug)
  }
  if (!unique.size) fail(409, 'The Place name cannot create a Kitchen route.')
  return [...unique]
}

export function readKitchenOnboardingSupport(
  value: Record<string, unknown> | null
) {
  if (!value) return null
  const allowedKeys = new Set([
    'operator_ids',
    'team_ids',
    'join_requests',
    'created',
    'updated',
  ])
  const unsupported = Object.keys(value).find(key => !allowedKeys.has(key))
  if (unsupported) {
    fail(409, `Kitchen App support contains unsupported field: ${unsupported}.`)
  }

  return {
    operatorIds: boundedIds(value.operator_ids, 50, 'Kitchen operators'),
    teamIds: boundedIds(value.team_ids, 100, 'Kitchen team'),
    joinRequests: boundedIds(
      value.join_requests,
      100,
      'Kitchen join requests'
    ),
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
