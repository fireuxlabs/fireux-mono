import type { KitchenOrderIntake } from '../models/order-intake.model'
import type { KitchenOrderType } from '../models/order-lifecycle.model'

export function readKitchenOrderIntake(value: unknown): KitchenOrderIntake {
  if (value === undefined)
    return {
      pause: 'open',
      off_site_acceptance: 'manual',
      preparation_minutes: 45,
    }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Order intake policy is invalid.')
  const row = value as Record<string, unknown>
  if (
    Object.keys(row).some(
      (key) =>
        !['pause', 'off_site_acceptance', 'preparation_minutes'].includes(key)
    ) ||
    !['open', 'off_site', 'all'].includes(String(row.pause)) ||
    !['manual', 'automatic'].includes(String(row.off_site_acceptance)) ||
    !Number.isSafeInteger(row.preparation_minutes) ||
    Number(row.preparation_minutes) < 5 ||
    Number(row.preparation_minutes) > 90 ||
    Number(row.preparation_minutes) % 5 !== 0
  )
    throw new Error('Choose a valid intake mode and preparation time.')
  return {
    pause: row.pause as KitchenOrderIntake['pause'],
    off_site_acceptance:
      row.off_site_acceptance as KitchenOrderIntake['off_site_acceptance'],
    preparation_minutes: Number(row.preparation_minutes),
  }
}

export function kitchenOrderIntakeFromRoot(root: unknown) {
  const data =
    root && typeof root === 'object' ? (root as Record<string, unknown>) : {}
  const orders =
    data.orders && typeof data.orders === 'object'
      ? (data.orders as Record<string, unknown>)
      : {}
  return readKitchenOrderIntake(orders.intake)
}

export const isOffSiteKitchenOrder = (type: KitchenOrderType) =>
  ['collection', 'delivery', 'pre_order'].includes(type)
export const kitchenOrderIntakePaused = (
  policy: KitchenOrderIntake,
  type: KitchenOrderType
) =>
  policy.pause === 'all' ||
  (policy.pause === 'off_site' && isOffSiteKitchenOrder(type))
export const kitchenOrderRequiresAcceptance = (
  policy: KitchenOrderIntake,
  type: KitchenOrderType
) =>
  type === 'pre_order' ||
  (['collection', 'delivery'].includes(type) &&
    policy.off_site_acceptance === 'manual')
