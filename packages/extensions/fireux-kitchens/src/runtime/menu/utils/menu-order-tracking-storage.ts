import {
  isKitchenOrderStatus,
  isKitchenOrderType,
  type KitchenOrderChannel,
  type KitchenOrderStatus,
  type KitchenOrderType,
} from '../../kitchen/models/order.model.ts'
import type {
  CreatedMenuOrder,
  CreatedMenuOrderReceiptLine,
} from '../models/menu-ordering.model.ts'
import { readMenuOrderCapabilityToken } from './menu-order-capability'

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

export type MenuOrderTrackingSnapshot = {
  capabilityToken: string
  fulfilmentLabel: string
  order: CreatedMenuOrder
  paymentLabel: string
  receiptItems: CreatedMenuOrderReceiptLine[]
  status: MenuOrderTrackingStatus | null
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
const RECOVERY_MAX_AGE_MS = 24 * 60 * 60 * 1000
const channels = new Set<KitchenOrderChannel>([
  'menu',
  'table_qr',
  'kiosk',
  'room_service',
  'staff_pos',
])
const text = (value: unknown) => String(value ?? '').trim()

export function menuOrderTrackingStorageKey(scope: unknown) {
  const normalizedScope = text(scope)

  return normalizedScope
    ? `${storagePrefix}${encodeURIComponent(normalizedScope)}`
    : ''
}

export function readMenuOrderTrackingSession(
  key: string,
  orderType: KitchenOrderType
) {
  try {
    return readStoredSession(
      JSON.parse(readStoredValue(key) || 'null'),
      orderType
    )
  } catch {
    removeMenuOrderTrackingSession(key)
    return null
  }
}

export function createMenuOrderTrackingSnapshot(
  value: MenuOrderTrackingSnapshot,
  orderType: KitchenOrderType
): StoredMenuOrderTrackingSession | null {
  const order = safeCreatedMenuOrder(value.order, orderType)
  if (!order) return null

  return {
    version: 1,
    capability_token: readMenuOrderCapabilityToken(value.capabilityToken),
    order,
    status: value.status
      ? safeMenuOrderTrackingStatus(value.status, orderType)
      : null,
    fulfilment_label: text(value.fulfilmentLabel),
    payment_label: text(value.paymentLabel),
    receipt_items: safeMenuOrderReceiptItems(value.receiptItems),
    updated_at: new Date().toISOString(),
  }
}

export function writeMenuOrderTrackingSession(
  key: string,
  value: StoredMenuOrderTrackingSession
) {
  return writeStoredValue(key, JSON.stringify(value))
}

export function removeMenuOrderTrackingSession(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // The in-memory Order remains authoritative for the current page.
  }
}

export function acknowledgeMenuOrder(orderId: unknown) {
  const id = text(orderId)
  if (!id) return false

  return writeStoredValue(
    `${acknowledgementPrefix}${encodeURIComponent(id)}`,
    new Date().toISOString()
  )
}

export function isMenuOrderAcknowledged(orderId: unknown) {
  const id = text(orderId)
  if (!id) return false
  const key = `${acknowledgementPrefix}${encodeURIComponent(id)}`
  const value = readStoredValue(key)
  if (isCurrentTimestamp(value)) return true
  removeStoredValue(key)
  return false
}

export function safeCreatedMenuOrder(
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

export function safeMenuOrderReceiptItems(
  value: unknown
): CreatedMenuOrderReceiptLine[] {
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

function readStoredSession(
  value: unknown,
  orderType: KitchenOrderType
): StoredMenuOrderTrackingSession | null {
  const stored = record(value)
  if (stored.version !== 1) return null
  if (!isCurrentTimestamp(stored.updated_at)) return null

  const order = safeCreatedMenuOrder(stored.order, orderType)
  if (!order) return null

  const rawStatus = stored.status
  const status = rawStatus === null || rawStatus === undefined
    ? null
    : safeMenuOrderTrackingStatus(rawStatus, orderType)
  if (rawStatus && !status) return null

  return {
    version: 1,
    capability_token: readMenuOrderCapabilityToken(stored.capability_token),
    order,
    status,
    fulfilment_label: text(stored.fulfilment_label),
    payment_label: text(stored.payment_label),
    receipt_items: safeMenuOrderReceiptItems(stored.receipt_items),
    updated_at: text(stored.updated_at),
  }
}

function safeMenuOrderTrackingStatus(
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

function safeCollection(
  value: unknown
): NonNullable<CreatedMenuOrder['collection']> | null {
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
  } catch {}
}

function isCurrentTimestamp(value: unknown) {
  const timestamp = Date.parse(text(value))
  const age = Date.now() - timestamp
  return Number.isFinite(timestamp) && age >= 0 && age <= RECOVERY_MAX_AGE_MS
}
