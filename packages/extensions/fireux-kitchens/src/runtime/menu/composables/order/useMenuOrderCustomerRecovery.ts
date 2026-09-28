import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../../user/models/customer/order.model.ts'
import type {
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../kitchen/utils/order.ts'
import {
  customerOrderRequestError,
  isTerminalMenuOrderStatus,
  isTransientCustomerOrderRequestFailure,
  menuOrderWaitingFor,
  recoveredMenuOrderBasketLines,
} from '../../utils/menu-order-customer-recovery'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import type {
  MenuOrderTrackingSession,
  MenuOrderTrackingStatus,
} from './useMenuOrderTrackingSession'

type MenuOrderRecoveryUser = {
  getIdToken: () => Promise<string>
  uid: string
}

type RecoverableCustomerOrder = CustomerOrderSummary & {
  order_number: string
}

type UseMenuOrderCustomerRecoveryOptions = {
  currentUser: MaybeRefOrGetter<MenuOrderRecoveryUser | null | undefined>
  requestedOrderId?: MaybeRefOrGetter<string>
  fulfilmentLabel: (order: CustomerOrderSummary) => string
  kitchenServiceId: MaybeRefOrGetter<string>
  kitchenId: MaybeRefOrGetter<string>
  orderType: KitchenOrderType
  refreshStatus: () => Promise<unknown>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
  tracking: MenuOrderTrackingSession<MenuOrderTrackingStatus>
}

const customerRecoveryRetryDelay = 5000
const maximumCustomerRecoveryRetryDelay = 30_000
const text = (value: unknown) => String(value ?? '').trim()

export function useMenuOrderCustomerRecovery(
  options: UseMenuOrderCustomerRecoveryOptions
) {
  const recovery = ref<Record<string, unknown>>({ phase: 'idle' })
  const amendmentLines = ref<MenuOrderBasketLine[]>([])
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined
  let consecutiveRecoveryFailures = 0
  let attempt = 0

  async function restoreOrder() {
    stopRetry()
    const currentAttempt = ++attempt
    const expectedScope = text(toValue(options.scopeKey))
    const requestedId = text(toValue(options.requestedOrderId))
    let restoredLocally = options.tracking.sentOrder.value
      ? true
      : options.tracking.restore()
    if (
      requestedId &&
      text(options.tracking.sentOrder.value?.id) !== requestedId
    ) {
      options.tracking.resetMemory()
      restoredLocally = false
    }
    if (restoredLocally) void options.refreshStatus()
    const user = toValue(options.currentUser)
    const expectedUserId = user?.uid || ''
    const kitchenId = text(toValue(options.kitchenId))
    const sourceMenuId = text(toValue(options.sourceMenuId))
    const isCurrent = () =>
      currentAttempt === attempt &&
      expectedScope === text(toValue(options.scopeKey)) &&
      expectedUserId === (toValue(options.currentUser)?.uid || '') &&
      kitchenId === text(toValue(options.kitchenId)) &&
      sourceMenuId === text(toValue(options.sourceMenuId))
    recovery.value = {
      phase: user ? 'resolving-customer-order' : 'checking-customer-session',
      signed_in: Boolean(user),
      waiting_for: user ? '' : 'customer',
      kitchen_id: kitchenId,
      source_menu_id: sourceMenuId,
      scope_ready: Boolean(expectedScope),
    }
    if (
      !user ||
      !expectedUserId ||
      !expectedScope ||
      !kitchenId ||
      !sourceMenuId
    )
      return

    try {
      const token = await user.getIdToken()
      if (!isCurrent()) return
      const page = await $fetch<CustomerOrderPage>('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!isCurrent()) return
      consecutiveRecoveryFailures = 0

      const matchesService = (order: CustomerOrderSummary) =>
        order.kitchen_service_id === text(toValue(options.kitchenServiceId)) &&
        order.order_type === options.orderType &&
        order.kitchen.id === kitchenId &&
        order.menu.id === sourceMenuId
      const trackedId =
        requestedId || text(options.tracking.sentOrder.value?.id)
      const trackedCandidate = trackedId
        ? page.items.find(
            (order) => order.id === trackedId && matchesService(order)
          )
        : undefined
      if (requestedId && !trackedCandidate) {
        recovery.value = {
          phase: 'requested-order-unavailable',
          signed_in: true,
        }
        return
      }
      const matching = page.items.filter(
        (order): order is RecoverableCustomerOrder =>
          isRecoverableCustomerOrder(order) &&
          matchesService(order) &&
          !options.tracking.isAcknowledged(order.id)
      )
      const recovered =
        isRecoverableCustomerOrder(trackedCandidate) &&
        !isTerminalMenuOrderStatus(trackedCandidate.status)
          ? trackedCandidate
          : matching.find((order) => !isTerminalMenuOrderStatus(order.status))
      recovery.value = {
        phase: recovered ? 'customer-order' : 'no-match',
        signed_in: true,
        order_count: page.items.length,
        recovered_order_id: recovered?.id || '',
        waiting_for: menuOrderWaitingFor(recovered?.status),
      }
      if (!recovered) {
        if (
          trackedCandidate &&
          isTerminalMenuOrderStatus(trackedCandidate.status)
        ) {
          options.tracking.acknowledge()
          amendmentLines.value = []
        }
        return
      }

      restoreCustomerOrder(recovered)
      options.tracking.save()
      void options.refreshStatus()
    } catch (caught) {
      if (!isCurrent()) return
      consecutiveRecoveryFailures += 1
      const transientFailure = isTransientCustomerOrderRequestFailure(caught)
      recovery.value = {
        phase: 'customer-order-error',
        signed_in: true,
        waiting_for: 'customer',
        error: transientFailure
          ? 'Customer order recovery is temporarily unavailable.'
          : customerOrderRequestError(
              caught,
              'Customer order recovery failed.'
            ),
      }
      if (transientFailure) scheduleRetry()
    }
  }

  function scheduleRetry() {
    stopRetry()
    if (
      !import.meta.client ||
      !toValue(options.currentUser) ||
      hasActiveTrackedOrder()
    )
      return

    recoveryTimer = setTimeout(() => {
      void restoreOrder()
    }, nextRecoveryDelay(consecutiveRecoveryFailures))
  }

  function stopRetry() {
    if (recoveryTimer) clearTimeout(recoveryTimer)
    recoveryTimer = undefined
  }

  function resetTransientState() {
    attempt += 1
    stopRetry()
    recovery.value = { phase: 'idle' }
    consecutiveRecoveryFailures = 0
    amendmentLines.value = []
  }

  function hasActiveTrackedOrder() {
    const status =
      options.tracking.status.value?.status ||
      options.tracking.sentOrder.value?.status

    return Boolean(status && !isTerminalMenuOrderStatus(status))
  }

  function restoreCustomerOrder(order: RecoverableCustomerOrder) {
    options.tracking.capabilityToken.value = ''
    options.tracking.sentOrder.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      kitchen_service_id: order.kitchen_service_id,
      kitchen_service_name: order.kitchen_service_name,
      order_type: order.order_type,
      channel: recoveredChannel(order.order_type),
      ...(order.collection ? { collection: order.collection } : {}),
    }
    options.tracking.status.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      kitchen_service_id: order.kitchen_service_id,
      kitchen_service_name: order.kitchen_service_name,
      order_type: order.order_type,
      estimated_ready_minutes: order.estimated_ready_minutes ?? 0,
      estimated_ready_at: order.estimated_ready_at ?? '',
      ...(order.kitchen_note ? { kitchen_note: order.kitchen_note } : {}),
      ...(order.collection ? { collection: order.collection } : {}),
    }
    options.tracking.fulfilmentLabel.value = options.fulfilmentLabel(order)
    options.tracking.paymentLabel.value = paymentLabel(
      order.payment?.method,
      options.orderType
    )
    amendmentLines.value = recoveredMenuOrderBasketLines(order)
  }

  return {
    amendmentLines,
    recovery,
    resetTransientState,
    restoreOrder,
  }
}

function isRecoverableCustomerOrder(
  order: CustomerOrderSummary | undefined
): order is RecoverableCustomerOrder {
  return Boolean(order && text(order.order_number))
}

function nextRecoveryDelay(failures: number) {
  return Math.min(
    maximumCustomerRecoveryRetryDelay,
    customerRecoveryRetryDelay * 2 ** Math.min(Math.max(failures - 1, 0), 3)
  )
}

function paymentLabel(
  method: KitchenOrderPaymentMethod | undefined,
  orderType: KitchenOrderType
) {
  if (method === 'online_card') return 'Pay online'
  if (!method) return ''
  if (orderType === 'collection') return 'Pay when you collect'
  if (orderType === 'delivery') return 'Pay when delivered'
  if (orderType === 'eat_in' || orderType === 'takeaway') {
    return 'Pay at the counter'
  }
  return 'Pay later'
}

function recoveredChannel(orderType: KitchenOrderType) {
  return orderType === 'eat_in' || orderType === 'takeaway'
    ? ('kiosk' as const)
    : ('menu' as const)
}
