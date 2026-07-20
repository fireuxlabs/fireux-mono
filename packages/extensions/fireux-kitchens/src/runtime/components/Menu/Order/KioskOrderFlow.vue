<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: send a fixed Eat here or Take away order through the shared basket and lifecycle. -->
<template>
  <MenuOrderStatus
    v-if="order.sentOrder.value"
    :customer-name="order.customerName.value"
    :destination-instructions="handoffInstructions"
    :fulfilment-label="order.fulfilmentLabel.value"
    fulfilment-term="Service"
    :order="order.sentOrder.value"
    :order-type="orderType"
    :payment-label="order.paymentLabel.value"
    :status="order.status.value"
    :status-error="order.statusError.value"
    :response-error="order.responseError.value"
    :responding="order.responsePending.value"
    @cancel="cancelOrder"
    @amend="amendOrder"
    @reset="resetOrder"
  />

  <template v-else>
    <MenuOrderCatalogue
      :key="scopeKey"
      :currency-code="currencyCode"
      :sections="sections"
      @add="basket.add"
    />

    <MenuOrderBasketSummary
      :currency-code="basket.currencyCode.value"
      :quantity="basket.quantity.value"
      :total="basket.total.value"
      :total-label="basket.totalLabel.value"
      @review="openBasket"
    />

    <MenuOrderCheckoutDialog
      v-model:open="checkoutOpen"
      :error="order.error.value"
      :handoff-instructions="handoffInstructions"
      :order-type="orderType"
      :payment-methods="paymentMethods"
      :pending="order.pending.value"
      :required-contact-fields="requiredContactFields"
      :selection-label="order.modeLabel"
      :show-contact-fields="requiredContactFields.length > 0"
      :total-label="basket.totalLabel.value"
      @submit="submitOrder"
    />
  </template>

  <MenuOrderBasketDialog
    v-model:open="basketOpen"
    action-label="Review and send"
    :currency-code="basket.currencyCode.value"
    :lines="basket.lines.value"
    :selection-label="order.modeLabel"
    :total-label="basket.totalLabel.value"
    @remove="basket.remove"
    @continue="continueFromBasket"
    @after-leave="finishBasketDialog"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import { useMenuOrderBasket } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  useMenuKioskOrder,
  type MenuKioskOrderType,
} from '../../../composables/fireux/menu/order/useMenuKioskOrder'
import type { MenuOrderCheckoutInput } from '../../../utils/menu-order-payment'

const props = defineProps<{
  config: MenuOrderTypeConfig | null
  currencyCode: string
  kitchenId: string
  kitchenSlug?: string
  menuId: string
  orderType: MenuKioskOrderType
  scopeKey: string
  sections: MenuManifestSection[]
  sourceMenuId: string
}>()
const scopeKey = computed(() => props.scopeKey)
const basket = useMenuOrderBasket({
  currencyCode: computed(() => props.currencyCode),
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const order = useMenuKioskOrder({
  kitchenId: computed(() => props.kitchenId),
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  orderType: props.orderType,
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const basketOpen = ref(false)
const checkoutOpen = ref(false)
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const openCheckoutAfterBasket = ref(false)
const paymentMethods = computed(() => props.config?.fulfilment?.payment_methods || [])
const handoffInstructions = computed(() =>
  String(props.config?.fulfilment?.handoff_instructions || '').trim()
)
const requiredContactFields = computed(() => props.config?.customer?.required_fields || [])

watch(() => basket.quantity.value, (quantity: number) => {
  if (quantity || order.sentOrder.value) return
  basketOpen.value = false
  checkoutOpen.value = false
})

function openBasket(trigger: HTMLButtonElement) {
  if (!basket.quantity.value) return
  basketTrigger.value = trigger
  basketOpen.value = true
}

function continueFromBasket() {
  if (!basket.quantity.value) return
  openCheckoutAfterBasket.value = true
  basketOpen.value = false
}

function finishBasketDialog() {
  if (openCheckoutAfterBasket.value) {
    openCheckoutAfterBasket.value = false
    checkoutOpen.value = true
    return
  }
  const trigger = basketTrigger.value
  basketTrigger.value = null
  void nextTick(() => trigger?.focus())
}

async function submitOrder(input: MenuOrderCheckoutInput) {
  const created = await order.submit({
    ...input,
    lines: basket.lines.value,
    sourceMenuId: props.sourceMenuId,
  })
  if (created) checkoutOpen.value = false
}

function resetOrder() {
  order.reset()
  basketOpen.value = false
  checkoutOpen.value = false
  basket.clear()
}

async function amendOrder() {
  const response = await order.respondToChanges({ action: 'amend' })
  if (response) basketOpen.value = true
}

async function cancelOrder() {
  const response = await order.respondToChanges({ action: 'cancel' })
  if (!response) return
  basketOpen.value = false
  checkoutOpen.value = false
  basket.clear()
}
</script>
