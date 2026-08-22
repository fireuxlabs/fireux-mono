<template>
  <MenuOrderStatus
    v-if="order.sentOrder.value"
    :customer-name="order.customerName.value"
    :destination-instructions="handoffInstructions"
    :fulfilment-label="order.preOrderLabel.value"
    fulfilment-term="Pre-order"
    :order="order.sentOrder.value"
    order-type="pre_order"
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
    <MenuOrderPreOrderPlan
      v-model:party-size="partySize"
      :selection="requestedTime"
      @choose-time="openTimePicker"
    />

    <template v-if="planReady">
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
        handoff-title="Table pre-order"
        order-type="pre_order"
        :payment-methods="paymentMethods"
        :pending="order.pending.value"
        :required-contact-fields="requiredContactFields"
        :selection-label="requestedTime?.label || ''"
        :total-label="basket.totalLabel.value"
        @submit="submitOrder"
      />
    </template>
  </template>

  <MenuOrderBasketDialog
    v-model:open="basketOpen"
    action-label="Review and send"
    :currency-code="basket.currencyCode.value"
    :lines="basket.lines.value"
    :selection-label="requestedTime?.label"
    :total-label="basket.totalLabel.value"
    @remove="basket.remove"
    @continue="continueFromBasket"
    @after-leave="finishBasketDialog"
  />

  <MenuOrderTimeDialog
    v-model:open="timeOpen"
    :asap-enabled="false"
    asap-description=""
    description="Choose when the table would like to dine."
    empty-description="No requested dining times are currently available."
    :hours="hours"
    :notice-hours="config?.notice_hours"
    :schedule-horizon-days="config?.schedule_horizon_days"
    :selection="requestedTime"
    :slot-interval-minutes="config?.slot_interval_minutes"
    surface-label="Pre-order"
    time-label="Dining"
    unavailable-description="The Kitchen has not published the dining times available for pre-orders."
    unavailable-title="Requested dining times unavailable"
    @select="setRequestedTime"
    @after-leave="finishTimeDialog"
  />
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 17:12 CEST — Pre-order pass: compose mandatory timing over shared Menu Order seams.
// Concurrent edit — 2026-07-20 16:10 CEST — Pre-order planning pass: gate catalogue selection behind dining time and party size.
// Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: consume the renamed Pre-order delta.
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../utils/menu.ts'
import type { MenuManifestSection } from '../../models/menu-detail.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  useMenuOrderBasket,
  type MenuOrderBasketLine,
} from '../../composables/order/useMenuOrderBasket'
import { useMenuOrderPreOrder } from '../../composables/order/useMenuOrderPreOrder'
import type { MenuOrderTimeSelection } from '../../utils/menu-order-time'
import type { MenuOrderCheckoutInput } from '../../utils/menu-order-payment'

const props = defineProps<{
  config: MenuOrderTypeConfig | null
  currencyCode: string
  hours?: WeekdayTimeWindowsConfig
  kitchenId: string
  kitchenSlug?: string
  menuId: string
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
const order = useMenuOrderPreOrder({
  kitchenId: computed(() => props.kitchenId),
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const basketOpen = ref(false)
const timeOpen = ref(false)
const checkoutOpen = ref(false)
const requestedTime = ref<MenuOrderTimeSelection | null>(null)
const partySize = ref('')
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const timeTrigger = shallowRef<HTMLButtonElement | null>(null)
const openCheckoutAfterBasket = ref(false)
const parsedPartySize = computed(() => Number(partySize.value))
const planReady = computed(
  () =>
    Boolean(requestedTime.value?.requestedFor) &&
    Number.isSafeInteger(parsedPartySize.value) &&
    parsedPartySize.value >= 1 &&
    parsedPartySize.value <= 500
)
const paymentMethods = computed(
  () => props.config?.fulfilment?.payment_methods || []
)
const handoffInstructions = computed(() =>
  String(props.config?.fulfilment?.handoff_instructions || '').trim()
)
const requiredContactFields = computed(
  () => props.config?.customer?.required_fields || []
)

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
    checkoutOpen.value = false
  }
)
watch(scopeKey, () => {
  closeDialogs()
  requestedTime.value = null
  partySize.value = ''
})

function openTimePicker(trigger: HTMLButtonElement) {
  timeTrigger.value = trigger
  timeOpen.value = true
}

function openBasket(trigger: HTMLButtonElement) {
  if (!basket.quantity.value) return
  basketTrigger.value = trigger
  basketOpen.value = true
}

function continueFromBasket() {
  if (!basket.quantity.value || !planReady.value) return
  openCheckoutAfterBasket.value = true
  basketOpen.value = false
}

function finishBasketDialog() {
  if (openCheckoutAfterBasket.value) {
    openCheckoutAfterBasket.value = false
    checkoutOpen.value = true
    return
  }
  restoreTriggerFocus()
}

function setRequestedTime(selection: MenuOrderTimeSelection) {
  if (!selection.requestedFor) return
  requestedTime.value = selection
}

function finishTimeDialog() {
  const trigger = timeTrigger.value
  timeTrigger.value = null
  void nextTick(() => trigger?.focus())
}

async function submitOrder(input: MenuOrderCheckoutInput) {
  if (!requestedTime.value?.requestedFor || !planReady.value) return
  const created = await order.submit({
    ...input,
    lines: basket.lines.value,
    partySize: parsedPartySize.value,
    selection: requestedTime.value,
    sourceMenuId: props.sourceMenuId,
  })
  if (created) checkoutOpen.value = false
}

function resetOrder() {
  order.reset()
  closeDialogs()
  requestedTime.value = null
  partySize.value = ''
  basket.clear()
}

async function amendOrder() {
  const response = await order.respondToChanges({ action: 'amend' })
  if (!response) return
  requestedTime.value = null
  partySize.value = ''
  basketOpen.value = false
}

async function cancelOrder() {
  const response = await order.respondToChanges({ action: 'cancel' })
  if (response) resetOrder()
}

function closeDialogs() {
  basketOpen.value = false
  timeOpen.value = false
  checkoutOpen.value = false
  openCheckoutAfterBasket.value = false
}

function restoreTriggerFocus() {
  const trigger = basketTrigger.value
  basketTrigger.value = null
  void nextTick(() => trigger?.focus())
}
</script>
