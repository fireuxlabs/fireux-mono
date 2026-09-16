import type { KitchenOrderType } from '../models/order-lifecycle.model'
import type {
  KitchenOrderingService,
  KitchenOrderingServiceChanges,
} from '../models/ordering.model'

export function newKitchenOrderingService(
  type: KitchenOrderType
): KitchenOrderingService {
  return {
    type,
    enabled: false,
    menu_ids: [],
    notice_hours: type === 'pre_order' ? 24 : type === 'delivery' ? 0.75 : 0.5,
    asap_enabled: type !== 'pre_order',
    slot_interval_minutes: 30,
    schedule_horizon_days: type === 'pre_order' ? 30 : 7,
  }
}

export function patchKitchenOrderingService(
  type: KitchenOrderType,
  current: KitchenOrderingService | undefined,
  changes: KitchenOrderingServiceChanges
): KitchenOrderingService {
  const { fulfilment, ...rest } = changes
  const next: KitchenOrderingService = {
    ...(current || newKitchenOrderingService(type)),
    ...rest,
    type,
  }
  for (const key of ['customer', 'availability', 'notifications'] as const) {
    if (changes[key])
      (next as Record<string, unknown>)[key] = {
        ...current?.[key],
        ...changes[key],
      }
  }
  if (fulfilment) {
    const { deposit, ...fields } = fulfilment
    next.fulfilment = { ...current?.fulfilment, ...fields }
    if (deposit === null) delete next.fulfilment.deposit
    else if (deposit !== undefined) next.fulfilment.deposit = deposit
    if (!Object.keys(next.fulfilment).length) delete next.fulfilment
  }
  next.menu_ids = [...new Set(next.menu_ids)]
  if (type === 'pre_order') next.asap_enabled = false
  return next
}
