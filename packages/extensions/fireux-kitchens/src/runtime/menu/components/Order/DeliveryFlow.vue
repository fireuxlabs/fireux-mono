<template>
  <MenuOrderStatus
    v-if="order.sentOrder.value"
    :customer-name="order.customerName.value"
    :destination-instructions="handoffInstructions"
    :fulfilment-label="order.deliveryLabel.value"
    fulfilment-term="Delivery"
    :order="order.sentOrder.value"
    order-type="delivery"
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
      handoff-title="Delivery handoff"
      order-type="delivery"
      :payment-methods="paymentMethods"
      :pending="order.pending.value"
      :required-contact-fields="requiredContactFields"
      :selection-label="checkoutSelectionLabel"
      :total-label="delivery.totalLabel.value"
      @submit="submitOrder"
    />
  </template>

  <MenuOrderBasketDialog
    v-model:open="basketOpen"
    :action-label="basketActionLabel"
    :currency-code="basket.currencyCode.value"
    :lines="basket.lines.value"
    :selection-label="basketSelectionLabel"
    :total-label="basket.totalLabel.value"
    @remove="basket.remove"
    @continue="continueFromBasket"
    @after-leave="finishBasketDialog"
  />

  <MenuOrderDeliveryAddressDialog
    v-model:open="addressOpen"
    :address="delivery.address.value"
    :error="delivery.checkError.value || delivery.suggestionsError.value"
    :pending="delivery.checkPending.value || delivery.suggestionsPending.value"
    :predictions="delivery.predictions.value"
    :ready="delivery.ready.value"
    :status="delivery.status.value"
    :total-label="delivery.totalLabel.value"
    @update:address="delivery.address.value = $event"
    @select="delivery.selectAddress"
    @check="delivery.check"
    @continue="continueFromAddress"
    @after-leave="finishAddressDialog"
  />

  <MenuOrderTimeDialog
    v-model:open="deliveryTimeOpen"
    :asap-enabled="config?.asap_enabled"
    asap-description="Ask the Kitchen to prepare this delivery as soon as possible."
    :hours="hours"
    :notice-hours="config?.notice_hours"
    :schedule-horizon-days="config?.schedule_horizon_days"
    :selection="deliveryTime"
    :slot-interval-minutes="config?.slot_interval_minutes"
    surface-label="Delivery"
    time-label="Delivery"
    @select="setDeliveryTime"
    @after-leave="finishDeliveryTimeDialog"
  />
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: connect address, timing, checkout, and lifecycle through shared Menu Order seams.
// Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: consume the renamed Delivery order delta.
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../models/menu-ordering.model'
import type { MenuManifestSection } from '../../models/menu-detail.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  useMenuOrderBasket,
  type MenuOrderBasketLine,
} from '../../composables/order/useMenuOrderBasket'
import { useMenuDeliveryAddress } from '../../composables/order/useMenuDeliveryAddress'
import { useMenuOrderDelivery } from '../../composables/order/useMenuOrderDelivery'
import type { MenuOrderCheckoutInput } from '../../utils/menu-order-payment'
import type { MenuOrderTimeSelection } from '../../utils/menu-order-time'

const props = defineProps<{
  config: MenuOrderTypeConfig | null
  currencyCode: string
  hours?: WeekdayTimeWindowsConfig
  kitchenId: string
  kitchenSlug?: string
  menuId: string
  kitchenServiceId: string
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
const delivery = useMenuDeliveryAddress({
  kitchenServiceId: () => props.kitchenServiceId,
  currencyCode: computed(() => props.currencyCode),
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  subtotal: basket.total,
})
const order = useMenuOrderDelivery({
  kitchenId: computed(() => props.kitchenId),
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  scopeKey,
  kitchenServiceId: () => props.kitchenServiceId,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const basketOpen = ref(false)
const addressOpen = ref(false)
const deliveryTimeOpen = ref(false)
const checkoutOpen = ref(false)
const deliveryTime = ref<MenuOrderTimeSelection | null>(null)
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const afterBasket = ref<'address' | 'time' | 'checkout' | ''>('')
const openTimeAfterAddress = ref(false)
const openCheckoutAfterTime = ref(false)
const paymentMethods = computed(
  () => props.config?.fulfilment?.payment_methods || []
)
const handoffInstructions = computed(() =>
  String(props.config?.fulfilment?.handoff_instructions || '').trim()
)
const requiredContactFields = computed(
  () => props.config?.customer?.required_fields || []
)
const basketActionLabel = computed(() => {
  if (!delivery.ready.value) return 'Choose delivery address'
  if (!deliveryTime.value) return 'Choose delivery time'
  return 'Review and send'
})
const basketSelectionLabel = computed(() =>
  [deliveryTime.value?.label, delivery.ready.value ? delivery.label.value : '']
    .filter(Boolean)
    .join(' · ')
)
const checkoutSelectionLabel = computed(() => basketSelectionLabel.value)

watch(
  () => order.amendmentLines.value,
  (lines: MenuOrderBasketLine[]) => {
    if (!basket.quantity.value && lines.length) basket.replace(lines)
  },
  { immediate: true }
)

watch(
  () => basket.quantity.value,
  (quantity: number) => {
    if (quantity || order.sentOrder.value) return
    basketOpen.value = false
    addressOpen.value = false
    deliveryTimeOpen.value = false
    checkoutOpen.value = false
    deliveryTime.value = null
    delivery.clear()
  }
)
watch(scopeKey, () => {
  basketOpen.value = false
  addressOpen.value = false
  deliveryTimeOpen.value = false
  checkoutOpen.value = false
  deliveryTime.value = null
  delivery.clear()
})

function openBasket(trigger: HTMLButtonElement) {
  if (!basket.quantity.value) return
  basketTrigger.value = trigger
  basketOpen.value = true
}

function continueFromBasket() {
  if (!basket.quantity.value) return
  afterBasket.value = !delivery.ready.value
    ? 'address'
    : !deliveryTime.value
      ? 'time'
      : 'checkout'
  basketOpen.value = false
}

function finishBasketDialog() {
  if (afterBasket.value === 'address') {
    afterBasket.value = ''
    addressOpen.value = true
    return
  }
  if (afterBasket.value === 'checkout') {
    afterBasket.value = ''
    checkoutOpen.value = true
    return
  }
  if (afterBasket.value === 'time') {
    afterBasket.value = ''
    deliveryTimeOpen.value = true
    return
  }
  restoreTriggerFocus()
}

function continueFromAddress() {
  if (!delivery.ready.value) return
  openTimeAfterAddress.value = true
  addressOpen.value = false
}

function finishAddressDialog() {
  if (openTimeAfterAddress.value) {
    openTimeAfterAddress.value = false
    deliveryTimeOpen.value = true
    return
  }
  restoreTriggerFocus()
}

function setDeliveryTime(selection: MenuOrderTimeSelection) {
  deliveryTime.value = selection
  openCheckoutAfterTime.value = true
}

function finishDeliveryTimeDialog() {
  if (openCheckoutAfterTime.value) {
    openCheckoutAfterTime.value = false
    checkoutOpen.value = true
    return
  }
  restoreTriggerFocus()
}

async function submitOrder(input: MenuOrderCheckoutInput) {
  if (!delivery.ready.value || !deliveryTime.value) return
  const created = await order.submit({
    ...input,
    address: delivery.label.value,
    addressLabel: delivery.label.value,
    addressPlaceId: delivery.placeId.value,
    lines: basket.lines.value,
    selection: deliveryTime.value,
    sourceMenuId: props.sourceMenuId,
  })
  if (created) checkoutOpen.value = false
}

function resetOrder() {
  order.reset()
  basketOpen.value = false
  addressOpen.value = false
  deliveryTimeOpen.value = false
  checkoutOpen.value = false
  deliveryTime.value = null
  delivery.clear()
  basket.clear()
}

async function amendOrder() {
  const response = await order.respondToChanges({ action: 'amend' })
  if (!response) return
  deliveryTime.value = null
  delivery.clear()
  basketOpen.value = true
}

async function cancelOrder() {
  const response = await order.respondToChanges({ action: 'cancel' })
  if (!response) return
  resetOrder()
}

function restoreTriggerFocus() {
  const trigger = basketTrigger.value
  basketTrigger.value = null
  void nextTick(() => trigger?.focus())
}
</script>
