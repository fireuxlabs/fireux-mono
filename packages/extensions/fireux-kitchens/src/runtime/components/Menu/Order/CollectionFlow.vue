<template>
  <MenuOrderCollectionStatus
    v-if="order.sentOrder.value"
    :collection-label="order.collectionLabel.value"
    :customer-name="order.customerName.value"
    :handoff-instructions="handoffInstructions"
    :order="order.sentOrder.value"
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
      order-type="collection"
      :payment-methods="paymentMethods"
      :pending="order.pending.value"
      :required-contact-fields="requiredContactFields"
      :selection-label="collectionTime?.label || ''"
      :total-label="basket.totalLabel.value"
      @submit="submitOrder"
    />
  </template>

  <MenuOrderBasketDialog
    v-model:open="basketOpen"
    :action-label="basketActionLabel"
    :currency-code="basket.currencyCode.value"
    :lines="basket.lines.value"
    :removable="!amendingOrder"
    :selection-label="collectionTime?.label"
    :total-label="basket.totalLabel.value"
    @remove="basket.remove"
    @continue="continueFromBasket"
    @after-leave="finishBasketDialog"
  />

  <MenuOrderCollectionTimeDialog
    v-model:open="collectionTimeOpen"
    :asap-enabled="config?.asap_enabled"
    :hours="hours"
    :notice-hours="config?.notice_hours"
    :schedule-horizon-days="config?.schedule_horizon_days"
    :selection="collectionTime"
    :slot-interval-minutes="config?.slot_interval_minutes"
    @select="setCollectionTime"
    @after-leave="finishCollectionTimeDialog"
  />

  <!-- 2026-07-19 15:18 CEST: Keep this dev-only recovery trace while the canonical customer-order landing seam is being verified across concurrent customer-session work. -->
  <DevJson
    title="Menu order recovery (JSON)"
    context="menu order · canonical customer recovery"
    :objects="{
      order: order.sentOrder.value,
      status: order.status.value,
    }"
    :derived="order.recovery.value"
    :hide-when-empty="false"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model'
import { useMenuOrderBasket } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  useMenuCollectionOrder,
} from '../../../composables/fireux/menu/order/useMenuCollectionOrder'
import type { MenuOrderCollectionTimeSelection } from '../../../utils/menu-order-collection-time'
import type { MenuOrderCheckoutInput } from '../../../utils/menu-order-payment'

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
const order = useMenuCollectionOrder({
  kitchenId: computed(() => props.kitchenId),
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const basketOpen = ref(false)
const collectionTimeOpen = ref(false)
const checkoutOpen = ref(false)
const collectionTime = ref<MenuOrderCollectionTimeSelection | null>(null)
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const afterBasket = ref<'time' | 'checkout' | ''>('')
const openCheckoutAfterTime = ref(false)
const amendingOrder = ref(false)
const paymentMethods = computed(() =>
  props.config?.fulfilment?.payment_methods || []
)
const handoffInstructions = computed(() =>
  String(props.config?.fulfilment?.handoff_instructions || '').trim()
)
const requiredContactFields = computed(() =>
  props.config?.customer?.required_fields || []
)
const basketActionLabel = computed(() =>
  amendingOrder.value
    ? 'Choose another time'
    : collectionTime.value
      ? 'Review and send'
      : 'Choose collection time'
)

// 2026-07-19 15:40 CEST: Amendment review rehydrates from the customer-owned Order projection; the transient basket remains presentation, not lifecycle authority.
watch(
  () => order.amendmentLines.value,
  (lines) => {
    if (!basket.quantity.value && lines.length) basket.replace(lines)
  },
  { immediate: true }
)

watch(
  () => basket.quantity.value,
  (quantity: number) => {
    if (quantity || order.sentOrder.value) return
    basketOpen.value = false
    collectionTimeOpen.value = false
    checkoutOpen.value = false
    collectionTime.value = null
  }
)
watch(scopeKey, () => {
  amendingOrder.value = false
  basketOpen.value = false
  collectionTimeOpen.value = false
  checkoutOpen.value = false
  collectionTime.value = null
})

function openBasket(trigger: HTMLButtonElement) {
  if (!basket.quantity.value) return
  basketTrigger.value = trigger
  basketOpen.value = true
}

function continueFromBasket() {
  if (!basket.quantity.value) return
  afterBasket.value = amendingOrder.value
    ? 'time'
    : collectionTime.value
      ? 'checkout'
      : 'time'
  basketOpen.value = false
}

async function setCollectionTime(selection: MenuOrderCollectionTimeSelection) {
  collectionTime.value = selection
  if (amendingOrder.value) {
    const response = await order.respondToChanges({
      action: 'reschedule',
      selection,
    })
    if (response) {
      amendingOrder.value = false
      collectionTimeOpen.value = false
    }
    return
  }
  openCheckoutAfterTime.value = true
}

function finishBasketDialog() {
  if (afterBasket.value === 'time') {
    afterBasket.value = ''
    collectionTimeOpen.value = true
    return
  }
  if (afterBasket.value === 'checkout') {
    afterBasket.value = ''
    checkoutOpen.value = true
    return
  }

  restoreTriggerFocus()
}

function finishCollectionTimeDialog() {
  if (openCheckoutAfterTime.value) {
    openCheckoutAfterTime.value = false
    checkoutOpen.value = true
    return
  }

  restoreTriggerFocus()
}

async function submitOrder(input: MenuOrderCheckoutInput) {
  if (!collectionTime.value) return
  const created = await order.submit({
    ...input,
    lines: basket.lines.value,
    selection: collectionTime.value,
    sourceMenuId: props.sourceMenuId,
  })
  if (!created) return

  checkoutOpen.value = false
}

function resetOrder() {
  order.reset()
  amendingOrder.value = false
  basketOpen.value = false
  collectionTimeOpen.value = false
  checkoutOpen.value = false
  collectionTime.value = null
  basket.clear()
}

function amendOrder() {
  amendingOrder.value = true
  basketOpen.value = true
}

async function cancelOrder() {
  const response = await order.respondToChanges({ action: 'cancel' })
  if (!response) return

  amendingOrder.value = false
  basketOpen.value = false
  collectionTimeOpen.value = false
  checkoutOpen.value = false
  collectionTime.value = null
  basket.clear()
}

function restoreTriggerFocus() {
  const trigger = basketTrigger.value
  basketTrigger.value = null
  void nextTick(() => trigger?.focus())
}
</script>
