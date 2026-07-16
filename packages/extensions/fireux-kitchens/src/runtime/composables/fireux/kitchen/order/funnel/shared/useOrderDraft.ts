import {
  computed,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  CreatedMenuOrder,
  MenuOrderingPayment,
  MenuOrderingSubmitPayload,
} from '../../../../../../models/kitchen/menu/menu-ordering.model'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import { notifyOrderSessionChanged } from './useOrderSession'
import { useOrderCreate } from './useOrderCreate'
import { useOrderStatus } from './useOrderStatus'
import {
  isDraftItem,
  isTerminalOrderStatus,
  normalizeAddOns,
  normalizeVariant,
  numberValue,
  text,
} from './order-input'
import type {
  KitchenOrderFunnelStatus,
  MenuOrderDraftItem,
  MenuOrderDraftOptions,
  MenuOrderItem,
} from './types'

export function useOrderDraft(
  menuId: MaybeRefOrGetter<string>,
  options: MenuOrderDraftOptions = {}
) {
  const key = computed(() => text(toValue(options.storageKey)))
  const canOrder = computed(() => toValue(options.canOrder) === true)
  const orderType = computed<KitchenOrderType>(() =>
    toValue(options.orderType) || 'dine_in'
  )
  const sourceMenuId = computed(() => text(toValue(options.sourceMenuId)))
  const draft = ref<Record<string, MenuOrderDraftItem>>({})
  const hasMounted = ref(false)
  const awaitingAcceptance = ref(false)
  const acceptedOrder = ref(false)
  const trackingOrderStatus = ref(false)
  const trackedOrder = ref<CreatedMenuOrder | null>(null)
  const items = computed<MenuOrderDraftItem[]>(() => Object.values(draft.value))
  const quantity = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  const {
    checkoutError,
    checkoutMessage,
    checkoutPending,
    createCheckoutSession,
    createOrder,
    creatingItemId,
    error,
    message,
  } = useOrderCreate(menuId, {
    kitchenSlug: options.kitchenSlug,
  })
  const {
    error: trackedOrderStatusError,
    status: trackedOrderStatus,
  } = useOrderStatus(
    menuId,
    computed(() => trackedOrder.value?.id || ''),
    {
      kitchenSlug: options.kitchenSlug,
      enabled: computed(() => trackingOrderStatus.value),
    }
  )
  const awaitingMessage = computed(() => {
    const status = trackedOrderStatus.value
    if (!trackedOrder.value) return ''
    if (trackedOrderStatusError.value) return trackedOrderStatusError.value

    const currentStatus = status?.status || trackedOrder.value.status
    if (currentStatus === 'pending_payment') {
      return 'Payment is required before the kitchen can process this order.'
    }
    if (currentStatus === 'pending_acceptance') {
      return message.value || 'Waiting for the kitchen to accept your order.'
    }
    if (currentStatus === 'ready') return 'Your order is ready.'
    if (currentStatus === 'completed') return 'Your order is complete.'
    if (currentStatus === 'cancelled') {
      return 'The kitchen could not accept this order.'
    }
    if (currentStatus === 'trashed') return 'Order status is no longer available.'

    const minutes = Number(status?.estimated_ready_minutes || 0)
    if (currentStatus === 'accepted') {
      return minutes > 0
        ? `Accepted. Estimated ready in ${minutes} minutes.`
        : 'Accepted. The kitchen is preparing your order.'
    }

    return message.value
  })
  const payment = computed<MenuOrderingPayment>(() => ({
    pending: checkoutPending.value,
    ...(checkoutMessage.value ? { message: checkoutMessage.value } : {}),
    ...(checkoutError.value ? { error: checkoutError.value } : {}),
  }))

  function restoreDraft(nextKey: string) {
    if (!import.meta.client || !nextKey) return

    try {
      const parsed = JSON.parse(window.localStorage.getItem(nextKey) || '{}')
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

      draft.value = Object.values(parsed)
        .filter(isDraftItem)
        .reduce<Record<string, MenuOrderDraftItem>>((map, item) => {
          const lineId = text(item.lineId || item.id)
          const menuId = text(item.menuId) || sourceMenuId.value
          const variant = normalizeVariant(item.variant)
          const addOns = normalizeAddOns(item.addOns)

          map[lineId] = {
            id: text(item.id),
            lineId,
            ...(menuId ? { menuId } : {}),
            name: text(item.name),
            quantity: Number(item.quantity),
            unitPrice: numberValue(item.unitPrice),
            ...(addOns.length ? { addOns } : {}),
            ...(variant ? { variant } : {}),
          }
          return map
        }, {})
    } catch {
      draft.value = {}
    }
  }

  onMounted(() => {
    hasMounted.value = true
    restoreDraft(key.value)
  })

  watch(key, (nextKey: string) => {
    if (!hasMounted.value) return
    restoreDraft(nextKey)
  })

  watch(draft, (nextDraft: Record<string, MenuOrderDraftItem>) => {
    if (!import.meta.client || !key.value) return

    if (!Object.keys(nextDraft).length) {
      window.localStorage.removeItem(key.value)
      notifyOrderSessionChanged()
      return
    }

    window.localStorage.setItem(key.value, JSON.stringify(nextDraft))
    notifyOrderSessionChanged()
  }, { deep: true })

  function add(item: MenuOrderItem) {
    if (!canOrder.value) return
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackingOrderStatus.value = false
    trackedOrder.value = null

    const id = text(item.id)
    const menuId = text(item.menuId) || sourceMenuId.value
    const rawLineId = text(item.lineId) || id
    const lineId = [menuId, rawLineId].filter(Boolean).join(':')
    if (!id) return

    const variant = normalizeVariant(item.variant)
    const addOns = normalizeAddOns(item.addOns)
    const current = draft.value[lineId]
    const addOnsPrice = addOns.reduce(
      (total, addOn) => total + numberValue(addOn.price),
      0
    )
    const basePrice = numberValue(variant?.price) || numberValue(item.price)
    const unitPrice = basePrice + addOnsPrice
    const suffix = [
      variant?.label,
      addOns.length ? `+ ${addOns.map((addOn) => addOn.label).join(', ')}` : '',
    ].filter(Boolean).join(' · ')
    draft.value = {
      ...draft.value,
      [lineId]: {
        id,
        lineId,
        ...(menuId ? { menuId } : {}),
        name: suffix ? `${text(item.name)} · ${suffix}` : text(item.name),
        unitPrice,
        ...(addOns.length ? { addOns } : {}),
        ...(variant ? { variant } : {}),
        quantity: (current?.quantity || 0) + 1,
      },
    }
  }

  function remove(item: MenuOrderItem) {
    const lineId = text(item.lineId) || text(item.id)
    const current = draft.value[lineId]
    if (!lineId || !current) return

    const next = { ...draft.value }
    if (current.quantity <= 1) delete next[lineId]
    else next[lineId] = { ...current, quantity: current.quantity - 1 }
    draft.value = next
  }

  function clear() {
    draft.value = {}
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackingOrderStatus.value = false
    trackedOrder.value = null
  }

  async function place(input?: MenuOrderingSubmitPayload) {
    if (!canOrder.value || !items.value.length) return null
    if (!input?.channel) throw new Error('Order channel is required.')

    const created = await createOrder({
      items: items.value.map((item) => ({
        itemId: item.id,
        ...(item.menuId ? { menuId: item.menuId } : {}),
        quantity: item.quantity,
        ...(item.addOns?.length ? { addOns: item.addOns } : {}),
        ...(item.variant ? { variant: item.variant } : {}),
      })),
      channel: input.channel,
      order_type: orderType.value,
      collection: input?.collection,
      payment_method: input?.payment_method,
      requested_for: input?.requested_for,
      room_service: input?.room_service,
      table: input?.table,
      customer: input?.customer,
    })
    if (!created) return null

    trackedOrder.value = created
    awaitingAcceptance.value = created.status === 'pending_acceptance'
    acceptedOrder.value = ['accepted', 'ready', 'completed'].includes(created.status)
    trackingOrderStatus.value = !isTerminalOrderStatus(created.status)

    return created
  }

  async function pay() {
    const orderId = text(trackedOrder.value?.id)
    if (orderId) await createCheckoutSession(orderId)
  }

  watch(trackedOrderStatus, (status: KitchenOrderFunnelStatus | null) => {
    if (!status || !trackedOrder.value) return

    awaitingAcceptance.value = status.status === 'pending_acceptance'
    acceptedOrder.value = ['accepted', 'ready', 'completed'].includes(status.status)
    if (isTerminalOrderStatus(status.status)) trackingOrderStatus.value = false
  })

  return {
    acceptedOrder,
    add,
    awaitingAcceptance,
    awaitingMessage,
    clear,
    creatingItemId,
    error,
    items,
    message,
    pay,
    payment,
    place,
    quantity,
    remove,
    sentOrder: trackedOrder,
    trackedStatus: trackedOrderStatus,
  }
}
