import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import type { KitchenOrder } from '../../../utils/order.ts'
import { useKitchenWorkspaceOrders } from './useKitchenWorkspaceOrders'
import { useKitchenOrderPassSelection } from './useKitchenOrderPassSelection'

import {
  matchesOrderBoardFilters,
  type OrderBoardFilters,
} from '../../../utils/order-board-filter'

const normalizeId = (value: unknown) => String(value ?? '').trim()

function createKitchenOrdersWorkspace(filters?: Ref<OrderBoardFilters>) {
  const source = useKitchenWorkspaceOrders()
  const filtered = (records: Ref<KitchenOrder[]>) =>
    computed(() =>
      filters
        ? records.value.filter((order) =>
            matchesOrderBoardFilters(order, filters.value)
          )
        : records.value
    )
  const orders = {
    ...source,
    incomingOrders: filtered(source.incomingOrders),
    scheduledOrders: filtered(source.scheduledOrders),
    paymentOrders: filtered(source.paymentOrders),
    passOrders: filtered(source.passOrders),
    queueOrders: filtered(source.queueOrders),
    recentOrders: filtered(source.recentOrders),
  }
  const canOperate = computed(
    () =>
      orders.outcome.value === 'ready' &&
      orders.canWrite.value &&
      !orders.readOnly.value
  )
  const pass = useKitchenOrderPassSelection({
    canOperate,
    captureIntent: orders.captureIntent,
    orders: orders.passOrders,
    isTransitioning: isOrderTransitioning,
    completeOrder: orders.completeOrder,
  })

  function isOrderTransitioning(orderId: unknown) {
    return orders.isOrderTransitioning(normalizeId(orderId))
  }

  function canInteract(order: KitchenOrder) {
    return canOperate.value && !isOrderTransitioning(order.id)
  }

  async function returnPassOrder(orderId: string) {
    if (!canOperate.value) return

    try {
      await orders.returnOrderToQueue(normalizeId(orderId))
    } catch {
      // The transition mutation exposes the display error.
    }
  }

  async function markQueueOrderReady(orderId: string) {
    if (!canOperate.value) return

    try {
      await orders.markOrderReady(normalizeId(orderId))
    } catch {
      // The transition mutation exposes the operator-facing error state.
    }
  }

  return {
    visibleOrderCount: computed(
      () =>
        orders.incomingOrders.value.length +
        orders.scheduledOrders.value.length +
        orders.paymentOrders.value.length +
        orders.queueOrders.value.length +
        orders.passOrders.value.length +
        orders.recentOrders.value.length
    ),
    kitchenId: orders.kitchenId,
    storageKitchenId: orders.storageKitchenId,
    captureIntent: orders.captureIntent,
    debug: orders.debug,
    transitionError: orders.transitionError,
    outcome: orders.outcome,
    pending: orders.pending,
    readError: orders.readError,
    incomingOrders: orders.incomingOrders,
    scheduledOrders: orders.scheduledOrders,
    startPreparation: orders.startPreparation,
    paymentOrders: orders.paymentOrders,
    passOrders: orders.passOrders,
    queueOrders: orders.queueOrders,
    recentOrders: orders.recentOrders,
    acceptOrder: orders.acceptOrder,
    rejectOrder: orders.rejectOrder,
    canOperate,
    canInteract,
    isOrderTransitioning,
    markQueueOrderReady,
    normalizeId,
    pass,
    returnPassOrder,
  }
}

export type KitchenOrdersContext = ReturnType<
  typeof createKitchenOrdersWorkspace
>

const kitchenOrdersWorkspaceKey: InjectionKey<KitchenOrdersContext> = Symbol(
  'KitchenOrdersContext'
)

export function provideKitchenOrdersContext(filters?: Ref<OrderBoardFilters>) {
  const workspace = createKitchenOrdersWorkspace(filters)
  provide(kitchenOrdersWorkspaceKey, workspace)
  return workspace
}

export function useKitchenOrdersContext() {
  const workspace = inject(kitchenOrdersWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Orders workspace is not available')
  }

  return workspace
}
