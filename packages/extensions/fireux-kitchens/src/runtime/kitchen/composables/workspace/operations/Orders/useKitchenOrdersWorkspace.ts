import { computed, inject, provide, type InjectionKey } from 'vue'
import type { KitchenOrder } from '../../../../utils/order.ts'
import { useKitchenWorkspaceOrders } from './useKitchenWorkspaceOrders'
import { useKitchenOrderPassSelection } from './useKitchenOrderPassSelection'
import { useKitchenOrderServiceState } from './useKitchenOrderServiceState'

const normalizeId = (value: unknown) => String(value ?? '').trim()

function createKitchenOrdersWorkspace() {
  const orders = useKitchenWorkspaceOrders()
  const canOperate = computed(
    () => orders.canWrite.value && !orders.readOnly.value
  )
  const pass = useKitchenOrderPassSelection({
    canOperate,
    orders: orders.passOrders,
    isTransitioning: isOrderTransitioning,
    completeOrder: orders.completeOrder,
  })
  const scheduledWaitingOrders = computed(() =>
    orders.incomingOrders.value.filter((order) => {
      if (order.order_type === 'pre_order') return true
      const collection =
        order.collection &&
        typeof order.collection === 'object' &&
        !Array.isArray(order.collection)
          ? order.collection
          : {}
      return (
        order.order_type === 'collection' && collection.mode === 'scheduled'
      )
    })
  )
  const activeOrderCount = computed(
    () =>
      orders.paymentOrders.value.length +
      orders.incomingOrders.value.length +
      orders.queueOrders.value.length +
      orders.passOrders.value.length
  )
  const service = useKitchenOrderServiceState({
    activeOrderCount,
    allowManualOpen: orders.canOpenServiceSession,
    kitchenId: orders.kitchenId,
    selectedKitchen: orders.selectedKitchen,
    waitingOrderCount: computed(() => scheduledWaitingOrders.value.length),
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
    incomingOrders: orders.incomingOrders,
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
    scheduledWaitingOrders,
    service,
  }
}

export type KitchenOrdersWorkspace = ReturnType<
  typeof createKitchenOrdersWorkspace
>

const kitchenOrdersWorkspaceKey: InjectionKey<KitchenOrdersWorkspace> = Symbol(
  'KitchenOrdersWorkspace'
)

export function provideKitchenOrdersWorkspace() {
  const workspace = createKitchenOrdersWorkspace()
  provide(kitchenOrdersWorkspaceKey, workspace)
  return workspace
}

export function useKitchenOrdersWorkspace() {
  const workspace = inject(kitchenOrdersWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Orders workspace is not available')
  }

  return workspace
}
