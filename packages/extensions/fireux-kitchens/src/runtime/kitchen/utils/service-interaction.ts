import type { KitchenOrderType } from '../models/order-lifecycle.model'
import type {
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../models/service.model'

export function newKitchenServiceInteraction(
  type: 'browse'
): Extract<KitchenServiceInteraction, { type: 'browse' }>
export function newKitchenServiceInteraction(
  type: KitchenOrderType
): Exclude<KitchenServiceInteraction, { type: 'browse' }>
export function newKitchenServiceInteraction(
  type: 'browse' | KitchenOrderType
): KitchenServiceInteraction
export function newKitchenServiceInteraction(
  type: 'browse' | KitchenOrderType
): KitchenServiceInteraction {
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

export function patchKitchenServiceInteraction(
  type: 'browse' | KitchenOrderType,
  current: KitchenServiceInteraction | undefined,
  changes: KitchenServiceInteractionChanges
): KitchenServiceInteraction {
  if (type === 'browse')
    return { type, enabled: changes.enabled ?? current?.enabled ?? true }
  const previous = current?.type !== 'browse' ? current : undefined
  const { fulfilment, ...rest } = changes
  const next = {
    ...(previous || newKitchenServiceInteraction(type)),
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
