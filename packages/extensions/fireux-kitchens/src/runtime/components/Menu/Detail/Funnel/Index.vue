<template>
  <div
    class="menu-order-funnel"
    :class="{ 'menu-order-funnel--panel': order.panelOpen }"
  >
    <button
      v-if="!order.panelOpen"
      type="button"
      class="menu-order-basket"
      :disabled="order.pending"
      :aria-label="order.actionLabel"
      @click="$emit('openPanel')"
    >
      <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
    </button>

    <section v-else class="menu-order-card" aria-live="polite">
      <header class="menu-order-header">
        <div>
          <p class="menu-order-step-label">
            {{ surfaceNumber }} of {{ surfaceCount }}
          </p>
          <h2>{{ surfaceTitle }}</h2>
        </div>

        <button
          type="button"
          class="menu-order-fold"
          aria-label="Fold order funnel away"
          @click="$emit('closePanel')"
        >
          <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
        </button>
      </header>

      <component :is="currentSurface" v-bind="currentSurfaceProps" />

      <footer class="menu-order-footer">
        <button
          type="button"
          class="menu-order-secondary"
          :disabled="surfaceNumber === 1"
          @click="previousSurface"
        >
          Back
        </button>

        <button
          type="button"
          class="menu-order-primary"
          :disabled="continueDisabled"
          @click="nextSurface"
        >
          Continue
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../models/menu/menu-ordering.model'
import Basket from './Basket.vue'
import Allergen from './Allergen.vue'
import DeliveryZone from './DeliveryZone.vue'
import Dispatch from './Dispatch.vue'
import Review from './Review.vue'
import Payment from './Payment.vue'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'closePanel'): void
  (event: 'openPanel'): void
}>()

const surfaceCount = 6
const surfaces = [
  Basket,
  Allergen,
  DeliveryZone,
  Dispatch,
  Review,
  Payment,
] as const
const surfaceTitles = [
  'Basket',
  'Allergy check',
  'Delivery area',
  'Dispatch',
  'Review',
  'Payment',
] as const
const surfaceChoices = ['1', '2', '3', '4', '5', '6'] as const
type SurfaceChoice = typeof surfaceChoices[number]
const allergenAccepted = ref(false)
const deliveryZoneReady = ref(false)
const deliveryState = ref<MenuOrderingDeliveryState>({ ready: false })
const { selected: surfaceChoice } = useStoredChoice<SurfaceChoice>({
  key: computed(() =>
    [
      'fireux:menu',
      props.order.kitchenSlug,
      props.order.menuId,
      'funnel-step',
      props.order.orderType,
    ].filter(Boolean).join(':')
  ),
  choices: surfaceChoices,
  fallback: '1',
})
const surfaceNumber = computed(() => Number(surfaceChoice.value))
const currentSurface = computed(() =>
  surfaces[surfaceNumber.value - 1] || Basket
)
const surfaceTitle = computed(() =>
  surfaceTitles[surfaceNumber.value - 1] || 'Order'
)
const currentSurfaceProps = computed(() => {
  if (surfaceNumber.value === 2) {
    return {
      modelValue: allergenAccepted.value,
      'onUpdate:modelValue': (value: boolean) => {
        allergenAccepted.value = value
      },
    }
  }

  if (surfaceNumber.value === 3) {
    return {
      order: props.order,
      'onUpdate:ready': (value: boolean) => {
        deliveryZoneReady.value = value
      },
      'onUpdate:delivery': (value: MenuOrderingDeliveryState) => {
        deliveryState.value = value
      },
    }
  }

  if (surfaceNumber.value === 4) {
    return {
      order: props.order,
      delivery: deliveryState.value,
    }
  }

  if (surfaceNumber.value === 1) {
    return { order: props.order }
  }

  return {}
})
const continueDisabled = computed(() =>
  surfaceNumber.value === surfaceCount ||
  (surfaceNumber.value === 2 && !allergenAccepted.value) ||
  (surfaceNumber.value === 3 && !deliveryZoneReady.value)
)

function previousSurface() {
  setSurfaceNumber(Math.max(1, surfaceNumber.value - 1))
}

function nextSurface() {
  if (continueDisabled.value) return
  setSurfaceNumber(Math.min(surfaceCount, surfaceNumber.value + 1))
}

function setSurfaceNumber(next: number) {
  surfaceChoice.value = String(next) as SurfaceChoice
}

watch(
  () => props.order.quantity,
  (quantity) => {
    if (!quantity) {
      allergenAccepted.value = false
      deliveryZoneReady.value = false
      deliveryState.value = { ready: false }
      setSurfaceNumber(1)
    }
  }
)
</script>
