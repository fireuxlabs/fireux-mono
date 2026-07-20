import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import {
  isKitchenOrderStatus,
  isKitchenOrderType,
  type KitchenOrderChannel,
  type KitchenOrderStatus,
  type KitchenOrderType,
} from '../../../../models/kitchen/order.model'
import type {
  CreatedMenuOrder,
  CreatedMenuOrderReceiptLine,
} from '../../../../models/kitchen/menu/menu-ordering.model'
import { readMenuOrderCapabilityToken } from '../../../../utils/menu-order-capability'

// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: retain the opaque same-device token in canonical local tracking only.
// Concurrent edit — 2026-07-20 16:36 CEST — Menu Order recovery pass: never turn a successful Order POST into a failed submission when browser storage is unavailable.

export type MenuOrderTrackingStatus = {
  id: string
  order_number: string
  status: KitchenOrderStatus
  order_type: KitchenOrderType
  estimated_ready_minutes: number
  estimated_ready_at: string
  kitchen_note?: string
  collection?: {
    mode: 'queue' | 'scheduled'
    requested_for?: string
  }
}

type UseMenuOrderTrackingSessionOptions = {
  orderType: KitchenOrderType
  scopeKey: MaybeRefOrGetter<string>
}

export type MenuOrderTrackingSession<
  TStatus extends MenuOrderTrackingStatus = MenuOrderTrackingStatus,
> = {
  acknowledge: () => void
  capabilityToken: Ref<string>
  clear: () => void
  fulfilmentLabel: Ref<string>
  paymentLabel: Ref<string>
  receiptItems: Ref<CreatedMenuOrderReceiptLine[]>
  resetMemory: () => void
  restore: () => boolean
  isAcknowledged: (orderId: unknown) => boolean
  save: () => boolean
  sentOrder: Ref<CreatedMenuOrder | null>
  status: Ref<TStatus | null>
  trackCreated: (order: CreatedMenuOrder) => void
}

type StoredMenuOrderTrackingSession = {
  version: 1
  capability_token: string
  order: CreatedMenuOrder
  receipt_items: CreatedMenuOrderReceiptLine[]
  status: MenuOrderTrackingStatus | null
  fulfilment_label: string
  payment_label: string
  updated_at: string
}

const storagePrefix = 'fireux:menu-order-tracking:'
const acknowledgementPrefix = 'fireux:menu-order-acknowledged:'
const channels = new Set<KitchenOrderChannel>([
  'menu',
  'table_qr',
  'kiosk',
  'room_service',
  'staff_pos',
])
const text = (value: unknown) => String(value ?? '').trim()

// 2026-07-19 15:03 CEST: This is the canonical Menu/Order tracking seam; surface funnels must not create parallel browser-session implementations.
export function useMenuOrderTrackingSession<
  TStatus extends MenuOrderTrackingStatus = MenuOrderTrackingStatus,
>(
  options: UseMenuOrderTrackingSessionOptions
): MenuOrderTrackingSession<TStatus> {
  const sentOrder = ref<CreatedMenuOrder | null>(null)
  const capabilityToken = ref('')
  const status = ref<TStatus | null>(null)
  const fulfilmentLabel = ref('')
  const paymentLabel = ref('')
  const receiptItems = ref<CreatedMenuOrderReceiptLine[]>([])
  const storageKey = computed(() => {
    const scope = text(toValue(options.scopeKey))

    return scope
      ? `${storagePrefix}${encodeURIComponent(scope)}`
      : ''
  })

  function restore() {
    resetMemory()
    if (!import.meta.client || !storageKey.value) return false

    try {
      const stored = readStoredSession(
        JSON.parse(readStoredValue(storageKey.value) || 'null'),
        options.orderType
      )
      if (!stored) return false

      sentOrder.value = stored.order
      capabilityToken.value = stored.capability_token
      status.value = stored.status as TStatus | null
      fulfilmentLabel.value = stored.fulfilment_label
      paymentLabel.value = stored.payment_label
      receiptItems.value = stored.receipt_items
      return true
    } catch {
      removeStoredValue(storageKey.value)
      return false
    }
  }

  function save() {
    if (!import.meta.client || !storageKey.value || !sentOrder.value) return false

    const order = safeCreatedOrder(sentOrder.value, options.orderType)
    if (!order) {
      clear()
      return false
    }

    const nextStatus = status.value
      ? safeTrackingStatus(status.value, options.orderType)
      : null
    const stored: StoredMenuOrderTrackingSession = {
      version: 1,
      capability_token: readMenuOrderCapabilityToken(capabilityToken.value),
      order,
      status: nextStatus,
      fulfilment_label: text(fulfilmentLabel.value),
      payment_label: text(paymentLabel.value),
      receipt_items: safeReceiptItems(receiptItems.value),
      updated_at: new Date().toISOString(),
    }
    return writeStoredValue(storageKey.value, JSON.stringify(stored))
  }

  function clear() {
    if (import.meta.client && storageKey.value) removeStoredValue(storageKey.value)
    resetMemory()
  }

  function acknowledge() {
    const orderId = text(sentOrder.value?.id)
    if (import.meta.client && orderId) {
      writeStoredValue(
        `${acknowledgementPrefix}${encodeURIComponent(orderId)}`,
        new Date().toISOString()
      )
    }
    clear()
  }

  function isAcknowledged(orderId: unknown) {
    const id = text(orderId)
    return Boolean(
      import.meta.client &&
      id &&
      readStoredValue(
        `${acknowledgementPrefix}${encodeURIComponent(id)}`
      )
    )
  }

  function resetMemory() {
    sentOrder.value = null
    capabilityToken.value = ''
    status.value = null
    fulfilmentLabel.value = ''
    paymentLabel.value = ''
    receiptItems.value = []
  }

  function trackCreated(order: CreatedMenuOrder) {
    capabilityToken.value = readMenuOrderCapabilityToken(order.capability_token)
    receiptItems.value = safeReceiptItems(order.receipt?.items)
    sentOrder.value = safeCreatedOrder(order, options.orderType)
  }

  return {
    acknowledge,
    capabilityToken,
    clear,
    fulfilmentLabel,
    paymentLabel,
    receiptItems,
    resetMemory,
    restore,
    isAcknowledged,
    save,
    sentOrder,
    status,
    trackCreated,
  }
}

function readStoredSession(
  value: unknown,
  orderType: KitchenOrderType
): StoredMenuOrderTrackingSession | null {
  const stored = record(value)
  if (stored.version !== 1) return null

  const order = safeCreatedOrder(stored.order, orderType)
  if (!order) return null

  const rawStatus = stored.status
  const status = rawStatus === null || rawStatus === undefined
    ? null
    : safeTrackingStatus(rawStatus, orderType)
  if (rawStatus && !status) return null

  return {
    version: 1,
    capability_token: readMenuOrderCapabilityToken(stored.capability_token),
    order,
    status,
    fulfilment_label: text(stored.fulfilment_label),
    payment_label: text(stored.payment_label),
    receipt_items: safeReceiptItems(stored.receipt_items),
    updated_at: text(stored.updated_at),
  }
}

function safeCreatedOrder(
  value: unknown,
  expectedType: KitchenOrderType
): CreatedMenuOrder | null {
  const order = record(value)
  const id = text(order.id)
  const orderNumber = text(order.order_number)
  const status = order.status
  const orderType = order.order_type
  const channel = text(order.channel)
  if (
    !id ||
    !orderNumber ||
    !isKitchenOrderStatus(status) ||
    !isKitchenOrderType(orderType) ||
    orderType !== expectedType ||
    !channels.has(channel as KitchenOrderChannel)
  ) {
    return null
  }

  const collection = safeCollection(order.collection)
  return {
    id,
    order_number: orderNumber,
    status,
    order_type: orderType,
    channel: channel as KitchenOrderChannel,
    ...(collection ? { collection } : {}),
    ...(text(order.requested_for)
      ? { requested_for: text(order.requested_for) }
      : {}),
  }
}

function safeTrackingStatus(
  value: unknown,
  expectedType: KitchenOrderType
): MenuOrderTrackingStatus | null {
  const status = record(value)
  const id = text(status.id)
  const orderNumber = text(status.order_number)
  const orderType = status.order_type
  if (
    !id ||
    !orderNumber ||
    !isKitchenOrderStatus(status.status) ||
    !isKitchenOrderType(orderType) ||
    orderType !== expectedType
  ) {
    return null
  }

  const collection = safeCollection(status.collection)
  return {
    id,
    order_number: orderNumber,
    status: status.status,
    order_type: orderType,
    estimated_ready_minutes: finiteNumber(status.estimated_ready_minutes),
    estimated_ready_at: text(status.estimated_ready_at),
    ...(text(status.kitchen_note)
      ? { kitchen_note: text(status.kitchen_note) }
      : {}),
    ...(collection ? { collection } : {}),
  }
}

function safeReceiptItems(value: unknown): CreatedMenuOrderReceiptLine[] {
  return (Array.isArray(value) ? value : []).slice(0, 200).flatMap((row) => {
    const item = record(row)
    const id = boundedText(item.id, 256)
    const sourceItemId = boundedText(item.source_item_id, 256)
    const label = boundedText(item.label, 500)
    const menuId = boundedText(item.menu_id, 256)
    const quantity = Number(item.quantity)
    const unitPrice = finiteMoney(item.unit_price_chf)
    const total = finiteMoney(item.total_chf)
    if (
      !id || !label ||
      !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
      unitPrice <= 0 || total <= 0
    ) return []

    const addOns = (Array.isArray(item.add_ons) ? item.add_ons : [])
      .slice(0, 50)
      .flatMap((row) => {
        const addOn = record(row)
        const addOnId = boundedText(addOn.id, 256)
        const addOnLabel = boundedText(addOn.label, 256)
        if (!addOnId || !addOnLabel) return []

        return [{
          id: addOnId,
          label: addOnLabel,
          price: finiteMoney(addOn.price),
        }]
      })

    return [{
      id,
      ...(sourceItemId ? { source_item_id: sourceItemId } : {}),
      ...(menuId ? { menu_id: menuId } : {}),
      label,
      quantity,
      unit_price_chf: unitPrice,
      total_chf: total,
      ...(addOns.length ? { add_ons: addOns } : {}),
      ...(boundedText(item.variant_label, 256)
        ? { variant_label: boundedText(item.variant_label, 256) }
        : {}),
      ...(boundedText(item.variant_id, 256)
        ? { variant_id: boundedText(item.variant_id, 256) }
        : {}),
    }]
  })
}

function safeCollection(value: unknown) {
  const collection = record(value)
  if (collection.mode !== 'queue' && collection.mode !== 'scheduled') return null

  return {
    mode: collection.mode,
    ...(text(collection.requested_for)
      ? { requested_for: text(collection.requested_for) }
      : {}),
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function finiteNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function finiteMoney(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= 1_000_000
    ? number
    : 0
}

function boundedText(value: unknown, maxLength: number) {
  const valueText = text(value)
  return valueText.length <= maxLength ? valueText : ''
}

function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function removeStoredValue(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // The in-memory Order remains authoritative for the current page.
  }
}
