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
import type { KitchenOrderStatus } from '../../../../models/kitchen/order.model'
import type { CreatedMenuOrder } from '../../../../models/kitchen/menu/menu-ordering.model'
import type {
  CustomerOrderPage,
  CustomerOrderSummary,
} from '../../../../models/customer/order.model'
import type { MenuOrderCollectionTimeSelection } from '../../../../utils/menu-order-collection-time'
import {
  menuOrderPaymentLabel,
  type MenuOrderCheckoutInput,
} from '../../../../utils/menu-order-payment'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'
import {
  useMenuOrderTrackingSession,
  type MenuOrderTrackingStatus,
} from './useMenuOrderTrackingSession'

export type MenuCollectionOrderStatus = MenuOrderTrackingStatus & {
  order_type: 'collection'
}

type UseMenuCollectionOrderOptions = {
  kitchenId: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
  sourceMenuId: MaybeRefOrGetter<string>
}

type SubmitMenuCollectionOrderInput = MenuOrderCheckoutInput & {
  lines: MenuOrderBasketLine[]
  selection: MenuOrderCollectionTimeSelection
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()
const pausedTrackingStatuses = new Set<KitchenOrderStatus>([
  'changes_requested',
  'completed',
  'cancelled',
  'trashed',
])

export function useMenuCollectionOrder(options: UseMenuCollectionOrderOptions) {
  const { currentUser, hasAuthState } = useAuth()
  const tracking = useMenuOrderTrackingSession<MenuCollectionOrderStatus>({
    orderType: 'collection',
    scopeKey: options.scopeKey,
  })
  const {
    fulfilmentLabel: collectionLabel,
    paymentLabel,
    sentOrder,
    status,
  } = tracking
  const pending = ref(false)
  const statusPending = ref(false)
  const responsePending = ref(false)
  const error = ref('')
  const responseError = ref('')
  const statusError = ref('')
  const recovery = ref<Record<string, unknown>>({ phase: 'idle' })
  const amendmentLines = ref<MenuOrderBasketLine[]>([])
  let statusTimer: ReturnType<typeof setTimeout> | undefined
  let requestKey = ''
  let requestSignature = ''

  const endpointBase = computed(() => {
    const menuId = text(toValue(options.menuId))
    if (!menuId) return ''

    return `/api/menus/${encodeURIComponent(menuId)}/orders`
  })
  const querySuffix = computed(() => {
    const query = new URLSearchParams()
    const kitchenSlug = text(toValue(options.kitchenSlug))
    if (kitchenSlug) query.set('kitchenSlug', kitchenSlug)

    const suffix = query.toString()
    return suffix ? `?${suffix}` : ''
  })
  const endpoint = computed(() => {
    if (!endpointBase.value) return ''

    return `${endpointBase.value}${querySuffix.value}`
  })
  const statusEndpoint = computed(() => {
    const orderId = text(sentOrder.value?.id)

    return endpointBase.value && orderId
      ? `${endpointBase.value}/${encodeURIComponent(orderId)}${querySuffix.value}`
      : ''
  })
  const customerResponseEndpoint = computed(() => {
    const orderId = text(sentOrder.value?.id)

    return endpointBase.value && orderId
      ? `${endpointBase.value}/${encodeURIComponent(orderId)}/customer-response${querySuffix.value}`
      : ''
  })
  const customerName = computed(() => {
    const user = currentUser.value
    const displayName = text(user?.displayName)
    if (displayName) return displayName

    return text(user?.email).split('@')[0] || ''
  })

  async function submit(input: SubmitMenuCollectionOrderInput) {
    if (pending.value || !endpoint.value) return null
    error.value = ''

    const body = buildBody(input)
    const signature = JSON.stringify(body)
    if (!requestKey || requestSignature !== signature) {
      requestKey = createRequestKey()
      requestSignature = signature
    }

    pending.value = true
    try {
      const authToken = await currentUser.value?.getIdToken()
      const created = await $fetch<CreatedMenuOrder>(endpoint.value, {
        method: 'POST',
        ...(authToken
          ? { headers: { Authorization: `Bearer ${authToken}` } }
          : {}),
        body: {
          ...body,
          idempotency_key: requestKey,
        },
      })
      if (created.order_type !== 'collection') {
        throw new Error('The Kitchen returned an invalid Collection order.')
      }
      sentOrder.value = created
      collectionLabel.value = input.selection.label
      paymentLabel.value = menuOrderPaymentLabel('collection', input.paymentMethod)
      status.value = createdStatus(created)
      tracking.save()
      if (created.payment?.required && created.payment.status !== 'paid') {
        await startCheckout(created.id)
      }
      scheduleStatusRefresh(0)
      return created
    } catch (caught) {
      error.value = requestError(caught, 'Order could not be sent.')
      return null
    } finally {
      pending.value = false
    }
  }

  async function startCheckout(orderId: string) {
    const orderPath = text(orderId)
    if (!endpointBase.value || !orderPath) {
      throw new Error('Payment checkout could not be started.')
    }

    const response = await $fetch<{ url?: string }>(
      `${endpointBase.value}/${encodeURIComponent(orderPath)}/checkout-session${querySuffix.value}`,
      { method: 'POST' }
    )
    const checkoutUrl = text(response?.url)
    if (!checkoutUrl) throw new Error('Payment checkout could not be started.')
    if (import.meta.client) window.location.href = checkoutUrl
  }

  async function refreshStatus() {
    if (!statusEndpoint.value || statusPending.value) return null
    statusPending.value = true
    statusError.value = ''
    try {
      const next = await $fetch<MenuCollectionOrderStatus>(statusEndpoint.value)
      if (next.order_type !== 'collection') {
        throw new Error('The Kitchen returned an invalid Collection order.')
      }
      status.value = next
      tracking.save()
      return next
    } catch (caught) {
      statusError.value = requestError(caught, 'Order status could not be checked.')
      return null
    } finally {
      statusPending.value = false
    }
  }

  async function respondToChanges(input: {
    action: 'cancel' | 'reschedule'
    selection?: MenuOrderCollectionTimeSelection
  }) {
    if (responsePending.value || !customerResponseEndpoint.value) return null
    responseError.value = ''
    const user = currentUser.value
    if (!user) {
      responseError.value = 'Sign in to respond to this order.'
      return null
    }

    responsePending.value = true
    try {
      const token = await user.getIdToken()
      const response = await $fetch<{
        ok: boolean
        order: { id: string, status: KitchenOrderStatus }
      }>(customerResponseEndpoint.value, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          action: input.action,
          ...(input.action === 'reschedule' && input.selection
            ? {
                collection: {
                  mode: input.selection.mode,
                  ...(input.selection.requestedFor
                    ? { requested_for: input.selection.requestedFor }
                    : {}),
                },
              }
            : {}),
        },
      })
      if (!response.ok) throw new Error('The response could not be saved.')

      if (input.action === 'cancel') {
        tracking.acknowledge()
        amendmentLines.value = []
      } else {
        collectionLabel.value = input.selection?.label || collectionLabel.value
        status.value = status.value
          ? {
              ...status.value,
              status: 'pending_acceptance',
              kitchen_note: '',
              ...(input.selection
                ? {
                    collection: {
                      mode: input.selection.mode,
                      ...(input.selection.requestedFor
                        ? { requested_for: input.selection.requestedFor }
                        : {}),
                    },
                  }
                : {}),
            }
          : status.value
        tracking.save()
        scheduleStatusRefresh(0)
      }

      return response.order
    } catch (caught) {
      responseError.value = requestError(
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
    if (!import.meta.client || !sentOrder.value) return
    if (status.value && pausedTrackingStatuses.has(status.value.status)) return

    statusTimer = setTimeout(async () => {
      await refreshStatus()
      scheduleStatusRefresh()
    }, delay)
  }

  function stopStatusRefresh() {
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = undefined
  }

  function reset() {
    stopStatusRefresh()
    tracking.acknowledge()
    resetTransientState()
  }

  async function restoreOrder() {
    const expectedScope = text(toValue(options.scopeKey))
    const restoredLocally = tracking.restore()
    if (restoredLocally) {
      recovery.value = {
        phase: 'local-tracker',
        order_id: sentOrder.value?.id || '',
        waiting_for: orderWaitingFor(
          status.value?.status || sentOrder.value?.status
        ),
      }
      scheduleStatusRefresh(0)
    }

    const user = currentUser.value
    const expectedUserId = user?.uid || ''
    const kitchenId = text(toValue(options.kitchenId))
    const sourceMenuId = text(toValue(options.sourceMenuId))
    recovery.value = {
      phase: user
        ? 'resolving-customer-order'
        : hasAuthState.value
          ? 'guest-session'
          : 'checking-customer-session',
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

      const trackedOrderId = text(sentOrder.value?.id)
      const trackedCandidate = trackedOrderId
        ? page.items.find(order => order.id === trackedOrderId)
        : undefined
      const matchingOrders = page.items.filter(order =>
        order.order_type === 'collection' &&
        order.kitchen.id === kitchenId &&
        order.menu.id === sourceMenuId &&
        !tracking.isAcknowledged(order.id)
      )
      const recoveryCandidate = trackedOrderId
        ? trackedCandidate
        : matchingOrders[0]
      const recovered = recoveryCandidate &&
        !['completed', 'cancelled', 'trashed'].includes(recoveryCandidate.status)
        ? recoveryCandidate
        : undefined
      recovery.value = {
        phase: recovered ? 'customer-order' : 'no-match',
        signed_in: true,
        kitchen_id: kitchenId,
        source_menu_id: sourceMenuId,
        order_count: page.items.length,
        candidates: page.items.map(order => ({
          id: order.id,
          kitchen_id: order.kitchen.id,
          menu_id: order.menu.id,
          order_type: order.order_type,
          status: order.status,
          acknowledged: tracking.isAcknowledged(order.id),
        })),
        recovered_order_id: recovered?.id || '',
        waiting_for: orderWaitingFor(recovered?.status),
      }
      if (!recovered) {
        // 2026-07-19 15:43 CEST: The signed-in customer projection is canonical; retire stale local tracking after a terminal Order instead of pinning its old funnel state.
        if (
          trackedCandidate &&
          ['completed', 'cancelled', 'trashed'].includes(trackedCandidate.status)
        ) {
          tracking.acknowledge()
          amendmentLines.value = []
        } else if (
          trackedOrderId &&
          (status.value?.status || sentOrder.value?.status) === 'changes_requested'
        ) {
          tracking.clear()
          amendmentLines.value = []
        }
        return
      }

      restoreCustomerOrder(recovered)
      tracking.save()
      scheduleStatusRefresh(0)
    } catch (caught) {
      recovery.value = {
        phase: 'customer-order-error',
        signed_in: true,
        waiting_for: 'customer',
        error: requestError(caught, 'Customer order recovery failed.'),
      }
      // The public funnel remains usable when signed-in history recovery is unavailable.
    }
  }

  function restoreCustomerOrder(order: CustomerOrderSummary) {
    sentOrder.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      order_type: 'collection',
      channel: 'menu',
      ...(order.collection ? { collection: order.collection } : {}),
    }
    status.value = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      order_type: 'collection',
      estimated_ready_minutes: order.estimated_ready_minutes,
      estimated_ready_at: order.estimated_ready_at,
      ...(order.kitchen_note ? { kitchen_note: order.kitchen_note } : {}),
      ...(order.collection ? { collection: order.collection } : {}),
    }
    collectionLabel.value = recoveredCollectionLabel(order)
    paymentLabel.value = order.payment?.method
      ? menuOrderPaymentLabel('collection', order.payment.method)
      : ''
    amendmentLines.value = recoveredBasketLines(order)
  }

  function resetTransientState() {
    error.value = ''
    responseError.value = ''
    statusError.value = ''
    requestKey = ''
    requestSignature = ''
    amendmentLines.value = []
  }

  watch(
    () => text(toValue(options.scopeKey)),
    () => {
      stopStatusRefresh()
      resetTransientState()
      void restoreOrder()
    }
  )
  watch(currentUser, (user) => {
    if (user) void restoreOrder()
  })
  watch(hasAuthState, (resolved) => {
    if (resolved && !sentOrder.value) void restoreOrder()
  })
  onMounted(() => {
    void restoreOrder()
  })
  onBeforeUnmount(stopStatusRefresh)

  return {
    amendmentLines,
    collectionLabel,
    customerName,
    error,
    paymentLabel,
    pending,
    recovery,
    respondToChanges,
    responseError,
    responsePending,
    refreshStatus,
    reset,
    sentOrder,
    status,
    statusError,
    statusPending,
    submit,
  }
}

function recoveredCollectionLabel(order: CustomerOrderSummary) {
  if (order.collection?.mode === 'queue') return 'As soon as possible'

  const value = text(order.collection?.requested_for)
  if (!value) return 'Scheduled collection'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Scheduled collection'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function recoveredBasketLines(order: CustomerOrderSummary): MenuOrderBasketLine[] {
  return order.items.map((item, index) => {
    const addOns = item.add_ons.map((addOn) => ({
      ...addOn,
      priceLabel: '',
    }))
    const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
    const variant = item.variant
      ? {
          ...item.variant,
          price: Math.max(0, item.unit_price - addOnTotal),
          priceLabel: '',
        }
      : null
    const configurationKey = JSON.stringify([
      item.menu_id,
      item.id,
      variant?.id || 'base',
      ...addOns.map(addOn => addOn.id),
    ])

    return {
      id: `${configurationKey}:${index + 1}`,
      configurationKey,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      variant,
      addOns,
    }
  })
}

function orderWaitingFor(status: KitchenOrderStatus | undefined) {
  if (status === 'pending_acceptance' || status === 'accepted') return 'kitchen'
  if (
    status === 'changes_requested' ||
    status === 'pending_payment' ||
    status === 'ready' ||
    status === 'cancelled' ||
    status === 'completed'
  ) return 'customer'

  return ''
}

function buildBody(input: SubmitMenuCollectionOrderInput) {
  const name = text(input.name)
  const phone = text(input.phone)
  const email = text(input.email)
  const sourceMenuId = text(input.sourceMenuId)
  if (!sourceMenuId || !input.lines.length) throw new Error('The basket is empty.')

  const collection = {
    mode: input.selection.mode,
    ...(input.selection.requestedFor
      ? { requested_for: input.selection.requestedFor }
      : {}),
  }

  return {
    channel: 'menu' as const,
    order_type: 'collection' as const,
    items: input.lines.map(line => ({
      item_id: line.itemId,
      menu_id: sourceMenuId,
      quantity: line.quantity,
      ...(line.variant
        ? { variant: { id: line.variant.id, label: line.variant.label } }
        : {}),
      ...(line.addOns.length
        ? {
            add_ons: line.addOns.map(addOn => ({
              id: addOn.id,
              label: addOn.label,
            })),
          }
        : {}),
    })),
    collection,
    ...(input.selection.requestedFor
      ? { requested_for: input.selection.requestedFor }
      : {}),
    payment_method: input.paymentMethod,
    ...(name || phone || email ? { customer: { name, phone, email } } : {}),
  }
}

function createRequestKey() {
  if (import.meta.client && typeof crypto.randomUUID === 'function') {
    return `collection-${crypto.randomUUID()}`
  }

  return `collection-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function requestError(caught: unknown, fallback: string) {
  if (caught && typeof caught === 'object') {
    const source = caught as {
      data?: { statusMessage?: unknown }
      message?: unknown
      statusMessage?: unknown
    }
    return text(source.data?.statusMessage) ||
      text(source.statusMessage) ||
      text(source.message) ||
      fallback
  }

  return fallback
}

function createdStatus(order: CreatedMenuOrder): MenuCollectionOrderStatus {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    order_type: 'collection',
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    ...(order.collection ? { collection: order.collection } : {}),
  }
}
