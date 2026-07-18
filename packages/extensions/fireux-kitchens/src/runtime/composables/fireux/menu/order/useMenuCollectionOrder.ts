import {
  computed,
  onBeforeUnmount,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenOrderStatus } from '../../../../models/kitchen/order.model'
import type { CreatedMenuOrder } from '../../../../models/kitchen/menu/menu-ordering.model'
import type { MenuOrderCollectionTimeSelection } from '../../../../utils/menu-order-collection-time'
import {
  menuOrderPaymentLabel,
  type MenuOrderCheckoutInput,
} from '../../../../utils/menu-order-payment'
import type { MenuOrderBasketLine } from './useMenuOrderBasket'

export type MenuCollectionOrderStatus = {
  id: string
  order_number: string
  status: KitchenOrderStatus
  order_type: 'collection'
  estimated_ready_minutes: number
  estimated_ready_at: string
  kitchen_note?: string
  collection?: {
    mode: 'queue' | 'scheduled'
    requested_for?: string
  }
}

type UseMenuCollectionOrderOptions = {
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  scopeKey: MaybeRefOrGetter<string>
}

type SubmitMenuCollectionOrderInput = MenuOrderCheckoutInput & {
  lines: MenuOrderBasketLine[]
  selection: MenuOrderCollectionTimeSelection
  sourceMenuId: string
}

const text = (value: unknown) => String(value ?? '').trim()
const terminalStatuses = new Set<KitchenOrderStatus>([
  'completed',
  'cancelled',
  'trashed',
])

export function useMenuCollectionOrder(options: UseMenuCollectionOrderOptions) {
  const { currentUser } = useAuth()
  const sentOrder = ref<CreatedMenuOrder | null>(null)
  const status = ref<MenuCollectionOrderStatus | null>(null)
  const pending = ref(false)
  const statusPending = ref(false)
  const error = ref('')
  const statusError = ref('')
  const collectionLabel = ref('')
  const paymentLabel = ref('')
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
      if (created.payment?.required && created.payment.status !== 'paid') {
        await startCheckout(created.id)
      }

      sentOrder.value = created
      collectionLabel.value = input.selection.label
      paymentLabel.value = menuOrderPaymentLabel('collection', input.paymentMethod)
      status.value = createdStatus(created)
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
      return next
    } catch (caught) {
      statusError.value = requestError(caught, 'Order status could not be checked.')
      return null
    } finally {
      statusPending.value = false
    }
  }

  function scheduleStatusRefresh(delay = 2500) {
    stopStatusRefresh()
    if (!import.meta.client || !sentOrder.value) return
    if (status.value && terminalStatuses.has(status.value.status)) return

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
    sentOrder.value = null
    status.value = null
    error.value = ''
    statusError.value = ''
    collectionLabel.value = ''
    paymentLabel.value = ''
    requestKey = ''
    requestSignature = ''
  }

  watch(
    () => text(toValue(options.scopeKey)),
    () => reset()
  )
  onBeforeUnmount(stopStatusRefresh)

  return {
    collectionLabel,
    error,
    paymentLabel,
    pending,
    refreshStatus,
    reset,
    sentOrder,
    status,
    statusError,
    statusPending,
    submit,
  }
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
