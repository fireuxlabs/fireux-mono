import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed, type Ref } from 'vue'
import type { Order } from '../models/order.model'
import { useOrdersFetchByScope } from './useOrdersFetchByScope'

const toMillis = (value: unknown): number => {
  if (!value) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value instanceof Date) return value.getTime()

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    if (typeof source.seconds === 'number') {
      return source.seconds * 1000
    }
    if (typeof source.toDate === 'function') {
      const maybeDate = source.toDate as () => Date
      const asDate = maybeDate()
      return asDate instanceof Date ? asDate.getTime() : 0
    }
  }

  return 0
}

export function useOrdersForKitchenFetch(kitchenId: Ref<string> | string) {
  const resolvedKitchenId = computed(() =>
    String(typeof kitchenId === 'string' ? kitchenId : kitchenId.value || '').trim()
  )

  const { orders: scopeOrders } = useOrdersFetchByScope(
    computed(() =>
      resolvedKitchenId.value
        ? {
            type: 'kitchen',
            id: resolvedKitchenId.value,
          }
        : null
    )
  )

  const orders = computed<Order[]>(() => {
    const scoped = scopeOrders.value ?? []
    const deduped = new Map<string, Order>()

    for (const order of scoped) {
      const id = String(order?.id || '').trim()
      if (!id) continue
      if (!deduped.has(id)) deduped.set(id, order)
    }

    return [...deduped.values()].sort(
      (a, b) =>
        toMillis((b as any).updated?.at ?? (b as any).updated_at) -
        toMillis((a as any).updated?.at ?? (a as any).updated_at)
    )
  })
  const { byId: order } = useCollectionById(orders)

  return {
    kitchenId: resolvedKitchenId,
    orders,
    order,
  }
}
