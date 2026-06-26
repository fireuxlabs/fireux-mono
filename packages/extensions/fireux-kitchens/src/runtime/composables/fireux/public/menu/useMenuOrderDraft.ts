import {
  computed,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  KitchenOrderCustomer,
  KitchenOrderType,
} from '../../../../models/order.model'
import {
  useMenuOrderCreate,
  type CreatedMenuOrder,
} from './useMenuOrderCreate'
import {
  useMenuOrderStatus,
  type PublicMenuOrderStatus,
} from './useMenuOrderStatus'

type MenuOrderItem = {
  id: string
  name: string
  addOns?: MenuOrderAddOn[]
  lineId?: string
  price?: number
  variant?: MenuOrderVariant
}

type MenuOrderAddOn = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

type MenuOrderVariant = {
  id: string
  label: string
  price?: number
  priceLabel?: string
}

type MenuOrderDraftItem = MenuOrderItem & {
  lineId: string
  quantity: number
  unitPrice: number
}

type MenuOrderDraftOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
  canOrder?: MaybeRefOrGetter<boolean>
  orderType?: MaybeRefOrGetter<KitchenOrderType>
  storageKey?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const normalizeVariant = (value: unknown): MenuOrderVariant | undefined => {
  const source = record(value)
  const id = text(source.id)
  const label = text(source.label)
  const price = numberValue(source.price)
  const priceLabel = text(source.priceLabel || source.price_label)
  if (!id && !label) return undefined

  return {
    id,
    label,
    ...(price ? { price } : {}),
    ...(priceLabel ? { priceLabel } : {}),
  }
}
const normalizeAddOns = (value: unknown): MenuOrderAddOn[] => {
  if (!Array.isArray(value)) return []

  return value
    .map(normalizeVariant)
    .filter((addOn): addOn is MenuOrderAddOn => Boolean(addOn))
}
const isDraftItem = (value: unknown): value is MenuOrderDraftItem => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const item = value as Partial<MenuOrderDraftItem>
  return Boolean(
    text(item.id) &&
    text(item.name) &&
    text(item.lineId || item.id) &&
    Number(item.quantity) > 0
  )
}

export function useMenuOrderDraft(
  menuId: MaybeRefOrGetter<string>,
  options: MenuOrderDraftOptions = {}
) {
  const key = computed(() => text(toValue(options.storageKey)))
  const canOrder = computed(() => toValue(options.canOrder) === true)
  const orderType = computed<KitchenOrderType>(() =>
    toValue(options.orderType) || 'dine_in'
  )
  const draft = ref<Record<string, MenuOrderDraftItem>>({})
  const hasMounted = ref(false)
  const awaitingAcceptance = ref(false)
  const acceptedOrder = ref(false)
  const trackedOrder = ref<CreatedMenuOrder | null>(null)
  const items = computed<MenuOrderDraftItem[]>(() =>
    Object.values(draft.value)
  )
  const quantity = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )
  const quantities = computed(() =>
    items.value.reduce<Record<string, number>>((map, item) => {
      map[item.lineId] = item.quantity
      return map
    }, {})
  )
  const {
    creatingItemId,
    message,
    error,
    createOrder,
  } = useMenuOrderCreate(menuId, {
    kitchenSlug: options.kitchenSlug,
  })
  const {
    status: trackedOrderStatus,
  } = useMenuOrderStatus(
    menuId,
    computed(() => trackedOrder.value?.id || ''),
    {
      kitchenSlug: options.kitchenSlug,
      enabled: computed(() => awaitingAcceptance.value),
    }
  )
  const awaitingMessage = computed(() => {
    const status = trackedOrderStatus.value
    if (!acceptedOrder.value) {
      return message.value || 'The kitchen will confirm your order shortly.'
    }

    const minutes = Number(status?.estimated_ready_minutes || 0)
    if (minutes > 0) {
      return `Accepted. Estimated ready in ${minutes} minutes.`
    }

    return 'Accepted. The kitchen is preparing your order.'
  })

  function restoreDraft(nextKey: string) {
    if (!import.meta.client || !nextKey) return

    try {
      const parsed = JSON.parse(window.localStorage.getItem(nextKey) || '{}')
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

      draft.value = Object.values(parsed)
        .filter(isDraftItem)
        .reduce<Record<string, MenuOrderDraftItem>>((map, item) => {
          const lineId = text(item.lineId || item.id)
          const variant = normalizeVariant(item.variant)

          map[lineId] = {
            id: text(item.id),
            lineId,
            name: text(item.name),
            quantity: Number(item.quantity),
            unitPrice: numberValue(item.unitPrice),
            ...(normalizeAddOns(item.addOns).length
              ? { addOns: normalizeAddOns(item.addOns) }
              : {}),
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
      return
    }

    window.localStorage.setItem(key.value, JSON.stringify(nextDraft))
  }, { deep: true })

  watch(orderType, () => {
    clear()
  })

  function add(item: MenuOrderItem) {
    if (!canOrder.value) return
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackedOrder.value = null

    const id = text(item.id)
    const lineId = text(item.lineId) || id
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
      addOns.length
        ? `+ ${addOns.map((addOn) => addOn.label).join(', ')}`
        : '',
    ].filter(Boolean).join(' · ')
    draft.value = {
      ...draft.value,
      [lineId]: {
        id,
        lineId,
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
    if (current.quantity <= 1) {
      delete next[lineId]
    } else {
      next[lineId] = {
        ...current,
        quantity: current.quantity - 1,
      }
    }
    draft.value = next
  }

  function clear() {
    draft.value = {}
    awaitingAcceptance.value = false
    acceptedOrder.value = false
    trackedOrder.value = null
  }

  async function place(customer?: KitchenOrderCustomer) {
    if (!canOrder.value || !items.value.length) return

    const created = await createOrder({
      items: items.value.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        ...(item.addOns?.length ? { addOns: item.addOns } : {}),
        ...(item.variant ? { variant: item.variant } : {}),
      })),
      order_type: orderType.value,
      customer,
    })
    if (!created) return

    const isWaitingForAcceptance = created.status === 'pending_acceptance'
    const nextAwaitingAcceptance =
      isWaitingForAcceptance && orderType.value === 'delivery'
    draft.value = {}
    trackedOrder.value = created
    acceptedOrder.value = false
    awaitingAcceptance.value = nextAwaitingAcceptance
  }

  watch(trackedOrderStatus, (status: PublicMenuOrderStatus | null) => {
    if (!status || !awaitingAcceptance.value) return
    if (status.status === 'pending_acceptance') return

    acceptedOrder.value = true
  })

  return {
    awaitingAcceptance,
    acceptedOrder,
    awaitingMessage,
    items,
    quantity,
    quantities,
    creatingItemId,
    message,
    error,
    add,
    remove,
    clear,
    place,
  }
}
