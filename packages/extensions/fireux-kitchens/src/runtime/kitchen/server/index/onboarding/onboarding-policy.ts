// Concurrent edit — 2026-07-21 17:30 CEST — Kitchen onboarding: centralize fail-closed scope, access, locale, and capacity policy.
// Concurrent edit — 2026-07-28 18:10 CEST — Pre-release Kitchen spine: reject compatibility scope vocabulary and malformed support authority.
import { createError } from 'h3'
import { resolveKitchenAllowance } from '../../../utils/kitchen-capacity.ts'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/workspace/server/entity/onboarding-authority'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from 'fireux-places/runtime/place/utils/place-spine'
import type { KitchenOnboardingPreview } from '../../../models/kitchen-onboarding.model.ts'

export type KitchenOnboardingMemberRole = 'admin' | 'user' | 'dev'

export const onboardingText = (value: unknown) => String(value ?? '').trim()
export const onboardingRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export function requireOnboardingMemberRole(
  exists: boolean,
  value: unknown
): KitchenOnboardingMemberRole {
  return requireWorkspaceEntityMemberRole({
    exists,
    role: value,
    entityLabel: 'Kitchen',
  })
}

export function assertKitchenOnboardingPlaceDefaults(
  place: Record<string, unknown>
) {
  if (place.place_type === 'non_physical') return
  if (
    !normalizePlaceCurrencyCode(place.default_currency_code) ||
    !normalizePlaceTimezone(place.timezone)
  ) {
    fail(409, 'Finish the Place currency and timezone before adding a Kitchen.')
  }
}

export function kitchenOnboardingAccessDecision(input: {
  kitchen: Record<string, unknown> | null
  teamMember: Record<string, unknown> | null
  uid: string
  role: KitchenOnboardingMemberRole
  canCreate: boolean
  kitchenId?: string
  membership?: unknown
  kitchenIds: readonly string[]
}): Pick<KitchenOnboardingPreview, 'action' | 'can_complete' | 'message'> {
  const associated = input.kitchenId
    ? input.kitchenIds.includes(input.kitchenId)
    : false
  if (
    input.kitchenId &&
    !associated &&
    !resolveKitchenAllowance(input.membership, input.kitchenIds).hasCapacity
  ) {
    return {
      action: 'request_access',
      can_complete: false,
      message:
        'Your plan includes one kitchen. You can still open your existing kitchens. Business lets you add more.',
    }
  }

  if (!input.kitchen) {
    if (input.canCreate) {
      return { action: 'create', can_complete: true }
    }
    return {
      action: 'request_access',
      can_complete: false,
      message: 'Kitchen creation is disabled for this App.',
    }
  }

  if (associated || input.teamMember?.user_id === input.uid) {
    return { action: associated ? 'open' : 'connect', can_complete: true }
  }
  if (input.role === 'admin' || input.role === 'dev') {
    return { action: 'connect', can_complete: true }
  }
  return {
    action: 'request_access',
    can_complete: false,
    message:
      'You do not currently have access to add this kitchen. Ask an administrator for help.',
  }
}
