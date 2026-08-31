// Concurrent edit — 2026-08-23 CEST — Kitchen Workspace reset: resolve the signed-in user's active Kitchens.
import { createError } from 'h3'
import type { AppUser } from 'fireux-core/runtime/app/models/app-user.model'
import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { KITCHEN_USER_LIMIT } from '../../models/kitchen-index.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

export function readAppUserKitchenIds(
  membership: Pick<AppUser, 'kitchens'> | Record<string, unknown> | undefined
) {
  const ids = [
    ...new Set(
      (Array.isArray(membership?.kitchens) ? membership.kitchens : [])
        .map(text)
        .filter(Boolean)
    ),
  ]
  if (ids.length > KITCHEN_USER_LIMIT) {
    conflict('User Kitchens exceed the supported limit.')
  }
  return ids
}

export function resolveAppUserKitchenState(
  membership: Pick<AppUser, 'kitchens'> | Record<string, unknown> | undefined,
  kitchenId: string,
  capacity: FireuxAppSubscriptionCapacity
) {
  const primaryKitchen = text(kitchenId)
  if (!primaryKitchen) conflict('Kitchen id is required.')
  const currentKitchenIds = readAppUserKitchenIds(membership)
  const subscription = resolveAppUserAccess(membership).subscription
  if (
    !currentKitchenIds.includes(primaryKitchen) &&
    !hasAppSubscriptionCapacity(
      capacity,
      'kitchen',
      subscription,
      currentKitchenIds.length
    )
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your current subscription supports one Kitchen.',
    })
  }
  const kitchens = [...new Set([...currentKitchenIds, primaryKitchen])]
  if (kitchens.length > KITCHEN_USER_LIMIT) {
    conflict('User Kitchens exceed the supported limit.')
  }
  return { kitchens, primary_kitchen: primaryKitchen }
}
