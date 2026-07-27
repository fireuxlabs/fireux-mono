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
  KitchenOrderStatus,
  KitchenOrderType,
} from '../../../../models/kitchen/order.model'
import type { CreatedMenuOrder } from '../../../../models/kitchen/menu/menu-ordering.model'
import type { CustomerOrderSummary } from '../../../../models/customer/order.model'
import { menuOrderAccessHeaders } from '../../../../utils/menu-order-capability'
import {
  createdMenuOrderBasketLines,
  createMenuOrderRequestKey,
  createdMenuOrderTrackingStatus,
  customerOrderRequestError,
  isTransientCustomerOrderRequestFailure,
} from '../../../../utils/menu-order-customer-recovery'
import { useMenuOrderCustomerRecovery } from './useMenuOrderCustomerRecovery'
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
  let statusTimer: ReturnType<typeof setTimeout> | undefined
  let consecutiveStatusFailures = 0
  let requestKey = ''
  let requestSignature = ''
  const customerRecovery = useMenuOrderCustomerRecovery({
    currentUser: () => currentUser.value,
    fulfilmentLabel: options.fulfilmentLabel,
    kitchenId: options.kitchenId,
    orderType: options.orderType,
    scheduleStatusRefresh,
    scopeKey: options.scopeKey,
    sourceMenuId: options.sourceMenuId,
    tracking,
  })
  const { amendmentLines, recovery } = customerRecovery

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
      if (!isTransientCustomerOrderRequestFailure(caught)) {
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
    customerRecovery.stopRetry()
    tracking.acknowledge()
    resetTransientState()
  }

  function resetTransientState() {
    error.value = ''
    responseError.value = ''
    statusError.value = ''
    requestKey = ''
    requestSignature = ''
    consecutiveStatusFailures = 0
    customerRecovery.resetTransientState()
  }

  watch(() => text(toValue(options.scopeKey)), () => {
    stopStatusRefresh()
    customerRecovery.stopRetry()
    tracking.resetMemory()
    resetTransientState()
    void customerRecovery.restoreOrder()
  })
  watch(currentUser, user => {
    if (user) void customerRecovery.restoreOrder()
  })
  watch(hasAuthState, resolved => {
    if (resolved && !tracking.sentOrder.value) {
      void customerRecovery.restoreOrder()
    }
  })
  onMounted(() => { void customerRecovery.restoreOrder() })
  onBeforeUnmount(() => {
    stopStatusRefresh()
    customerRecovery.stopRetry()
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
