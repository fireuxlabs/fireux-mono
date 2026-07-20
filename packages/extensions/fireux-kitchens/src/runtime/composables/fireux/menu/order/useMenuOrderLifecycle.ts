// Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: preserve counter channel and payment copy during shared recovery.
// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: let a newer unresolved account Order replace an older terminal local tracker.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: authorize same-device status, payment, and response requests through canonical tracking.
// Concurrent edit — 2026-07-20 16:40 CEST — Menu Order recovery pass: keep transient outages quiet and retry status plus signed-in recovery with bounded backoff.
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type {
  KitchenOrderPaymentMethod,
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../../../models/kitchen/order.model'
import type { CreatedMenuOrder } from '../../../../models/kitchen/menu/menu-ordering.model'
import type { CustomerOrderPage, CustomerOrderSummary } from '../../../../models/customer/order.model'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import { menuOrderAccessHeaders } from '../../../../utils/menu-order-capability'
import {
  createdMenuOrderBasketLines,
  createMenuOrderRequestKey,
  createdMenuOrderTrackingStatus,
  customerOrderRequestError,
  isTerminalMenuOrderStatus,
  menuOrderWaitingFor,
  recoveredMenuOrderBasketLines,
} from '../../../../utils/menu-order-customer-recovery'
import {
  useMenuOrderTrackingSession,
  type MenuOrderTrackingStatus,
} from './useMenuOrderTrackingSession'

export type MenuOrderLifecycleStatus = MenuOrderTrackingStatus
type UseMenuOrderLifecycleOptions = {
  fulfilmentLabel: (order: CustomerOrderSummary) => string
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  orderType: KitchenOrderType
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuOrderLifecycleInput = {
  body: Record<string, unknown>, fulfilmentLabel: string, paymentLabel: string
}

const text = (value: unknown) => String(value ?? '').trim()
const pausedTrackingStatuses = new Set<KitchenOrderStatus>([
  'changes_requested',
  'completed',
  'cancelled',
  'trashed',
])
const statusRefreshDelay = 2500
const maximumStatusRefreshDelay = 15_000
const visibleStatusFailureThreshold = 3
const customerRecoveryRetryDelay = 5000
const maximumCustomerRecoveryRetryDelay = 30_000

// Surface wrappers own request details; this seam owns submission, tracking, recovery, and customer response.
export function useMenuOrderLifecycle(options: UseMenuOrderLifecycleOptions) {
  const { currentUser, hasAuthState } = useAuth()
  const tracking = useMenuOrderTrackingSession({
    orderType: options.orderType,
    scopeKey: options.scopeKey,
  })
  const pending = ref(false)
  const statusPending = ref(false)
  const responsePending = ref(false)
  const error = ref('')
  const responseError = ref('')
  const statusError = ref('')
  const recovery = ref<Record<string, unknown>>({ phase: 'idle' })
  const amendmentLines = ref<MenuOrderBasketLine[]>([])
  let statusTimer: ReturnType<typeof setTimeout> | undefined
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined
  let consecutiveStatusFailures = 0
  let consecutiveRecoveryFailures = 0
  let requestKey = ''
  let requestSignature = ''

  const endpointBase = computed(() => {
    const menuId = text(toValue(options.menuId))
    return menuId ? `/api/menus/${encodeURIComponent(menuId)}/orders` : ''
  })
  const querySuffix = computed(() => {
    const query = new URLSearchParams()
    const kitchenSlug = text(toValue(options.kitchenSlug))
    if (kitchenSlug) query.set('kitchenSlug', kitchenSlug)
    const suffix = query.toString()

    return suffix ? `?${suffix}` : ''
  })
  const endpoint = computed(() => endpointBase.value
    ? `${endpointBase.value}${querySuffix.value}`
    : ''
  )
  const statusEndpoint = computed(() => orderEndpoint(''))
  const customerResponseEndpoint = computed(() => orderEndpoint('/customer-response'))
  const customerName = computed(() => {
    const displayName = text(currentUser.value?.displayName)
    return displayName || text(currentUser.value?.email).split('@')[0] || ''
  })
  const accessHeaders = () => menuOrderAccessHeaders(
    currentUser.value,
    tracking.capabilityToken.value
  )

  function orderEndpoint(suffix: string) {
    const orderId = text(tracking.sentOrder.value?.id)
    return endpointBase.value && orderId
      ? `${endpointBase.value}/${encodeURIComponent(orderId)}${suffix}${querySuffix.value}`
      : ''
  }

  async function submit(input: SubmitMenuOrderLifecycleInput) {
    if (pending.value || !endpoint.value) return null
    error.value = ''
    const signature = JSON.stringify(input.body)
    if (!requestKey || requestSignature !== signature) {
      requestKey = createMenuOrderRequestKey(options.orderType)
      requestSignature = signature
    }

    pending.value = true
    try {
      const created = await $fetch<CreatedMenuOrder>(endpoint.value, {
        method: 'POST',
        headers: await menuOrderAccessHeaders(currentUser.value, ''),
        body: { ...input.body, idempotency_key: requestKey },
      })
      if (created.order_type !== options.orderType) {
        throw new Error('The Kitchen returned an invalid order type.')
      }

      tracking.trackCreated(created)
      tracking.fulfilmentLabel.value = input.fulfilmentLabel
      tracking.paymentLabel.value = input.paymentLabel
      tracking.status.value = createdMenuOrderTrackingStatus(created)
      tracking.save()
      if (created.payment?.required && created.payment.status !== 'paid') {
        await startCheckout(created.id)
      }
      scheduleStatusRefresh(0)
      return created
    } catch (caught) {
      error.value = customerOrderRequestError(caught, 'Order could not be sent.')
      return null
    } finally {
      pending.value = false
    }
  }

  async function startCheckout(orderId: string) {
    if (!endpointBase.value || !text(orderId)) {
      throw new Error('Payment checkout could not be started.')
    }
    const response = await $fetch<{ url?: string }>(
      `${endpointBase.value}/${encodeURIComponent(orderId)}/checkout-session${querySuffix.value}`,
      {
        method: 'POST',
        headers: await accessHeaders(),
      }
    )
    const checkoutUrl = text(response?.url)
    if (!checkoutUrl) throw new Error('Payment checkout could not be started.')
    if (import.meta.client) window.location.href = checkoutUrl
  }

  async function refreshStatus() {
    if (!statusEndpoint.value || statusPending.value) return null
    statusPending.value = true
    try {
      const next = await $fetch<MenuOrderLifecycleStatus>(statusEndpoint.value, {
        headers: await accessHeaders(),
      })
      if (next.order_type !== options.orderType) {
        throw new Error('The Kitchen returned an invalid order type.')
      }
      consecutiveStatusFailures = 0
      statusError.value = ''
      tracking.status.value = next
      tracking.save()
      return next
    } catch (caught) {
      consecutiveStatusFailures += 1
      if (!isTransientStatusFailure(caught)) {
        statusError.value = customerOrderRequestError(
          caught,
          'Order status could not be checked.'
        )
      } else if (consecutiveStatusFailures >= visibleStatusFailureThreshold) {
        statusError.value = 'Live order updates are temporarily unavailable.'
      }
      return null
    } finally {
      statusPending.value = false
    }
  }

  async function respondToChanges(input: { action: 'amend' | 'cancel' }) {
    if (responsePending.value || !customerResponseEndpoint.value) return null
    responseError.value = ''

    responsePending.value = true
    try {
      const response = await $fetch<{
        ok: boolean
        order: { id: string, status: KitchenOrderStatus }
      }>(customerResponseEndpoint.value, {
        method: 'POST',
        headers: await accessHeaders(),
        body: { action: input.action },
      })
      if (!response.ok) throw new Error('The response could not be saved.')
      if (input.action === 'amend') amendmentLines.value =
        createdMenuOrderBasketLines(tracking.receiptItems.value)
      tracking.acknowledge()
      if (input.action === 'cancel') amendmentLines.value = []
      return response.order
    } catch (caught) {
      responseError.value = customerOrderRequestError(
        caught,
        'Your response could not be saved.'
      )
      return null
    } finally {
      responsePending.value = false
    }
  }

  function scheduleStatusRefresh(delay = 2500) {
    stopStatusRefresh()
    if (!import.meta.client || !tracking.sentOrder.value) return
    if (
      tracking.status.value &&
      pausedTrackingStatuses.has(tracking.status.value.status)
    ) return
    statusTimer = setTimeout(async () => {
      await refreshStatus()
      scheduleStatusRefresh(nextStatusRefreshDelay(consecutiveStatusFailures))
    }, delay)
  }

  function stopStatusRefresh() {
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = undefined
  }

  function reset() {
    stopStatusRefresh()
    stopRecoveryRetry()
    tracking.acknowledge()
    resetTransientState()
  }

  async function restoreOrder() {
    stopRecoveryRetry()
    const expectedScope = text(toValue(options.scopeKey))
    const restoredLocally = tracking.sentOrder.value
      ? true
      : tracking.restore()
    if (restoredLocally) scheduleStatusRefresh(0)
    const user = currentUser.value
    const expectedUserId = user?.uid || ''
    const kitchenId = text(toValue(options.kitchenId))
    const sourceMenuId = text(toValue(options.sourceMenuId))
    recovery.value = {
      phase: user ? 'resolving-customer-order' : 'checking-customer-session',
      signed_in: Boolean(user),
      waiting_for: user ? '' : 'customer',
      kitchen_id: kitchenId,
      source_menu_id: sourceMenuId,
      scope_ready: Boolean(expectedScope),
    }
    if (!user || !expectedUserId || !expectedScope || !kitchenId || !sourceMenuId) return

    try {
      const token = await user.getIdToken()
      const page = await $fetch<CustomerOrderPage>('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (
        expectedScope !== text(toValue(options.scopeKey)) ||
        expectedUserId !== currentUser.value?.uid
      ) return
      consecutiveRecoveryFailures = 0

      const trackedId = text(tracking.sentOrder.value?.id)
      const trackedCandidate = trackedId
        ? page.items.find(order => order.id === trackedId)
        : undefined
      const matching = page.items.filter(order =>
        order.order_type === options.orderType &&
        order.kitchen.id === kitchenId &&
        order.menu.id === sourceMenuId &&
        !tracking.isAcknowledged(order.id)
      )
      const recovered = trackedCandidate &&
        !isTerminalMenuOrderStatus(trackedCandidate.status)
        ? trackedCandidate
        : matching.find(order => !isTerminalMenuOrderStatus(order.status))
      recovery.value = {
        phase: recovered ? 'customer-order' : 'no-match',
        signed_in: true,
        order_count: page.items.length,
        recovered_order_id: recovered?.id || '',
        waiting_for: menuOrderWaitingFor(recovered?.status),
      }
      if (!recovered) {
        if (trackedCandidate && isTerminalMenuOrderStatus(trackedCandidate.status)) {
          tracking.acknowledge()
          amendmentLines.value = []
        }
        return
      }

      restoreCustomerOrder(recovered)
      tracking.save()
      scheduleStatusRefresh(0)
    } catch (caught) {
      consecutiveRecoveryFailures += 1
      const transientFailure = isTransientStatusFailure(caught)
      recovery.value = {
        phase: 'customer-order-error',
        signed_in: true,
        waiting_for: 'customer',
        error: transientFailure
          ? 'Customer order recovery is temporarily unavailable.'
          : customerOrderRequestError(caught, 'Customer order recovery failed.'),
      }
      if (transientFailure) scheduleRecoveryRetry()
    }
  }

  function scheduleRecoveryRetry() {
    stopRecoveryRetry()
    if (
      !import.meta.client ||
      !currentUser.value ||
      hasActiveTrackedOrder()
    ) return

    recoveryTimer = setTimeout(
      () => { void restoreOrder() },
      nextCustomerRecoveryDelay(consecutiveRecoveryFailures)
    )
  }

  function stopRecoveryRetry() {
    if (recoveryTimer) clearTimeout(recoveryTimer)
    recoveryTimer = undefined
  }

  function hasActiveTrackedOrder() {
    const status = tracking.status.value?.status || tracking.sentOrder.value?.status

    return Boolean(status && !isTerminalMenuOrderStatus(status))
  }

  function restoreCustomerOrder(order: CustomerOrderSummary) {
    tracking.capabilityToken.value = ''
    tracking.sentOrder.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      order_type: order.order_type,
      channel: recoveredChannel(order.order_type),
      ...(order.collection ? { collection: order.collection } : {}),
    }
    tracking.status.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      order_type: order.order_type,
      estimated_ready_minutes: order.estimated_ready_minutes,
      estimated_ready_at: order.estimated_ready_at,
      ...(order.kitchen_note ? { kitchen_note: order.kitchen_note } : {}),
      ...(order.collection ? { collection: order.collection } : {}),
    }
    tracking.fulfilmentLabel.value = options.fulfilmentLabel(order)
    tracking.paymentLabel.value = paymentLabel(order.payment?.method)
    amendmentLines.value = recoveredMenuOrderBasketLines(order)
  }

  function paymentLabel(method: KitchenOrderPaymentMethod | undefined) {
    if (method === 'online_card') return 'Pay online'
    if (!method) return ''
    if (options.orderType === 'collection') return 'Pay when you collect'
    if (options.orderType === 'delivery') return 'Pay when delivered'
    if (options.orderType === 'eat_in' || options.orderType === 'takeaway') {
      return 'Pay at the counter'
    }
    return 'Pay later'
  }

  function resetTransientState() {
    error.value = ''
    responseError.value = ''
    statusError.value = ''
    requestKey = ''
    requestSignature = ''
    consecutiveStatusFailures = 0
    consecutiveRecoveryFailures = 0
    amendmentLines.value = []
  }

  watch(() => text(toValue(options.scopeKey)), () => {
    stopStatusRefresh()
    stopRecoveryRetry()
    tracking.resetMemory()
    resetTransientState()
    void restoreOrder()
  })
  watch(currentUser, user => { if (user) void restoreOrder() })
  watch(hasAuthState, resolved => {
    if (resolved && !tracking.sentOrder.value) void restoreOrder()
  })
  onMounted(() => { void restoreOrder() })
  onBeforeUnmount(() => {
    stopStatusRefresh()
    stopRecoveryRetry()
  })

  return {
    amendmentLines,
    customerName,
    error,
    fulfilmentLabel: tracking.fulfilmentLabel,
    paymentLabel: tracking.paymentLabel,
    pending,
    recovery,
    respondToChanges,
    responseError,
    responsePending,
    refreshStatus,
    reset,
    sentOrder: tracking.sentOrder,
    status: tracking.status,
    statusError,
    statusPending,
    submit,
  }
}

function nextStatusRefreshDelay(failures: number) {
  if (!failures) return statusRefreshDelay

  return Math.min(
    maximumStatusRefreshDelay,
    statusRefreshDelay * (2 ** Math.min(failures, 3))
  )
}

function nextCustomerRecoveryDelay(failures: number) {
  return Math.min(
    maximumCustomerRecoveryRetryDelay,
    customerRecoveryRetryDelay * (2 ** Math.min(Math.max(failures - 1, 0), 3))
  )
}

function isTransientStatusFailure(caught: unknown) {
  const source = caught && typeof caught === 'object'
    ? caught as { status?: unknown, statusCode?: unknown }
    : {}
  const status = Number(source.statusCode || source.status)

  return !Number.isFinite(status) || status === 0 || status === 408 ||
    status === 429 || status >= 500
}

function recoveredChannel(orderType: KitchenOrderType) {
  return orderType === 'eat_in' || orderType === 'takeaway'
    ? 'kiosk' as const
    : 'menu' as const
}
