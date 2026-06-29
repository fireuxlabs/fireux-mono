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
          <h2>Hello world</h2>
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

      <component :is="currentSurface" :order="order" />

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
          :disabled="surfaceNumber === surfaceCount"
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
import type { MenuOrderingFunnelState } from './types'
import OrderingFunnelBasket from './FunnelBasket.vue'
import FunnelSurface2 from './FunnelSurface2.vue'
import FunnelSurface3 from './FunnelSurface3.vue'
import FunnelSurface4 from './FunnelSurface4.vue'
import FunnelSurface5 from './FunnelSurface5.vue'
import FunnelSurface6 from './FunnelSurface6.vue'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

defineEmits<{
  (event: 'closePanel'): void
  (event: 'openPanel'): void
}>()

const surfaceCount = 6
const surfaces = [
  OrderingFunnelBasket,
  FunnelSurface2,
  FunnelSurface3,
  FunnelSurface4,
  FunnelSurface5,
  FunnelSurface6,
] as const
const surfaceNumber = ref(1)
const currentSurface = computed(() =>
  surfaces[surfaceNumber.value - 1] || OrderingFunnelBasket
)

function previousSurface() {
  surfaceNumber.value = Math.max(1, surfaceNumber.value - 1)
}

function nextSurface() {
  surfaceNumber.value = Math.min(surfaceCount, surfaceNumber.value + 1)
}

watch(
  () => props.order.panelOpen,
  (open) => {
    if (open) surfaceNumber.value = 1
  }
)
</script>
