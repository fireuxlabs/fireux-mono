import { useRoute } from '#imports'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
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
} from '../../../kitchen/utils/order.ts'
import type { CreatedMenuOrder } from '../../models/menu-order-receipt.model.ts'
import type { CustomerOrderSummary } from '../../../user/models/customer/order.model.ts'
import { menuOrderAccessHeaders } from '../../utils/menu-order-capability'
import {
  createdMenuOrderBasketLines,
  createMenuOrderRequestKey,
  createdMenuOrderTrackingStatus,
  customerOrderRequestError,
  isTransientCustomerOrderRequestFailure,
} from '../../utils/menu-order-customer-recovery'
import { useMenuOrderCustomerRecovery } from './useMenuOrderCustomerRecovery'
import {
  useMenuOrderTrackingSession,
  type MenuOrderTrackingStatus,
} from './useMenuOrderTrackingSession'

export type MenuOrderLifecycleStatus = MenuOrderTrackingStatus
type UseMenuOrderLifecycleOptions = {
  fulfilmentLabel: (order: CustomerOrderSummary) => string
  kitchenServiceId: MaybeRefOrGetter<string>
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  orderType: KitchenOrderType
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuOrderLifecycleInput = {
  body: Record<string, unknown>
  fulfilmentLabel: string
  paymentLabel: string
}

const text = (value: unknown) => String(value ?? '').trim()
const visibleStatusFailureThreshold = 3

// Surface wrappers own request details; this seam owns submission, tracking, recovery, and customer response.
export function useMenuOrderLifecycle(options: UseMenuOrderLifecycleOptions) {
  const { currentUser, hasAuthState } = useAuth()
  const route = useRoute()
  const tracking = useMenuOrderTrackingSession({
    orderType: options.orderType,
    kitchenServiceId: options.kitchenServiceId,
    scopeKey: options.scopeKey,
  })
  const mounted = ref(false)
  let generation = 0
  const pending = ref(false)
  const statusPending = ref(false)
  const responsePending = ref(false)
  const error = ref('')
  const responseError = ref('')
  const statusError = ref('')
  let consecutiveStatusFailures = 0
  let requestKey = ''
  let requestSignature = ''
  const customerRecovery = useMenuOrderCustomerRecovery({
    currentUser: () => currentUser.value,
    requestedOrderId: () => text(route.query.order),
    fulfilmentLabel: options.fulfilmentLabel,
    kitchenId: options.kitchenId,
    orderType: options.orderType,
    kitchenServiceId: options.kitchenServiceId,
    refreshStatus,
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
  const endpoint = computed(() =>
    endpointBase.value ? `${endpointBase.value}${querySuffix.value}` : ''
  )
  const statusEndpoint = computed(() => orderEndpoint(''))
  const liveStatus = useLiveAsyncData<MenuOrderLifecycleStatus | null>(
    computed(
      () =>
        `menu-order:${text(toValue(options.scopeKey))}:${statusEndpoint.value}:${currentUser.value?.uid || ''}`
    ),
    async (liveFetch) => {
      if (!statusEndpoint.value) return null
      return liveFetch<MenuOrderLifecycleStatus>(statusEndpoint.value, {
        headers: await accessHeaders(),
      })
    },
    { server: false, watch: [tracking.capabilityToken] }
  )
  watch(liveStatus.data, (next) => {
    if (
      !next ||
      next.id !== tracking.sentOrder.value?.id ||
      next.order_type !== options.orderType ||
      next.kitchen_service_id !== text(toValue(options.kitchenServiceId))
    )
      return
    tracking.status.value = next
    tracking.save()
    statusError.value = ''
  })
  watch(liveStatus.error, (failure) => {
    if (failure)
      statusError.value = 'Live order updates are temporarily unavailable.'
  })
  const customerResponseEndpoint = computed(() =>
    orderEndpoint('/customer-response')
  )
  const customerName = computed(() => {
    const displayName = text(currentUser.value?.displayName)
    return displayName || text(currentUser.value?.email).split('@')[0] || ''
  })
  function accessHeaders() {
    return menuOrderAccessHeaders(
      currentUser.value,
      tracking.capabilityToken.value
    )
  }

  function orderEndpoint(suffix: string) {
    const orderId = text(tracking.sentOrder.value?.id)
    return endpointBase.value && orderId
      ? `${endpointBase.value}/${encodeURIComponent(orderId)}${suffix}${querySuffix.value}`
      : ''
  }

  function captureScope() {
    const expectedGeneration = generation
    const scope = text(toValue(options.scopeKey))
    const userId = currentUser.value?.uid
    const serviceId = text(toValue(options.kitchenServiceId))
    return () =>
      mounted.value &&
      expectedGeneration === generation &&
      scope === text(toValue(options.scopeKey)) &&
      userId === currentUser.value?.uid &&
      serviceId === text(toValue(options.kitchenServiceId))
  }

  async function submit(input: SubmitMenuOrderLifecycleInput) {
    if (pending.value || !endpoint.value) return null
    const isCurrent = captureScope()
    error.value = ''
    const kitchenServiceId = text(toValue(options.kitchenServiceId))
    if (!kitchenServiceId) {
      error.value = 'Choose a Kitchen service.'
      return null
    }
    const requestBody = { ...input.body, kitchen_service_id: kitchenServiceId }
    const signature = JSON.stringify(requestBody)
    if (!requestKey || requestSignature !== signature) {
      requestKey = createMenuOrderRequestKey(options.orderType)
      requestSignature = signature
    }

    const requestEndpoint = endpoint.value
    const body = { ...requestBody, idempotency_key: requestKey }
    pending.value = true
    try {
      const headers = await menuOrderAccessHeaders(currentUser.value, '')
      if (!isCurrent()) return null
      const created = await $fetch<CreatedMenuOrder>(requestEndpoint, {
        method: 'POST',
        headers,
        body,
      })
      if (!isCurrent()) return null
      if (
        created.order_type !== options.orderType ||
        created.kitchen_service_id !== kitchenServiceId
      ) {
        throw new Error('The Kitchen returned an invalid order type.')
      }

      tracking.trackCreated(created)
      tracking.fulfilmentLabel.value = input.fulfilmentLabel
      tracking.paymentLabel.value =
        created.payment?.flow === 'confirmation_first'
          ? 'Choose after Kitchen confirmation'
          : input.paymentLabel
      tracking.status.value = createdMenuOrderTrackingStatus(created)
      tracking.save()
      if (
        created.payment?.flow !== 'confirmation_first' &&
        created.payment?.required &&
        created.payment.status !== 'paid'
      ) {
        await startCheckout(created.id)
      }
      if (!isCurrent()) return null
      void refreshStatus()
      return created
    } catch (caught) {
      if (!isCurrent()) return null
      error.value = customerOrderRequestError(
        caught,
        'Order could not be sent.'
      )
      return null
    } finally {
      if (isCurrent()) pending.value = false
    }
  }

  async function choosePayment(method: string) {
    if (responsePending.value || !tracking.sentOrder.value) return
    const isCurrent = captureScope()
    responsePending.value = true
    responseError.value = ''
    const orderId = tracking.sentOrder.value.id
    const requestEndpoint = orderEndpoint('/payment-choice')
    try {
      const headers = await accessHeaders()
      if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return
      const response = await $fetch<{ payment: { required: boolean } }>(
        requestEndpoint,
        { method: 'POST', headers, body: { method } }
      )
      if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return
      await refreshStatus()
      if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return
      if (response.payment.required)
        await startCheckout(orderId)
    } catch (caught) {
      if (isCurrent())
        responseError.value = customerOrderRequestError(
          caught,
          'Payment choice could not be saved. You can retry.'
        )
    } finally {
      if (isCurrent()) responsePending.value = false
    }
  }

  async function startCheckout(orderId: string) {
    const isCurrent = captureScope()
    if (!endpointBase.value || !text(orderId)) {
      throw new Error('Payment checkout could not be started.')
    }
    const requestEndpoint = `${endpointBase.value}/${encodeURIComponent(orderId)}/checkout-session${querySuffix.value}`
    const headers = await accessHeaders()
    if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return
    const response = await $fetch<{ url?: string }>(
      requestEndpoint,
      {
        method: 'POST',
        headers,
      }
    )
    if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return
    const checkoutUrl = text(response?.url)
    if (!checkoutUrl) throw new Error('Payment checkout could not be started.')
    if (import.meta.client) window.location.href = checkoutUrl
  }

  async function refreshStatus() {
    if (!statusEndpoint.value || statusPending.value) return null
    const isCurrent = captureScope()
    statusPending.value = true
    try {
      await liveStatus.refresh()
      if (!isCurrent()) return null
      const next = liveStatus.data.value
      if (!next || liveStatus.error.value)
        throw liveStatus.error.value || new Error('Order status unavailable.')
      if (
        next.id !== tracking.sentOrder.value?.id ||
        next.order_type !== options.orderType ||
        next.kitchen_service_id !== text(toValue(options.kitchenServiceId))
      ) {
        throw new Error('The Kitchen returned an invalid order type.')
      }
      consecutiveStatusFailures = 0
      statusError.value = ''
      tracking.status.value = next
      tracking.save()
      return next
    } catch (caught) {
      if (!isCurrent()) return null
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
      if (isCurrent()) statusPending.value = false
    }
  }

  async function respondToChanges(input: { action: 'amend' | 'cancel' }) {
    if (responsePending.value || !customerResponseEndpoint.value) return null
    const isCurrent = captureScope()
    responseError.value = ''

    responsePending.value = true
    const requestEndpoint = customerResponseEndpoint.value
    const orderId = tracking.sentOrder.value?.id
    try {
      const headers = await accessHeaders()
      if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return null
      const response = await $fetch<{
        ok: boolean
        order: { id: string; status: KitchenOrderStatus }
      }>(requestEndpoint, {
        method: 'POST',
        headers,
        body: { action: input.action },
      })
      if (!isCurrent() || tracking.sentOrder.value?.id !== orderId) return null
      if (!response.ok) throw new Error('The response could not be saved.')
      if (input.action === 'amend')
        amendmentLines.value = createdMenuOrderBasketLines(
          tracking.receiptItems.value
        )
      tracking.acknowledge()
      if (input.action === 'cancel') amendmentLines.value = []
      return response.order
    } catch (caught) {
      if (!isCurrent()) return null
      responseError.value = customerOrderRequestError(
        caught,
        'Your response could not be saved.'
      )
      return null
    } finally {
      if (isCurrent()) responsePending.value = false
    }
  }

  function reset() {
    tracking.acknowledge()
    resetTransientState()
  }

  function resetTransientState() {
    generation += 1
    pending.value = false
    statusPending.value = false
    responsePending.value = false
    error.value = ''
    responseError.value = ''
    statusError.value = ''
    requestKey = ''
    requestSignature = ''
    consecutiveStatusFailures = 0
    customerRecovery.resetTransientState()
  }

  watch(
    [
      mounted,
      () => text(toValue(options.scopeKey)),
      hasAuthState,
      () => currentUser.value?.uid || '',
      () => text(toValue(options.kitchenId)),
      () => text(toValue(options.sourceMenuId)),
      () => text(route.query.order),
      () => text(toValue(options.kitchenServiceId)),
    ],
    ([isMounted, scope, authReady, userId, , , orderId, serviceId], previous) => {
      if (!isMounted) return
      if (
        scope !== previous[1] ||
        userId !== previous[3] ||
        orderId !== previous[6] ||
        serviceId !== previous[7]
      ) {
        tracking.resetMemory()
        resetTransientState()
      }
      // Restore same-device guest tracking while Auth settles, then reconcile once.
      if (authReady || !previous[0] || scope !== previous[1])
        void customerRecovery.restoreOrder()
    },
    { flush: 'post' }
  )
  onMounted(() => {
    mounted.value = true
  })
  onBeforeUnmount(() => {
    mounted.value = false
    resetTransientState()
  })

  return {
    amendmentLines,
    customerName,
    choosePayment,
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
