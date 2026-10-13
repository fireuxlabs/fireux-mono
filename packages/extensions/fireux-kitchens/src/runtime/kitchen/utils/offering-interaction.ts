import type { KitchenOrderType } from '../models/offering-interaction-types.model'
import type {
  KitchenOfferingInteraction,
  KitchenOfferingInteractionChanges,
} from '../models/offering.model'

export function newKitchenOfferingInteraction(
  type: 'browse'
): Extract<KitchenOfferingInteraction, { type: 'browse' }>
export function newKitchenOfferingInteraction(
  type: KitchenOrderType
): Exclude<KitchenOfferingInteraction, { type: 'browse' }>
export function newKitchenOfferingInteraction(
  type: 'browse' | KitchenOrderType
): KitchenOfferingInteraction
export function newKitchenOfferingInteraction(
  type: 'browse' | KitchenOrderType
): KitchenOfferingInteraction {
  if (type === 'browse') return { type, enabled: true }
  return {
    type,
    enabled: false,
    notice_hours: type === 'pre_order' ? 24 : type === 'delivery' ? 0.75 : 0.5,
    asap_enabled: type !== 'pre_order',
    slot_interval_minutes: 30,
    schedule_horizon_days: type === 'pre_order' ? 30 : 7,
  }
}

export function patchKitchenOfferingInteraction(
  type: 'browse' | KitchenOrderType,
  current: KitchenOfferingInteraction | undefined,
  changes: KitchenOfferingInteractionChanges
): KitchenOfferingInteraction {
  if (type === 'browse')
    return { type, enabled: changes.enabled ?? current?.enabled ?? true }
  const previous = current?.type !== 'browse' ? current : undefined
  const { fulfilment, ...rest } = changes
  const next = {
    ...(previous || newKitchenOfferingInteraction(type)),
    ...rest,
    type,
  }
  for (const key of ['customer', 'availability', 'notifications'] as const) {
    if (changes[key])
      Object.assign(next, { [key]: { ...previous?.[key], ...changes[key] } })
  }
  if (fulfilment) {
    const { deposit, ...fields } = fulfilment
    next.fulfilment = { ...previous?.fulfilment, ...fields }
    if (deposit === null) delete next.fulfilment.deposit
    else if (deposit !== undefined) next.fulfilment.deposit = deposit
    if (!Object.keys(next.fulfilment).length) delete next.fulfilment
  }
  if (type === 'pre_order') next.asap_enabled = false
  return next
}
