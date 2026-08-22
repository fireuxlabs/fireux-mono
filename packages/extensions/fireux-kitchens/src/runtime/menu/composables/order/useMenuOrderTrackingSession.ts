import {
  computed,
  ref,
  shallowRef,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { KitchenOrderType } from '../../../kitchen/utils/order.ts'
import type {
  CreatedMenuOrder,
  CreatedMenuOrderReceiptLine,
} from '../../models/menu-ordering.model.ts'
import { readMenuOrderCapabilityToken } from '../../utils/menu-order-capability'
import {
  acknowledgeMenuOrder,
  createMenuOrderTrackingSnapshot,
  isMenuOrderAcknowledged,
  menuOrderTrackingStorageKey,
  readMenuOrderTrackingSession,
  removeMenuOrderTrackingSession,
  safeCreatedMenuOrder,
  safeMenuOrderReceiptItems,
  writeMenuOrderTrackingSession,
  type MenuOrderTrackingStatus,
} from '../../utils/menu-order-tracking-storage'

// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: retain the opaque same-device token in canonical local tracking only.
// Concurrent edit — 2026-07-20 16:36 CEST — Menu Order recovery pass: never turn a successful Order POST into a failed submission when browser storage is unavailable.

export type { MenuOrderTrackingStatus } from '../../utils/menu-order-tracking-storage'

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

const text = (value: unknown) => String(value ?? '').trim()

// 2026-07-19 15:03 CEST: This is the canonical Menu/Order tracking seam; surface funnels must not create parallel browser-session implementations.
export function useMenuOrderTrackingSession<
  TStatus extends MenuOrderTrackingStatus = MenuOrderTrackingStatus,
>(
  options: UseMenuOrderTrackingSessionOptions
): MenuOrderTrackingSession<TStatus> {
  const sentOrder = ref<CreatedMenuOrder | null>(null)
  const capabilityToken = ref('')
  const status = shallowRef<TStatus | null>(null) as Ref<TStatus | null>
  const fulfilmentLabel = ref('')
  const paymentLabel = ref('')
  const receiptItems = ref<CreatedMenuOrderReceiptLine[]>([])
  const storageKey = computed(() =>
    menuOrderTrackingStorageKey(toValue(options.scopeKey))
  )

  function restore() {
    resetMemory()
    if (!import.meta.client || !storageKey.value) return false

    const stored = readMenuOrderTrackingSession(
      storageKey.value,
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
  }

  function save() {
    if (!import.meta.client || !storageKey.value || !sentOrder.value)
      return false

    const snapshot = createMenuOrderTrackingSnapshot(
      {
        capabilityToken: capabilityToken.value,
        fulfilmentLabel: fulfilmentLabel.value,
        order: sentOrder.value,
        paymentLabel: paymentLabel.value,
        receiptItems: receiptItems.value,
        status: status.value,
      },
      options.orderType
    )
    if (!snapshot) {
      clear()
      return false
    }

    return writeMenuOrderTrackingSession(storageKey.value, snapshot)
  }

  function clear() {
    if (import.meta.client && storageKey.value) {
      removeMenuOrderTrackingSession(storageKey.value)
    }
    resetMemory()
  }

  function acknowledge() {
    const orderId = text(sentOrder.value?.id)
    if (import.meta.client && orderId) acknowledgeMenuOrder(orderId)
    clear()
  }

  function isAcknowledged(orderId: unknown) {
    return import.meta.client && isMenuOrderAcknowledged(orderId)
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
    receiptItems.value = safeMenuOrderReceiptItems(order.receipt?.items)
    sentOrder.value = safeCreatedMenuOrder(order, options.orderType)
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
