<template>
  <MenuOrderCollectionStatus
    v-if="order.sentOrder.value"
    :collection-label="order.collectionLabel.value"
    :handoff-instructions="handoffInstructions"
    :order="order.sentOrder.value"
    :payment-label="order.paymentLabel.value"
    :status="order.status.value"
    :status-error="order.statusError.value"
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

    <MenuOrderBasketDialog
      v-model:open="basketOpen"
      :action-label="basketActionLabel"
      :currency-code="basket.currencyCode.value"
      :lines="basket.lines.value"
      :selection-label="collectionTime?.label"
      :total-label="basket.totalLabel.value"
      @quantity="basket.setQuantity"
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
  kitchenSlug?: string
  menuId: string
  orderPath: string
  sections: MenuManifestSection[]
  sourceMenuId: string
}>()
const scopeKey = computed(() => JSON.stringify([
  props.orderPath,
  props.kitchenSlug || '',
  props.sourceMenuId,
]))
const basket = useMenuOrderBasket({
  currencyCode: computed(() => props.currencyCode),
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const order = useMenuCollectionOrder({
  kitchenSlug: computed(() => props.kitchenSlug || ''),
  menuId: computed(() => props.menuId),
  scopeKey,
})
const basketOpen = ref(false)
const collectionTimeOpen = ref(false)
const checkoutOpen = ref(false)
const collectionTime = ref<MenuOrderCollectionTimeSelection | null>(null)
const basketTrigger = shallowRef<HTMLButtonElement | null>(null)
const afterBasket = ref<'time' | 'checkout' | ''>('')
const openCheckoutAfterTime = ref(false)
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
  collectionTime.value ? 'Review and send' : 'Choose collection time'
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
  afterBasket.value = collectionTime.value ? 'checkout' : 'time'
  basketOpen.value = false
}

function setCollectionTime(selection: MenuOrderCollectionTimeSelection) {
  collectionTime.value = selection
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
  basket.clear()
}

function resetOrder() {
  order.reset()
  collectionTime.value = null
}

function restoreTriggerFocus() {
  const trigger = basketTrigger.value
  basketTrigger.value = null
  void nextTick(() => trigger?.focus())
}
</script>
