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
import type { CreatedMenuOrder } from '../../../../models/kitchen/menu/menu-ordering.model'
import { readMenuOrderCapabilityToken } from '../../../../utils/menu-order-capability'

// Concurrent edit — 2026-07-20 15:20 CEST — Anonymous Order capability pass: retain the opaque same-device token in canonical local tracking only.

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
  clear: () => void
  fulfilmentLabel: Ref<string>
  paymentLabel: Ref<string>
  resetMemory: () => void
  restore: () => boolean
  isAcknowledged: (orderId: unknown) => boolean
  save: () => void
  sentOrder: Ref<CreatedMenuOrder | null>
  status: Ref<TStatus | null>
}

type StoredMenuOrderTrackingSession = {
  version: 1
  order: CreatedMenuOrder
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
  const status = ref<TStatus | null>(null)
  const fulfilmentLabel = ref('')
  const paymentLabel = ref('')
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
        JSON.parse(window.localStorage.getItem(storageKey.value) || 'null'),
        options.orderType
      )
      if (!stored) return false

      sentOrder.value = stored.order
      status.value = stored.status as TStatus | null
      fulfilmentLabel.value = stored.fulfilment_label
      paymentLabel.value = stored.payment_label
      return true
    } catch {
      window.localStorage.removeItem(storageKey.value)
      return false
    }
  }

  function save() {
    if (!import.meta.client || !storageKey.value || !sentOrder.value) return

    const order = safeCreatedOrder(sentOrder.value, options.orderType)
    if (!order) {
      clear()
      return
    }

    const nextStatus = status.value
      ? safeTrackingStatus(status.value, options.orderType)
      : null
    const stored: StoredMenuOrderTrackingSession = {
      version: 1,
      order,
      status: nextStatus,
      fulfilment_label: text(fulfilmentLabel.value),
      payment_label: text(paymentLabel.value),
      updated_at: new Date().toISOString(),
    }
    window.localStorage.setItem(storageKey.value, JSON.stringify(stored))
  }

  function clear() {
    if (import.meta.client && storageKey.value) {
      window.localStorage.removeItem(storageKey.value)
    }
    resetMemory()
  }

  function acknowledge() {
    const orderId = text(sentOrder.value?.id)
    if (import.meta.client && orderId) {
      window.localStorage.setItem(
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
      window.localStorage.getItem(
        `${acknowledgementPrefix}${encodeURIComponent(id)}`
      )
    )
  }

  function resetMemory() {
    sentOrder.value = null
    status.value = null
    fulfilmentLabel.value = ''
    paymentLabel.value = ''
  }

  return {
    acknowledge,
    clear,
    fulfilmentLabel,
    paymentLabel,
    resetMemory,
    restore,
    isAcknowledged,
    save,
    sentOrder,
    status,
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
    order,
    status,
    fulfilment_label: text(stored.fulfilment_label),
    payment_label: text(stored.payment_label),
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
  const capabilityToken = readMenuOrderCapabilityToken(order.capability_token)
  return {
    id,
    ...(capabilityToken ? { capability_token: capabilityToken } : {}),
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
