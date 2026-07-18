import {
  computed,
  inject,
  provide,
  type InjectionKey,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'
import { useKitchenConsoleOrders } from './useKitchenConsoleOrders'
import { useKitchenOrderPassSelection } from './useKitchenOrderPassSelection'

const normalizeId = (value: unknown) => String(value ?? '').trim()

function createKitchenOrdersWorkspace() {
  const orders = useKitchenConsoleOrders()
  const canOperate = computed(() =>
    orders.canWrite.value && !orders.readOnly.value
  )
  const pass = useKitchenOrderPassSelection({
    canOperate,
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
    incomingOrders: orders.incomingOrders,
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

export type KitchenOrdersWorkspace = ReturnType<
  typeof createKitchenOrdersWorkspace
>

const kitchenOrdersWorkspaceKey: InjectionKey<KitchenOrdersWorkspace> =
  Symbol('KitchenOrdersWorkspace')

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
