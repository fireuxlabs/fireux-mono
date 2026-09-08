<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: keep Demo World Kiosk interaction entirely in memory. -->
<template>
  <div
    class="showcase-kiosk-order"
    data-misebox-showcase="kiosk-order"
    data-showcase-order-submission="none"
    :data-menu-kiosk-order-type="orderType"
  >
    <div v-if="placedOrder" class="showcase-kiosk-order__status">
      <UBadge color="neutral" variant="soft">
        Local preview · no Order was sent
      </UBadge>

      <MenuOrderStatus
        :destination-instructions="handoffInstructions"
        :fulfilment-label="fulfilmentLabel"
        fulfilment-term="Service"
        :order="placedOrder"
        :order-type="orderType"
        payment-label="Pay at counter"
        :status="trackingStatus"
        @reset="resetOrder"
      />

      <UButton
        color="primary"
        size="xl"
        icon="i-lucide-rotate-ccw"
        @click="resetOrder"
      >
        Start another demo order
      </UButton>
    </div>

    <template v-else>
      <MenuOrderKioskCatalogue
        :key="scopeKey"
        :currency-code="currencyCode"
        :order-type="orderType"
        :sections="sections"
        @add="basket.add"
      />

      <div class="showcase-kiosk-order__basket">
        <MenuOrderBasketSummary
          :currency-code="basket.currencyCode.value"
          :quantity="basket.quantity.value"
          :total="basket.total.value"
          :total-label="basket.totalLabel.value"
          @review="basketOpen = true"
        />
      </div>

      <MenuOrderBasketDialog
        v-model:open="basketOpen"
        action-label="Place demo order"
        :currency-code="basket.currencyCode.value"
        :lines="basket.lines.value"
        :selection-label="modeLabel"
        :total-label="basket.totalLabel.value"
        @remove="basket.remove"
        @continue="placeOrder"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreatedMenuOrder } from 'fireux-kitchens/runtime/menu/models/menu-ordering.model'
import type { MenuManifestSection } from 'fireux-kitchens/runtime/menu/models/menu-detail.model'
import type { MenuOrderTypeConfig } from 'fireux-kitchens/runtime/menu/utils/menu'
import type { MenuOrderLifecycleStatus } from 'fireux-kitchens/runtime/menu/composables/order/useMenuOrderLifecycle'
import {
  useMenuOrderBasket,
} from 'fireux-kitchens/runtime/menu/composables/order/useMenuOrderBasket'
import type { MenuOrderKioskType } from 'fireux-kitchens/runtime/menu/composables/order/useMenuOrderKiosk'

const props = defineProps<{
  config: MenuOrderTypeConfig | null
  currencyCode: string
  nextOrderNumber: number
  orderType: MenuOrderKioskType
  scopeKey: string
  sections: MenuManifestSection[]
  sourceMenuId: string
}>()

const basket = useMenuOrderBasket({
  currencyCode: computed(() => props.currencyCode),
  scopeKey: computed(() => props.scopeKey),
  sourceMenuId: computed(() => props.sourceMenuId),
})
const basketOpen = ref(false)
const placedOrder = ref<CreatedMenuOrder | null>(null)
const modeLabel = computed(() => props.orderType === 'eat_in' ? 'Eat here' : 'Take away')
const orderNumber = computed(() => String(
  props.nextOrderNumber + (props.orderType === 'takeaway' ? 1 : 0)
))
const fulfilmentLabel = computed(() =>
  props.orderType === 'eat_in'
    ? `Eat here · Order ${orderNumber.value}`
    : `Take away · Order ${orderNumber.value}`
)
const handoffInstructions = computed(() =>
  String(props.config?.fulfilment?.handoff_instructions || '').trim() || (
    props.orderType === 'eat_in'
      ? 'Watch the screen for your tray number.'
      : 'Collect your bag when your number is called.'
  )
)
const trackingStatus = computed<MenuOrderLifecycleStatus | null>(() =>
  placedOrder.value
    ? {
        id: placedOrder.value.id,
        order_number: placedOrder.value.order_number,
        status: 'accepted',
        order_type: props.orderType,
        estimated_ready_minutes: 12,
        estimated_ready_at: '',
      }
    : null
)

function placeOrder() {
  if (!basket.quantity.value) return

  basketOpen.value = false
  placedOrder.value = {
    id: `showcase-${props.orderType}`,
    order_number: orderNumber.value,
    status: 'accepted',
    order_type: props.orderType,
    channel: 'kiosk',
  }
}

function resetOrder() {
  placedOrder.value = null
  basketOpen.value = false
  basket.clear()
}
</script>

<style scoped>
.showcase-kiosk-order {
  position: relative;
  display: grid;
  height: 100%;
  min-height: 0;
}

.showcase-kiosk-order__status {
  display: grid;
  min-height: 0;
  place-items: center;
  align-content: center;
  gap: calc(var(--spacing) * 6);
  padding: clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 12));
  overflow-y: auto;
}

.showcase-kiosk-order__basket {
  position: absolute;
  z-index: 30;
  inset-inline: clamp(1rem, 3vw, 2rem);
  bottom: max(1rem, env(safe-area-inset-bottom));
  display: grid;
  pointer-events: none;
}

.showcase-kiosk-order__basket :deep(.menu-order-basket-summary) {
  position: static;
  width: min(100%, 38rem);
  min-height: 4.25rem;
  pointer-events: auto;
}

@media (max-width: 700px) {
  .showcase-kiosk-order__basket {
    bottom: max(7rem, env(safe-area-inset-bottom));
  }
}
</style>
