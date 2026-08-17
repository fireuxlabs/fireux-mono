<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: send a fixed Eat here or Take away order through the shared basket and lifecycle. -->
<!-- Concurrent edit — 2026-07-22 11:45 CEST — MenuOrder naming spine: consume the renamed Kiosk order delta. -->
<template>
  <div
    class="menu-order-kiosk-order"
    :data-menu-kiosk-order-type="orderType"
  >
    <div v-if="order.sentOrder.value" class="menu-order-kiosk-order__status">
      <MenuOrderStatus
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
      />
    </div>

    <template v-else>
      <MenuOrderKioskCatalogue
        :key="scopeKey"
        :currency-code="currencyCode"
        :catalogue-background-image-url="catalogueBackgroundImageUrl"
        :kitchen-name="kitchenName"
        :logo-image-url="logoImageUrl"
        :order-type="orderType"
        :sections="sections"
        :section-card-frame-image-url="sectionCardFrameImageUrl"
        :section-card-image-urls="sectionCardImageUrls"
        @add="basket.add"
        @restart="finishKioskSession"
      />

      <div class="menu-order-kiosk-order__basket">
        <MenuOrderBasketSummary
          :currency-code="basket.currencyCode.value"
          :quantity="basket.quantity.value"
          :total="basket.total.value"
          :total-label="basket.totalLabel.value"
          label="View order"
          @review="openBasket"
        />
      </div>

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
      action-label="Continue to checkout"
      :currency-code="basket.currencyCode.value"
      :lines="basket.lines.value"
      presentation="drawer"
      :selection-label="order.modeLabel"
      :total-label="basket.totalLabel.value"
      @remove="basket.remove"
      @continue="continueFromBasket"
      @after-leave="finishBasketDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import { useMenuOrderBasket } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  useMenuOrderKiosk,
  type MenuOrderKioskType,
} from '../../../composables/fireux/menu/order/useMenuOrderKiosk'
import type { MenuOrderCheckoutInput } from '../../../utils/menu-order-payment'

const props = defineProps<{
  config: MenuOrderTypeConfig | null
  catalogueBackgroundImageUrl?: string
  currencyCode: string
  kitchenId: string
  kitchenName?: string
  kitchenSlug?: string
  logoImageUrl?: string
  menuId: string
  orderType: MenuOrderKioskType
  scopeKey: string
  sections: MenuManifestSection[]
  sectionCardFrameImageUrl?: string
  sectionCardImageUrls?: Record<string, string>
  sourceMenuId: string
}>()
const emit = defineEmits<{
  (event: 'restart'): void
}>()
const scopeKey = computed(() => props.scopeKey)
const basket = useMenuOrderBasket({
  currencyCode: computed(() => props.currencyCode),
  scopeKey,
  sourceMenuId: computed(() => props.sourceMenuId),
})
const order = useMenuOrderKiosk({
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
let readyResetTimer: ReturnType<typeof setTimeout> | undefined

watch(() => basket.quantity.value, (quantity: number) => {
  if (quantity || order.sentOrder.value) return
  basketOpen.value = false
  checkoutOpen.value = false
})

watch(
  () => order.status.value?.status || order.sentOrder.value?.status,
  (status) => {
    clearTimeout(readyResetTimer)
    readyResetTimer = undefined
    if (status !== 'ready') return
    readyResetTimer = setTimeout(finishKioskSession, 6_000)
  },
  { immediate: true }
)

onBeforeUnmount(() => clearTimeout(readyResetTimer))

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

function finishKioskSession() {
  order.reset()
  basketOpen.value = false
  checkoutOpen.value = false
  basket.clear()
  emit('restart')
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

<style scoped>
.menu-order-kiosk-order {
  position: relative;
  display: grid;
  height: 100%;
  min-height: 0;
}

.menu-order-kiosk-order__status {
  min-height: 0;
  padding: clamp(
    calc(var(--spacing) * 4),
    4vw,
    calc(var(--spacing) * 12)
  );
  overflow-y: auto;
}

.menu-order-kiosk-order__basket {
  position: absolute;
  z-index: 30;
  inset-inline: clamp(1rem, 3vw, 2rem);
  bottom: max(1rem, env(safe-area-inset-bottom));
  display: grid;
  pointer-events: none;
}

.menu-order-kiosk-order__basket :deep(.menu-order-basket-summary) {
  position: static;
  width: min(100%, 38rem);
  min-height: 4.25rem;
  pointer-events: auto;
}

@media (max-width: 700px) {
  .menu-order-kiosk-order__basket {
    bottom: max(7rem, env(safe-area-inset-bottom));
  }
}
</style>
